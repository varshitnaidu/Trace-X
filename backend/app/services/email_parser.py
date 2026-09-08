import email
import re
import hashlib
from email.header import decode_header
from typing import Dict, Any, List, Optional
from app.models.case import AttachmentMeta


def decode_header_value(value: Optional[str]) -> str:
    """Decodes MIME encoded-words header syntax (RFC 2047)."""
    if not value:
        return ""
    try:
        decoded_parts = decode_header(value)
        result = []
        for part, encoding in decoded_parts:
            if isinstance(part, bytes):
                result.append(part.decode(encoding or "utf-8", errors="replace"))
            else:
                result.append(str(part))
        return "".join(result)
    except Exception:
        return str(value)


def sanitize_html(html_content: str) -> str:
    """
    Sanitizes untrusted HTML email content by stripping executable scripts,
    iframes, event handlers, and javascript: pseudo-protocol URIs.
    """
    if not html_content:
        return ""
    # Strip script and iframe tags completely
    sanitized = re.sub(r'(?i)<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', html_content)
    sanitized = re.sub(r'(?i)<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>', '', sanitized)
    sanitized = re.sub(r'(?i)<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>', '', sanitized)
    sanitized = re.sub(r'(?i)<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>', '', sanitized)
    # Strip inline on* event handlers (e.g., onload=, onerror=, onclick=)
    sanitized = re.sub(r'(?i)\s+on\w+\s*=\s*(["\'][^"\']*["\']|[^\s>]+)', '', sanitized)
    # Strip javascript: and vbscript: URIs
    sanitized = re.sub(r'(?i)href\s*=\s*(["\'])\s*javascript:[^"\']*\1', 'href="#"', sanitized)
    sanitized = re.sub(r'(?i)src\s*=\s*(["\'])\s*javascript:[^"\']*\1', 'src=""', sanitized)
    return sanitized


class ParsedEmail:
    def __init__(self):
        self.headers: Dict[str, Any] = {}
        self.raw_headers: Dict[str, str] = {}
        self.subject: str = ""
        self.from_header: str = ""
        self.sender_name: str = ""
        self.sender_email: str = ""
        self.to: str = ""
        self.cc: str = ""
        self.reply_to: str = ""
        self.return_path: str = ""
        self.date: str = ""
        self.message_id: str = ""
        self.received_headers: List[str] = []
        self.auth_results: str = ""
        self.received_spf: str = ""
        self.dkim_signatures: List[str] = []
        self.plain_body: str = ""
        self.html_body: str = ""
        self.sanitized_html: str = ""
        self.attachments: List[AttachmentMeta] = []


def parse_email_bytes(raw_bytes: bytes) -> ParsedEmail:
    """
    Parses raw RFC 5322 email bytes into structured metadata.
    Never executes or saves attachments to disk.
    """
    msg = email.message_from_bytes(raw_bytes)
    parsed = ParsedEmail()

    # Extract all raw headers
    for k, v in msg.items():
        parsed.raw_headers[k] = decode_header_value(v)

    # Standard headers
    parsed.subject = decode_header_value(msg.get("Subject", "(No Subject)"))
    parsed.from_header = decode_header_value(msg.get("From", ""))
    parsed.to = decode_header_value(msg.get("To", ""))
    parsed.cc = decode_header_value(msg.get("Cc", ""))
    parsed.reply_to = decode_header_value(msg.get("Reply-To", ""))
    parsed.return_path = decode_header_value(msg.get("Return-Path", ""))
    parsed.date = decode_header_value(msg.get("Date", ""))
    parsed.message_id = decode_header_value(msg.get("Message-ID", ""))
    parsed.auth_results = decode_header_value(msg.get("Authentication-Results", ""))
    parsed.received_spf = decode_header_value(msg.get("Received-SPF", ""))
    parsed.received_headers = [decode_header_value(h) for h in msg.get_all("Received", [])]
    parsed.dkim_signatures = [decode_header_value(h) for h in msg.get_all("DKIM-Signature", [])]

    # Parse From Display Name and Address
    from_match = re.match(r'^(.*?)\s*<([^>]+)>$', parsed.from_header.strip())
    if from_match:
        name = from_match.group(1).strip().strip('"').strip("'")
        addr = from_match.group(2).strip()
        parsed.sender_name = name or addr
        parsed.sender_email = addr
    else:
        parsed.sender_email = parsed.from_header.strip().strip('<>').strip()
        parsed.sender_name = parsed.sender_email

    # If Return-Path is empty, check envelope
    if not parsed.return_path and parsed.sender_email:
        parsed.return_path = parsed.sender_email

    # Extract payload / bodies / attachments
    plain_parts = []
    html_parts = []

    if msg.is_multipart():
        for part in msg.walk():
            content_disposition = str(part.get("Content-Disposition", ""))
            content_type = part.get_content_type()
            filename = part.get_filename()

            # Attachment handling
            if "attachment" in content_disposition or filename:
                safe_name = filename or "unnamed_attachment"
                payload = part.get_payload(decode=True) or b""
                sha256 = hashlib.sha256(payload).hexdigest()
                
                # Check suspicious extensions
                suspicious = bool(re.search(
                    r'\.(exe|scr|vbs|bat|cmd|ps1|iso|vhd|js|hta|jar|dll|bin|exe\.pdf|pdf\.exe|docm|xlsm)$',
                    safe_name,
                    re.IGNORECASE
                ))
                
                parsed.attachments.append(AttachmentMeta(
                    filename=safe_name,
                    mime_type=content_type,
                    size_bytes=len(payload),
                    sha256=sha256,
                    is_suspicious=suspicious
                ))
            elif content_type == "text/plain":
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or "utf-8"
                    plain_parts.append(payload.decode(charset, errors="replace"))
            elif content_type == "text/html":
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or "utf-8"
                    html_parts.append(payload.decode(charset, errors="replace"))
    else:
        content_type = msg.get_content_type()
        payload = msg.get_payload(decode=True)
        if payload:
            charset = msg.get_content_charset() or "utf-8"
            decoded_text = payload.decode(charset, errors="replace")
            if content_type == "text/html":
                html_parts.append(decoded_text)
            else:
                plain_parts.append(decoded_text)

    parsed.plain_body = "\n".join(plain_parts)
    parsed.html_body = "\n".join(html_parts)
    parsed.sanitized_html = sanitize_html(parsed.html_body)

    return parsed
