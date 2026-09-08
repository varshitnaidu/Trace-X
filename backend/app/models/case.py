from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class SpfResult(BaseModel):
    status: Literal['PASS', 'FAIL', 'SOFTFAIL', 'NONE']
    detail: str


class DkimResult(BaseModel):
    status: Literal['PASS', 'FAIL', 'NONE']
    detail: str


class DmarcResult(BaseModel):
    status: Literal['PASS', 'FAIL', 'NONE']
    detail: str
    policy: str = "none"


class RelayHop(BaseModel):
    hop: int
    ip: str
    hostname: str
    country: str = "Unknown"
    city: str = "Unknown"
    asn: str = "Unknown"
    provider: str = "Unknown"
    delay: str = "0.0s"
    timestamp: str = ""
    confidence: int = 90
    isSuspicious: bool = False


class ExtractedUrl(BaseModel):
    url: str
    domain: str
    reputation: Literal['MALICIOUS', 'SUSPICIOUS', 'CLEAN'] = "CLEAN"
    indicators: List[str] = Field(default_factory=list)
    riskScore: int = 0


class DomainInfo(BaseModel):
    domain: str
    age: str = "Unknown"
    registrar: str = "Unknown"
    mxRecord: str = "None"
    isLookalike: bool = False
    reputation: str = "Clean"


class IpInfo(BaseModel):
    ip: str
    type: Literal['PUBLIC', 'PRIVATE'] = "PUBLIC"
    location: str = "Unknown"
    asn: str = "Unknown"
    provider: str = "Unknown"
    abuseScore: int = 0
    flag: str = "UN"


class ContributingFactor(BaseModel):
    factor: str
    weight: int
    type: Literal['critical', 'high', 'medium', 'low']


class AiExplanation(BaseModel):
    summary: str
    keyFindings: List[str] = Field(default_factory=list)
    investigationSteps: List[str] = Field(default_factory=list)
    attributionDisclaimer: str = (
        "Observed infrastructure and indicators reflect intermediate routing and publicly available threat feeds. "
        "Technical forensic evidence does not assert definitive human identity."
    )


class AttachmentMeta(BaseModel):
    filename: str
    mime_type: str
    size_bytes: int
    sha256: str
    is_suspicious: bool = False


class CaseModel(BaseModel):
    id: str
    date: str
    subject: str
    sender: str
    senderName: str
    returnPath: str
    replyTo: str
    classification: Literal['PHISHING', 'BEC', 'IMPERSONATION', 'MALWARE', 'BENIGN']
    severity: Literal['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    riskScore: int
    status: Literal['NEW', 'INVESTIGATING', 'CONFIRMED', 'MITIGATED', 'CLOSED'] = "NEW"
    analyst: str = "Sarah Jenkins (Senior SOC Lead)"
    campaignId: Optional[str] = None
    campaignName: Optional[str] = None
    sha256: str
    fileSize: str
    spf: SpfResult
    dkim: DkimResult
    dmarc: DmarcResult
    relays: List[RelayHop] = Field(default_factory=list)
    urls: List[ExtractedUrl] = Field(default_factory=list)
    domains: List[DomainInfo] = Field(default_factory=list)
    ips: List[IpInfo] = Field(default_factory=list)
    contributingFactors: List[ContributingFactor] = Field(default_factory=list)
    aiExplanation: AiExplanation
    attachments: List[AttachmentMeta] = Field(default_factory=list)
    raw_headers: Optional[dict] = None
    body_text_preview: Optional[str] = None
