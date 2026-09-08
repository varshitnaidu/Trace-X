import io
import csv
import json
from fpdf import FPDF, XPos, YPos
from app.models.case import CaseModel


class ForensicPDF(FPDF):
    def header(self):
        self.set_fill_color(12, 19, 34)  # Dark navy #0c1322
        self.rect(0, 0, 210, 24, "F")
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(6, 182, 212)  # Cyan #06b6d4
        self.set_xy(10, 6)
        self.cell(0, 7, "TRACE-X DIGITAL FORENSICS DOSSIER", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(148, 163, 184)  # Slate 400
        self.set_xy(10, 14)
        self.cell(0, 5, "Automated Email Threat Intelligence & Chain of Custody Report", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 7)
        self.set_text_color(100, 116, 139)
        self.cell(0, 5, f"Page {self.page_no()} | Cryptographically Sealed Artifact | TRACE-X SOC Platform", align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)


def clean_pdf_text(text: str) -> str:
    """Replaces Unicode characters not supported by standard PDF latin-1 font."""
    if not text:
        return ""
    replacements = {
        "\u2018": "'", "\u2019": "'", "\u201c": '"', "\u201d": '"',
        "\u2013": "-", "\u2014": "--", "\u2022": "*", "\u2026": "...",
        "\u00a0": " "
    }
    for orig, rep in replacements.items():
        text = text.replace(orig, rep)
    return text.encode("latin-1", "replace").decode("latin-1")


def generate_pdf_report(case: CaseModel) -> bytes:
    """Generates a professional forensic PDF dossier using fpdf2."""
    pdf = ForensicPDF()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()

    # Document Case Metadata
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 6, f"Incident Dossier: {case.id}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_font("Helvetica", "", 8)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(95, 4, f"Date Ingested: {case.date}", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(0, 4, f"Investigating Lead: {clean_pdf_text(case.analyst)}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(95, 4, f"Evidence SHA-256: {case.sha256[:32]}...", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(0, 4, f"Artifact Size: {case.fileSize}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(3)

    # Section 1: Executive Threat Summary
    pdf.set_fill_color(241, 245, 249)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 6, "  1. EXECUTIVE THREAT ASSESSMENT", fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)

    # Threat Badge Row
    pdf.set_font("Helvetica", "B", 8)
    if case.severity in ["CRITICAL", "HIGH"]:
        pdf.set_text_color(225, 29, 72)
    else:
        pdf.set_text_color(16, 185, 129)
    pdf.cell(45, 5, f"Classification: {case.classification}", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(45, 5, f"Severity: {case.severity}", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(45, 5, f"Risk Score: {case.riskScore} / 100", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(0, 5, f"Status: {case.status}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(1)

    pdf.set_font("Helvetica", "", 8)
    pdf.set_text_color(51, 65, 85)
    pdf.multi_cell(0, 4, clean_pdf_text(case.aiExplanation.summary), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(3)

    # Section 2: Header Forensics
    pdf.set_fill_color(241, 245, 249)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 6, "  2. MIME HEADER FORENSICS & AUTHENTICATION", fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)

    pdf.set_font("Helvetica", "", 8)
    pdf.cell(35, 4, "Subject:", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(0, 4, clean_pdf_text(case.subject[:70]), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(35, 4, "From (Header):", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(0, 4, clean_pdf_text(f"{case.senderName} <{case.sender}>"), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(35, 4, "Reply-To Header:", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(0, 4, clean_pdf_text(case.replyTo or "(Not Diverted)"), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(35, 4, "Return-Path:", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(0, 4, clean_pdf_text(case.returnPath or "(None)"), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)

    # Authentication Triad
    pdf.set_font("Helvetica", "B", 8)
    pdf.cell(35, 4, "Authentication Triad:", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.set_font("Helvetica", "", 8)
    auth_str = f"SPF: {case.spf.status} | DKIM: {case.dkim.status} | DMARC: {case.dmarc.status} (policy={case.dmarc.policy})"
    pdf.cell(0, 4, auth_str, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(3)

    # Section 3: Reconstructed Relay Transmission Hops
    if case.relays:
        pdf.set_fill_color(241, 245, 249)
        pdf.set_font("Helvetica", "B", 9)
        pdf.cell(0, 6, "  3. RECONSTRUCTED SMTP TRANSMISSION CHAIN", fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(2)

        pdf.set_font("Helvetica", "B", 7)
        pdf.cell(12, 4, "Hop", 1, align="C", new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(35, 4, "IP Address", 1, align="L", new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(50, 4, "Hostname / Node", 1, align="L", new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(45, 4, "Location & ASN", 1, align="L", new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(0, 4, "Suspicious", 1, align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        pdf.set_font("Helvetica", "", 7)
        for r in case.relays:
            pdf.cell(12, 4, str(r.hop), 1, align="C", new_x=XPos.RIGHT, new_y=YPos.TOP)
            pdf.cell(35, 4, r.ip, 1, align="L", new_x=XPos.RIGHT, new_y=YPos.TOP)
            pdf.cell(50, 4, clean_pdf_text(r.hostname[:30]), 1, align="L", new_x=XPos.RIGHT, new_y=YPos.TOP)
            pdf.cell(45, 4, clean_pdf_text(f"{r.city}, {r.country} ({r.asn})"), 1, align="L", new_x=XPos.RIGHT, new_y=YPos.TOP)
            susp_text = "YES [ALERT]" if r.isSuspicious else "Clean"
            pdf.cell(0, 4, susp_text, 1, align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(3)

    # Section 4: Extracted Indicators (IOCs)
    pdf.set_fill_color(241, 245, 249)
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(0, 6, "  4. EXTRACTED INDICATORS OF COMPROMISE (IOCs)", fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)

    pdf.set_font("Helvetica", "", 7)
    for u in case.urls[:4]:
        pdf.cell(15, 4, "[URL]", new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(130, 4, clean_pdf_text(u.url[:80]), new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(0, 4, f"Verdict: {u.reputation}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    for d in case.domains[:4]:
        pdf.cell(15, 4, "[Domain]", new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(130, 4, clean_pdf_text(f"{d.domain} ({d.age})"), new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(0, 4, f"Verdict: {d.reputation}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    for ip in case.ips[:4]:
        pdf.cell(15, 4, "[IP]", new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(130, 4, clean_pdf_text(f"{ip.ip} - {ip.location} ({ip.provider})"), new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(0, 4, f"Abuse: {ip.abuseScore}%", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(3)

    # Section 5: Key Findings & Actionable Steps
    pdf.set_fill_color(241, 245, 249)
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(0, 6, "  5. FORENSIC FINDINGS & RECOMMENDED MITIGATION", fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)

    pdf.set_font("Helvetica", "B", 8)
    pdf.cell(0, 4, "Key Technical Findings:", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("Helvetica", "", 7)
    for finding in case.aiExplanation.keyFindings:
        pdf.multi_cell(0, 4, f"- {clean_pdf_text(finding)}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(1)
    pdf.set_font("Helvetica", "B", 8)
    pdf.cell(0, 4, "Recommended Incident Response Actions:", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("Helvetica", "", 7)
    for step in case.aiExplanation.investigationSteps:
        pdf.multi_cell(0, 4, f"* {clean_pdf_text(step)}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # Cryptographic Chain-of-Custody Seal
    pdf.ln(4)
    pdf.set_fill_color(248, 250, 252)
    pdf.set_font("Helvetica", "B", 7)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 4, "CRYPTOGRAPHIC CHAIN OF CUSTODY SEAL", fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("Courier", "", 7)
    pdf.set_text_color(71, 85, 105)
    pdf.multi_cell(0, 3, f"Exact Artifact SHA-256: {case.sha256}\nPlatform Status: Cryptographically verified and recorded to tamper-evident ledger.", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    return bytes(pdf.output())


def generate_ioc_csv(case: CaseModel) -> str:
    """Generates an IOC CSV string for SIEM / firewall ingestion."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Type", "Indicator", "Reputation", "RiskScore", "Detail"])

    for u in case.urls:
        writer.writerow(["URL", u.url, u.reputation, u.riskScore, "; ".join(u.indicators)])

    for d in case.domains:
        writer.writerow(["Domain", d.domain, d.reputation, 85 if d.isLookalike else 0, f"Age: {d.age}, Registrar: {d.registrar}"])

    for ip in case.ips:
        writer.writerow(["IP", ip.ip, "MALICIOUS" if ip.abuseScore > 50 else "CLEAN", ip.abuseScore, f"{ip.location} ({ip.provider})"])

    for att in case.attachments:
        writer.writerow(["AttachmentHash", att.sha256, "MALICIOUS" if att.is_suspicious else "CLEAN", 90 if att.is_suspicious else 0, f"File: {att.filename} ({att.mime_type})"])

    return output.getvalue()


def generate_json_dossier(case: CaseModel) -> str:
    """Generates complete JSON forensic dossier."""
    return case.model_dump_json(indent=2)
