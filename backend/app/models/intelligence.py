from typing import List, Optional
from pydantic import BaseModel


class IndicatorLookupRequest(BaseModel):
    indicator: str
    type: Optional[str] = None  # 'ip' | 'domain' | 'url' | 'hash' | None (auto-detect)


class ThreatSourceResult(BaseModel):
    name: str
    status: str
    verdict: str  # 'MALICIOUS' | 'SUSPICIOUS' | 'CLEAN' | 'NEUTRAL' | 'UNAVAILABLE'


class IndicatorLookupResponse(BaseModel):
    indicator: str
    type: str
    reputation: str  # 'MALICIOUS' | 'SUSPICIOUS' | 'CLEAN' | 'UNKNOWN'
    abuseConfidenceScore: int
    totalReports: int
    country: str
    asn: str
    usageType: str
    sources: List[ThreatSourceResult]


class ProviderStatus(BaseModel):
    name: str
    status: str
    configured: bool
    quota: str
    latency: str
