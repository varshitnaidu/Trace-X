from datetime import datetime, timezone
from fastapi import APIRouter
from app.core.config import settings
from app.integrations.virustotal import virustotal_adapter
from app.integrations.abuseipdb import abuseipdb_adapter
from app.integrations.phishtank import phishtank_adapter
from app.integrations.llm import llm_adapter

router = APIRouter()


@router.get("/health", summary="TRACE-X System Health & Readiness")
async def health_check():
    """
    Returns system status, current timestamp, version, active mode (demo/live),
    and readiness state for core forensics engines and threat intel adapters.
    Does not trigger expensive external API lookups.
    """
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "demo_mode": settings.DEMO_MODE,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "api": "healthy",
            "parser": "ready",
            "intelligence_adapters": "ready",
            "risk_engine": "ready",
            "ml_classifier": "ready",
            "audit_ledger": "ready",
            "report_generator": "ready",
            "virustotal": "configured" if virustotal_adapter.is_configured() else "not_configured",
            "abuseipdb": "configured" if abuseipdb_adapter.is_configured() else "not_configured",
            "phishtank": "configured" if phishtank_adapter.is_configured() else "demo_fallback",
            "urlhaus": "ready",
            "rdap": "ready",
            "llm": "configured" if llm_adapter.is_configured() else "not_configured"
        }
    }

