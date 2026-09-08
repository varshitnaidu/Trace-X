import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Body, HTTPException, status, Depends

from app.core.config import settings
from app.core.dependencies import get_optional_current_user
from app.models.auth import User
from app.models.case import CaseModel
from app.models.analysis import RawEmailAnalyzeRequest
from app.services.evidence import calculate_sha256, format_file_size, create_evidence_record
from app.services.email_parser import parse_email_bytes
from app.services.header_analyzer import (
    parse_received_headers,
    check_header_mismatches,
    extract_domain
)
from app.services.authentication_analyzer import parse_authentication_headers
from app.services.ioc_extractor import extract_all_iocs
from app.services.risk_engine import risk_engine
from app.services.explainability import generate_case_explanation
from app.services.campaign_engine import campaign_engine
from app.services.audit_ledger import audit_ledger
from app.services.case_store import case_store

router = APIRouter()


async def process_email_bytes(
    raw_bytes: bytes,
    filename: str,
    actor_email: str,
    live_mode: bool
) -> CaseModel:
    """Core forensic processing pipeline for uploaded email bytes."""
    if not raw_bytes or len(raw_bytes.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "EMPTY_EMAIL", "message": "The uploaded email file is empty."}
        )

    if len(raw_bytes) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail={"code": "FILE_TOO_LARGE", "message": f"Email exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_BYTES / (1024*1024)} MB."}
        )

    # 1. Evidence SHA-256 byte precision
    sha256_hash = calculate_sha256(raw_bytes)
    file_size_str = format_file_size(len(raw_bytes))
    case_num = str(uuid.uuid4().int)[:4].zfill(4)
    case_id = f"CAS-2026-{case_num}"

    # 2. RFC 5322 MIME Parsing
    try:
        parsed = parse_email_bytes(raw_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "PARSING_FAILED", "message": f"Unable to parse email RFC headers: {str(e)}"}
        )

    sender_domain = extract_domain(parsed.sender_email)

    # 3. Header Forensics & Received Chain
    header_findings = check_header_mismatches(
        from_header=parsed.from_header,
        sender_name=parsed.sender_name,
        sender_email=parsed.sender_email,
        reply_to=parsed.reply_to,
        return_path=parsed.return_path
    )
    relay_hops = parse_received_headers(parsed.received_headers)

    # 4. Authentication (SPF, DKIM, DMARC)
    spf, dkim, dmarc = parse_authentication_headers(
        auth_results=parsed.auth_results,
        received_spf=parsed.received_spf,
        dkim_signatures=parsed.dkim_signatures,
        sender_domain=sender_domain
    )

    # 5. Extract Indicators (IOCs)
    urls, domains, ips = extract_all_iocs(
        headers_dict=parsed.raw_headers,
        plain_body=parsed.plain_body,
        html_body=parsed.html_body,
        relay_hops=relay_hops
    )

    # 6. Hybrid Risk Engine Scoring
    risk_score, severity, classification, contributing_factors = risk_engine.evaluate(
        spf=spf,
        dkim=dkim,
        dmarc=dmarc,
        header_findings=header_findings,
        relays=relay_hops,
        urls=urls,
        attachments=parsed.attachments,
        plain_body=parsed.plain_body,
        subject=parsed.subject
    )

    # 7. AI Explainability & Actionable Investigation Guidance
    ai_explanation = await generate_case_explanation(
        subject=parsed.subject,
        sender_name=parsed.sender_name,
        sender_email=parsed.sender_email,
        classification=classification,
        severity=severity,
        risk_score=risk_score,
        contributing_factors=contributing_factors,
        urls=urls,
        relays=relay_hops
    )

    timestamp_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    # 8. Build Case Object
    case = CaseModel(
        id=case_id,
        date=timestamp_str,
        subject=parsed.subject or "(No Subject)",
        sender=parsed.sender_email or "unknown@sender.local",
        senderName=parsed.sender_name or parsed.sender_email or "Unknown Sender",
        returnPath=parsed.return_path or parsed.sender_email,
        replyTo=parsed.reply_to,
        classification=classification,
        severity=severity,
        riskScore=risk_score,
        status="NEW",
        analyst=actor_email,
        sha256=sha256_hash,
        fileSize=file_size_str,
        spf=spf,
        dkim=dkim,
        dmarc=dmarc,
        relays=relay_hops,
        urls=urls,
        domains=domains,
        ips=ips,
        contributingFactors=contributing_factors,
        aiExplanation=ai_explanation,
        attachments=parsed.attachments,
        raw_headers=parsed.raw_headers,
        body_text_preview=parsed.plain_body[:500] if parsed.plain_body else ""
    )

    # 9. Campaign Correlation
    campaign_engine.correlate_case(case)

    # 10. Audit Ledger Seal
    audit_ledger.record_event(
        analyst=actor_email,
        action="EMAIL_ANALYSIS_EXECUTED",
        resource=f"{case.id} / {case.sha256[:8]}...{case.sha256[-4:]}",
        status="SUCCESS"
    )

    # 11. Save Case
    case_store.save_case(case)

    return case


@router.post("/analyze", response_model=CaseModel, summary="Analyze Email (.eml or multipart)")
async def analyze_email(
    file: Optional[UploadFile] = File(None),
    raw_content: Optional[str] = Form(None),
    live: Optional[bool] = Form(None),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Accepts raw RFC email content via multipart file upload (.eml) or raw text form data.
    Computes exact SHA-256, parses MIME, extracts headers and authentication, reconstructs
    transmission hops, extracts IOCs, calculates hybrid risk score, and seals evidence in audit ledger.
    """
    actor = current_user.email if current_user else settings.DEMO_ANALYST_EMAIL
    is_live = live if live is not None else (not settings.DEMO_MODE)

    if file:
        filename = file.filename or "uploaded_email.eml"
        if not (filename.endswith(".eml") or filename.endswith(".txt") or filename.endswith(".msg")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "INVALID_EXTENSION", "message": "Only .eml, .txt, or RFC message files are supported."}
            )
        bytes_data = await file.read()
        return await process_email_bytes(bytes_data, filename, actor, is_live)

    elif raw_content and raw_content.strip():
        bytes_data = raw_content.encode("utf-8")
        return await process_email_bytes(bytes_data, "pasted_email.eml", actor, is_live)

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "NO_INPUT", "message": "Please provide an email file or raw email text content."}
        )


@router.post("/analyze/raw", response_model=CaseModel, summary="Analyze Raw Email Content (JSON)")
async def analyze_raw_email(
    request: RawEmailAnalyzeRequest,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """JSON API endpoint for analyzing pasted raw email text content."""
    actor = current_user.email if current_user else settings.DEMO_ANALYST_EMAIL
    is_live = request.live if request.live is not None else (not settings.DEMO_MODE)
    bytes_data = request.raw_content.encode("utf-8")
    return await process_email_bytes(bytes_data, request.filename or "raw_email.eml", actor, is_live)
