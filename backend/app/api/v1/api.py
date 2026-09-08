from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    auth,
    analysis,
    cases,
    intelligence,
    campaigns,
    audit,
    reports,
    settings as settings_ep
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health & Status"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Access"])
api_router.include_router(analysis.router, tags=["Forensic Email Analysis"])
api_router.include_router(cases.router, tags=["Case Management & AI Assistant"])
api_router.include_router(intelligence.router, tags=["Threat Intelligence & IOCs"])
api_router.include_router(campaigns.router, tags=["Adversary Campaigns"])
api_router.include_router(audit.router, tags=["Cryptographic Audit Ledger"])
api_router.include_router(reports.router, tags=["Forensic Report Exports"])
api_router.include_router(settings_ep.router, tags=["Platform Configuration"])

