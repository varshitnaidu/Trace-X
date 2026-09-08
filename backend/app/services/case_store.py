from typing import List, Optional, Dict
from app.models.case import (
    CaseModel,
    SpfResult,
    DkimResult,
    DmarcResult,
    RelayHop,
    ExtractedUrl,
    DomainInfo,
    IpInfo,
    ContributingFactor,
    AiExplanation
)


class CaseStore:
    def __init__(self):
        self._cases: Dict[str, CaseModel] = {}
        self._initialize_seed_cases()

    def _initialize_seed_cases(self):
        c1 = CaseModel(
            id="CAS-2026-0091",
            date="2026-09-07 11:24 UTC",
            subject="URGENT: Executive Wire Transfer Confirmation - Invoice #88491",
            sender="ceo-office@paypaI-billing-service.net",
            senderName="Satya Nadella [CEO Executive Office]",
            returnPath="bounce-gateway@relay-server-91.ru",
            replyTo="financial-exec-settlement@proton.me",
            classification="BEC",
            severity="CRITICAL",
            riskScore=94,
            status="INVESTIGATING",
            analyst="Sarah Jenkins (Senior SOC Lead)",
            campaignId="CMP-FIN-2026-04",
            campaignName="ShadowWire Executive Impersonation",
            sha256="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            fileSize="42.8 KB",
            spf=SpfResult(status="FAIL", detail="IP 185.220.101.42 is not authorized under domain spf records."),
            dkim=DkimResult(status="FAIL", detail="Signature failed body hash verification (rsa-sha256 key mismatch)."),
            dmarc=DmarcResult(status="FAIL", detail="Domain alignment failed. From domain does not match SPF/DKIM envelope.", policy="reject"),
            relays=[
                RelayHop(hop=1, ip="185.220.101.42", hostname="tor-exit-relay-nl.nodehost.net", country="Netherlands", city="Amsterdam", asn="AS60729", provider="Zwiebelfreunde E.V. (Tor Exit Node)", delay="0.4s", timestamp="11:23:41 UTC", confidence=88, isSuspicious=True),
                RelayHop(hop=2, ip="194.26.29.110", hostname="vps-bulletproof-mow.ru", country="Russia", city="Moscow", asn="AS44050", provider="Petersburg Internet Network", delay="1.2s", timestamp="11:23:43 UTC", confidence=94, isSuspicious=True),
                RelayHop(hop=3, ip="142.250.190.27", hostname="mail-ed1-f27.google.com", country="United States", city="Mountain View", asn="AS15169", provider="Google LLC", delay="0.8s", timestamp="11:24:01 UTC", confidence=99, isSuspicious=False),
            ],
            urls=[
                ExtractedUrl(url="https://paypaI-billing-service.net/portal/invoice/auth-wire-confirm.php", domain="paypaI-billing-service.net", reputation="MALICIOUS", indicators=["Homoglyph (Latin I for l)", "Credential Harvester Path", "Known PhishTank IOC"], riskScore=96),
                ExtractedUrl(url="http://185.220.101.42/payload/invoice-doc-88491.exe.pdf", domain="185.220.101.42", reputation="MALICIOUS", indicators=["Raw IP URL", "Double extension executable disguise", "AbuseIPDB 100% confidence"], riskScore=99),
            ],
            domains=[
                DomainInfo(domain="paypaI-billing-service.net", age="3 days old (Registered 2026-09-04)", registrar="NameCheap Inc.", mxRecord="mail.paypaI-billing-service.net", isLookalike=True, reputation="Malicious / Typosquatting"),
            ],
            ips=[
                IpInfo(ip="185.220.101.42", type="PUBLIC", location="Amsterdam, Netherlands", asn="AS60729", provider="Zwiebelfreunde E.V. (Tor Exit Node)", abuseScore=94, flag="NL"),
                IpInfo(ip="194.26.29.110", type="PUBLIC", location="Moscow, Russia", asn="AS44050", provider="Petersburg Internet Network", abuseScore=89, flag="RU"),
            ],
            contributingFactors=[
                ContributingFactor(factor="DMARC alignment failure & spoofed envelope", weight=20, type="critical"),
                ContributingFactor(factor="Sender Display Name impersonating Executive C-Level", weight=15, type="critical"),
                ContributingFactor(factor="Known Tor Exit Relay in upstream SMTP Received hop", weight=15, type="high"),
                ContributingFactor(factor="Homoglyph lookalike domain (paypaI using uppercase I)", weight=15, type="critical"),
                ContributingFactor(factor="NLP BEC indicators: urgent bank wire request & secret settlement", weight=14, type="high"),
                ContributingFactor(factor="External bulletproof hosting relay with 89% Abuse confidence", weight=10, type="high"),
                ContributingFactor(factor="Reply-To points to disposable ProtonMail address", weight=5, type="medium"),
            ],
            aiExplanation=AiExplanation(
                summary="High-confidence Business Email Compromise (BEC) and brand spoofing attack. The adversary leverages a homoglyphic typosquatted domain (paypaI-billing-service.net) to impersonate executive leadership and request emergency international wire disbursement.",
                keyFindings=[
                    "Domain homoglyph disguises 'paypal' by replacing lowercase 'l' with uppercase 'I'.",
                    "Authentication tri-factor failed completely: SPF (Fail), DKIM (Fail), and DMARC (Reject policy breached).",
                    "Direct SMTP insertion originated from an anonymous Tor exit relay (185.220.101.42), routed through bulletproof Russian infrastructure.",
                    "Urgent financial settlement language matches known ShadowWire cyber-syndicate templates."
                ],
                investigationSteps=[
                    "Place immediate block on domain `paypaI-billing-service.net` at corporate perimeter email gateways.",
                    "Null-route traffic to IPs 185.220.101.42 and 194.26.29.110 on firewall border routers.",
                    "Confirm with finance department that no funds were remitted under invoice #88491.",
                    "Preserve EML artifact and export forensic dossier for regulatory submission."
                ]
            )
        )

        c2 = CaseModel(
            id="CAS-2026-0087",
            date="2026-09-06 18:10 UTC",
            subject="Action Required: Microsoft 365 Password Expiry Warning",
            sender="no-reply@security-microsoft-update365.com",
            senderName="Microsoft Security Team",
            returnPath="mailer@security-microsoft-update365.com",
            replyTo="support@security-microsoft-update365.com",
            classification="PHISHING",
            severity="HIGH",
            riskScore=78,
            status="CONFIRMED",
            analyst="Devon Vance",
            campaignId="CMP-M365-2026-11",
            campaignName="OfficeHarvester Global Campaign",
            sha256="9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
            fileSize="31.2 KB",
            spf=SpfResult(status="SOFTFAIL", detail="Domain records softfail for sending server."),
            dkim=DkimResult(status="NONE", detail="No DKIM signature found in header."),
            dmarc=DmarcResult(status="FAIL", detail="DMARC alignment failed (p=none).", policy="none"),
            relays=[
                RelayHop(hop=1, ip="45.154.255.88", hostname="vps45154.hostwinds.com", country="Germany", city="Frankfurt", asn="AS54290", provider="Hostwinds LLC", delay="1.1s", timestamp="18:09:44 UTC", confidence=85, isSuspicious=True)
            ],
            urls=[
                ExtractedUrl(url="https://security-microsoft-update365.com/login.aspx?auth=token991", domain="security-microsoft-update365.com", reputation="MALICIOUS", indicators=["Credential Phishing Form", "Typosquatted Brand"], riskScore=88)
            ],
            domains=[
                DomainInfo(domain="security-microsoft-update365.com", age="12 days old", registrar="Tucows Domains Inc.", mxRecord="mail.security-microsoft-update365.com", isLookalike=True, reputation="Malicious")
            ],
            ips=[
                IpInfo(ip="45.154.255.88", type="PUBLIC", location="Frankfurt, Germany", asn="AS54290", provider="Hostwinds LLC", abuseScore=74, flag="DE")
            ],
            contributingFactors=[
                ContributingFactor(factor="Brand impersonation: Microsoft 365 security notification", weight=25, type="critical"),
                ContributingFactor(factor="Phishing login credential URL targeting corporate SSO", weight=25, type="critical"),
                ContributingFactor(factor="Newly registered domain (< 15 days old)", weight=15, type="high"),
                ContributingFactor(factor="DKIM signature absent & SPF Softfail", weight=13, type="medium"),
            ],
            aiExplanation=AiExplanation(
                summary="Credential harvesting phishing email designed to emulate corporate Microsoft 365 SSO portal notifications.",
                keyFindings=[
                    "Domain `security-microsoft-update365.com` is an unauthorized third-party lookalike.",
                    "Target URL leads directly to a reverse-proxy credential capture page (Evilginx-style).",
                    "Sender is not associated with legitimate Microsoft IP ranges."
                ],
                investigationSteps=[
                    "Revoke active session tokens for any users who clicked the destination URL.",
                    "Add domain to web gateway DNS blocklist.",
                    "Reset user Active Directory password."
                ]
            )
        )

        c3 = CaseModel(
            id="CAS-2026-0072",
            date="2026-09-05 09:15 UTC",
            subject="Monthly All-Hands Meeting Agenda & Slide Deck",
            sender="internal-comms@company.org",
            senderName="Internal Communications Team",
            returnPath="internal-comms@company.org",
            replyTo="internal-comms@company.org",
            classification="BENIGN",
            severity="LOW",
            riskScore=12,
            status="CLOSED",
            analyst="System Automated Triage",
            sha256="5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
            fileSize="18.4 KB",
            spf=SpfResult(status="PASS", detail="Sender IP is in authorized SPF CIDR block."),
            dkim=DkimResult(status="PASS", detail="Signature verified with selector k1."),
            dmarc=DmarcResult(status="PASS", detail="Full alignment verified with p=reject policy.", policy="reject"),
            relays=[
                RelayHop(hop=1, ip="209.85.220.41", hostname="mail-sor-f41.google.com", country="United States", city="Council Bluffs", asn="AS15169", provider="Google LLC", delay="0.3s", timestamp="09:14:55 UTC", confidence=99, isSuspicious=False)
            ],
            urls=[
                ExtractedUrl(url="https://intranet.company.org/all-hands/2026-09", domain="intranet.company.org", reputation="CLEAN", indicators=["Internal Corporate Domain", "Valid SSL/TLS"], riskScore=0)
            ],
            domains=[
                DomainInfo(domain="company.org", age="8 years old", registrar="MarkMonitor Inc.", mxRecord="aspmx.l.google.com", isLookalike=False, reputation="Reputable / Internal")
            ],
            ips=[
                IpInfo(ip="209.85.220.41", type="PUBLIC", location="Council Bluffs, US", asn="AS15169", provider="Google LLC", abuseScore=0, flag="US")
            ],
            contributingFactors=[
                ContributingFactor(factor="All authentication checks passed cleanly (SPF, DKIM, DMARC)", weight=0, type="low"),
                ContributingFactor(factor="No suspicious linguistic or financial keywords detected", weight=0, type="low"),
            ],
            aiExplanation=AiExplanation(
                summary="Legitimate internal corporate communication with authenticated routing and trusted domain history.",
                keyFindings=[
                    "MIME headers show flawless SPF, DKIM, and DMARC alignment.",
                    "Links point exclusively to approved internal corporate web properties.",
                    "No malicious indicators detected across all threat intel sources."
                ],
                investigationSteps=[
                    "No analyst action required. Case automatically closed as benign."
                ]
            )
        )

        self._cases[c1.id] = c1
        self._cases[c2.id] = c2
        self._cases[c3.id] = c3

    def get_all_cases(self) -> List[CaseModel]:
        return list(self._cases.values())

    def get_case_by_id(self, case_id: str) -> Optional[CaseModel]:
        return self._cases.get(case_id)

    def save_case(self, case: CaseModel) -> CaseModel:
        self._cases[case.id] = case
        return case


case_store = CaseStore()
