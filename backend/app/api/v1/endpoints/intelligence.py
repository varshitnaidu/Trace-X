from typing import List
from fastapi import APIRouter
from app.models.intelligence import (
    IndicatorLookupRequest,
    IndicatorLookupResponse,
    ProviderStatus
)
from app.services.threat_intelligence import threat_intel_service

router = APIRouter()


@router.post("/intelligence/lookup", response_model=IndicatorLookupResponse, summary="Query Multi-Source Threat Intelligence")
async def lookup_indicator(request: IndicatorLookupRequest):
    """
    Queries live and cached threat intelligence feeds (VirusTotal, AbuseIPDB, URLhaus, PhishTank, RDAP).
    Returns normalized reputation, abuse confidence score, ASN, country, and provider verdicts.
    """
    return await threat_intel_service.lookup_indicator(request.indicator, request.type)


@router.get("/intelligence/providers", response_model=List[ProviderStatus], summary="Threat Feed Provider Connectivity")
async def get_providers():
    """Returns active connectivity, configuration state, and quotas for threat intelligence providers."""
    return threat_intel_service.get_provider_statuses()
