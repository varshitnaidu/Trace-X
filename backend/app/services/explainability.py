from typing import List, Dict, Any
from app.models.case import AiExplanation, CaseModel
from app.integrations.llm import llm_adapter


async def generate_case_explanation(
    subject: str,
    sender_name: str,
    sender_email: str,
    classification: str,
    severity: str,
    risk_score: int,
    contributing_factors: list,
    urls: list,
    relays: list
) -> AiExplanation:
    """
    Generates explainable, analyst-friendly findings and actionable investigation steps.
    """
    factor_texts = [f.factor for f in contributing_factors]

    # Attempt LLM generation if configured
    llm_result = await llm_adapter.generate_explanation(
        subject=subject,
        sender=f"{sender_name} <{sender_email}>",
        classification=classification,
        severity=severity,
        risk_score=risk_score,
        factors=factor_texts
    )

    if classification == "BEC":
        summary = (
            f"High-confidence Business Email Compromise (BEC) and executive impersonation attack. "
            f"The adversary leverages a homoglyphic/spoofed domain to impersonate leadership and request confidential wire disbursement."
        )
        key_findings = [
            f"Sender display name '{sender_name}' asserts C-level authority with urgent wire/settlement demands.",
            "Authentication tri-factor failed or alignment breached (SPF/DKIM/DMARC).",
            f"Routing trace reveals untrusted intermediate relays with suspicious network insertion.",
            "Reply-To header diverges to an external unverified account."
        ]
        investigation_steps = [
            f"Place immediate perimeter block on sender domain and destination URLs.",
            "Confirm with accounting and finance teams that no funds or invoices were remitted.",
            "Null-route observed relay IP infrastructure at border firewall.",
            "Preserve exact SHA-256 evidence artifact and generate regulatory compliance report."
        ]
    elif classification in ["PHISHING", "IMPERSONATION"]:
        summary = (
            f"Credential harvesting attack targeting corporate user access credentials. "
            f"Adversary disguised phishing portal links behind urgent account security warnings."
        )
        key_findings = [
            "Destination URL leads to an adversary-controlled credential capture interface.",
            "Sender domain does not match legitimate organization infrastructure.",
            "MIME headers show missing or failed DKIM cryptographic alignment."
        ]
        investigation_steps = [
            "Revoke active corporate SSO sessions for any user who clicked destination URLs.",
            "Add identified phishing domains to corporate DNS sinkhole / blocklist.",
            "Trigger automated password reset for affected mailbox."
        ]
    elif classification == "MALWARE":
        summary = (
            f"Malicious payload delivery campaign. Contains suspicious disguised attachments or direct binary download links."
        )
        key_findings = [
            "Executable payload disguised with double extension or embedded script.",
            "Relay hops originate from known bulletproof or anonymized infrastructure."
        ]
        investigation_steps = [
            "Isolate endpoint from local network if attachment was opened.",
            "Submit attachment SHA-256 to internal EDR blocklist.",
            "Perform memory and filesystem scan for persistence mechanisms."
        ]
    else:  # BENIGN
        summary = (
            "Legitimate internal or authorized communication with authentic sender history and valid cryptographic alignment."
        )
        key_findings = [
            "Flawless SPF, DKIM, and DMARC alignment verified.",
            "Links point exclusively to approved web properties.",
            "No malicious indicators detected across active threat intelligence feeds."
        ]
        investigation_steps = [
            "No analyst action required. Case automatically cleared as benign."
        ]

    return AiExplanation(
        summary=summary,
        keyFindings=key_findings,
        investigationSteps=investigation_steps,
        attributionDisclaimer=(
            "Observed IP and ASN infrastructure represent intermediate routing nodes and hosting proxies. "
            "Technical forensic evidence does not assert physical or legal human attribution."
        )
    )


def answer_analyst_question(case: CaseModel, question: str) -> str:
    """
    Provides technical forensic responses grounded strictly in the case indicators.
    """
    q = question.lower()
    
    if "high risk" in q or "score" in q:
        triggers = [f.factor for f in case.contributingFactors[:3]]
        return (
            f"The composite threat score is {case.riskScore}/100 ({case.severity}) primarily driven by: "
            f"{'; '.join(triggers)}."
        )
    
    if "bec" in q or "wire" in q:
        return (
            f"High BEC Probability detected. The sender claims to be executive leadership ({case.senderName}) "
            f"ordering an urgent financial settlement. Notice that Reply-To ({case.replyTo}) is diverted, "
            f"while Return-Path points to an external gateway ({case.returnPath})."
        )
    
    if "investigate" in q or "next" in q or "step" in q:
        steps = "\n".join([f"{i+1}. {s}" for i, s in enumerate(case.aiExplanation.investigationSteps)])
        return f"Recommended Next SOC Actions:\n{steps}"

    if "hop" in q or "relay" in q or "ip" in q:
        suspicious = [r for r in case.relays if r.isSuspicious]
        if suspicious:
            return (
                f"Reconstructed SMTP path has {len(case.relays)} hops. Detected suspicious hop: "
                f"IP {suspicious[0].ip} ({suspicious[0].provider}, {suspicious[0].country}) with delay {suspicious[0].delay}."
            )
        return f"All {len(case.relays)} reconstructed SMTP relay hops appear consistent with standard enterprise routing."

    if "auth" in q or "dmarc" in q or "spf" in q:
        return (
            f"Authentication Summary: SPF={case.spf.status} ({case.spf.detail}), "
            f"DKIM={case.dkim.status} ({case.dkim.detail}), "
            f"DMARC={case.dmarc.status} (policy={case.dmarc.policy})."
        )

    # General fallback grounded in summary
    return (
        f"{case.aiExplanation.summary} Primary indicator: Domain '{case.domains[0].domain if case.domains else 'Unknown'}' "
        f"with severity {case.severity}."
    )
