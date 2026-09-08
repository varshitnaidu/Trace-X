import re
from typing import List, Tuple, Dict, Any, Literal
from app.core.config import settings
from app.models.case import (
    SpfResult,
    DkimResult,
    DmarcResult,
    ContributingFactor,
    RelayHop,
    ExtractedUrl,
    AttachmentMeta
)


class RiskEngine:
    def __init__(self, weights: Dict[str, int] = None):
        self.weights = weights or settings.RISK_WEIGHTS

    def evaluate(
        self,
        spf: SpfResult,
        dkim: DkimResult,
        dmarc: DmarcResult,
        header_findings: List[Dict[str, Any]],
        relays: List[RelayHop],
        urls: List[ExtractedUrl],
        attachments: List[AttachmentMeta],
        plain_body: str,
        subject: str
    ) -> Tuple[int, Literal['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], Literal['PHISHING', 'BEC', 'IMPERSONATION', 'MALWARE', 'BENIGN'], List[ContributingFactor]]:
        factors: List[ContributingFactor] = []
        score = 0

        # 1. Authentication evaluation
        if dmarc.status == "FAIL":
            w = self.weights.get("dmarc_failure", 15)
            score += w
            factors.append(ContributingFactor(factor="DMARC alignment failure & spoofed envelope", weight=w, type="critical"))
        elif dmarc.status == "NONE" and spf.status != "PASS":
            w = 5
            score += w
            factors.append(ContributingFactor(factor="DMARC policy absent on sender domain", weight=w, type="medium"))

        if spf.status in ["FAIL", "SOFTFAIL"]:
            w = self.weights.get("spf_failure", 15)
            score += w
            factors.append(ContributingFactor(factor=f"SPF record validation failure ({spf.status})", weight=w, type="high"))

        if dkim.status == "FAIL":
            w = self.weights.get("dkim_failure", 15)
            score += w
            factors.append(ContributingFactor(factor="DKIM cryptographic body signature verification failed", weight=w, type="high"))
        elif dkim.status == "NONE" and spf.status != "PASS":
            w = 8
            score += w
            factors.append(ContributingFactor(factor="DKIM signature absent in message headers", weight=w, type="medium"))

        # 2. Header findings (Mismatches, Executive spoofing, Homoglyphs)
        for h in header_findings:
            t = h.get("type")
            if t == "REPLY_TO_MISMATCH":
                w = self.weights.get("reply_to_mismatch", 10)
                score += w
                factors.append(ContributingFactor(factor=h["description"], weight=w, type="medium"))
            elif t == "RETURN_PATH_MISMATCH":
                w = self.weights.get("return_path_mismatch", 10)
                score += w
                factors.append(ContributingFactor(factor=h["description"], weight=w, type="medium"))
            elif t == "EXECUTIVE_SPOOFING":
                w = 15
                score += w
                factors.append(ContributingFactor(factor=h["description"], weight=w, type="critical"))
            elif t == "LOOKALIKE_DOMAIN":
                w = self.weights.get("lookalike_domain", 15)
                score += w
                factors.append(ContributingFactor(factor=h["description"], weight=w, type="critical"))

        # 3. Transmission Relay Hops
        tor_or_suspicious = [r for r in relays if r.isSuspicious]
        if tor_or_suspicious:
            w = self.weights.get("tor_anonymizer_relay", 15)
            score += w
            factors.append(ContributingFactor(
                factor=f"Untrusted relay hop detected: {tor_or_suspicious[0].provider} ({tor_or_suspicious[0].ip})",
                weight=w,
                type="high"
            ))

        # 4. URL Threat Analysis
        malicious_urls = [u for u in urls if u.reputation == "MALICIOUS"]
        raw_ip_urls = [u for u in urls if any("Raw IP" in ind for ind in u.indicators)]
        if raw_ip_urls:
            w = self.weights.get("raw_ip_url", 15)
            score += w
            factors.append(ContributingFactor(factor="Raw IP address URL detected in email body", weight=w, type="critical"))
        elif malicious_urls:
            w = 15
            score += w
            factors.append(ContributingFactor(factor=f"Malicious credential harvesting link: {malicious_urls[0].url[:45]}...", weight=w, type="critical"))

        # 5. Attachments
        suspicious_attachments = [a for a in attachments if a.is_suspicious]
        if suspicious_attachments:
            w = self.weights.get("suspicious_attachment", 15)
            score += w
            factors.append(ContributingFactor(
                factor=f"Suspicious executable or disguised attachment: {suspicious_attachments[0].filename}",
                weight=w,
                type="critical"
            ))

        # 6. Linguistic Urgency & BEC Indicators
        text_corpus = f"{subject} {plain_body}".lower()
        bec_patterns = [
            r'wire transfer', r'wire authorization', r'urgent wire', r'confidential settlement',
            r'invoice #[0-9]+', r'immediate payment', r'bank transfer', r'overdue invoice'
        ]
        matched_bec = [p for p in bec_patterns if re.search(p, text_corpus)]
        if matched_bec:
            w = self.weights.get("bec_keywords", 10)
            score += w
            factors.append(ContributingFactor(
                factor=f"BEC indicators detected: {', '.join(matched_bec[:2])} with executive urgency",
                weight=w,
                type="high"
            ))

        # Cap score at 100
        final_score = min(max(score, 0), 100)

        # Classification & Severity Mapping
        if final_score >= 75:
            severity = "CRITICAL"
            if matched_bec or any(h.get("type") == "EXECUTIVE_SPOOFING" for h in header_findings):
                classification = "BEC"
            elif suspicious_attachments:
                classification = "MALWARE"
            else:
                classification = "PHISHING"
        elif final_score >= 50:
            severity = "HIGH"
            if suspicious_attachments:
                classification = "MALWARE"
            else:
                classification = "PHISHING"
        elif final_score >= 25:
            severity = "MEDIUM"
            classification = "IMPERSONATION" if any(h.get("type") == "LOOKALIKE_DOMAIN" for h in header_findings) else "PHISHING"
        else:
            severity = "LOW"
            classification = "BENIGN"
            if not factors:
                factors.append(ContributingFactor(factor="All authentication checks passed cleanly (SPF, DKIM, DMARC)", weight=0, type="low"))
                factors.append(ContributingFactor(factor="No suspicious linguistic or financial keywords detected", weight=0, type="low"))

        return final_score, severity, classification, factors


risk_engine = RiskEngine()
