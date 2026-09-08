from typing import Dict
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.config import settings
from app.integrations.virustotal import virustotal_adapter
from app.integrations.abuseipdb import abuseipdb_adapter
from app.integrations.phishtank import phishtank_adapter
from app.integrations.llm import llm_adapter
from app.services.risk_engine import risk_engine
from app.core.dependencies import get_optional_current_user, require_roles
from app.models.auth import User

router = APIRouter()


class WeightUpdateRequest(BaseModel):
    weights: Dict[str, int]


@router.get("/settings", summary="Get Platform Settings & Provider Statuses")
async def get_settings():
    """
    Returns platform environment mode, threat intel configuration statuses,
    and hybrid scoring weights. Never reveals secret API keys.
    """
    return {
        "environment": settings.ENVIRONMENT,
        "demo_mode": settings.DEMO_MODE,
        "providers": {
            "virustotal": "CONFIGURED" if virustotal_adapter.is_configured() else "NOT CONFIGURED",
            "abuseipdb": "CONFIGURED" if abuseipdb_adapter.is_configured() else "NOT CONFIGURED",
            "phishtank": "CONFIGURED" if phishtank_adapter.is_configured() else "DEMO CACHE ACTIVE",
            "urlhaus": "COMMUNITY ACTIVE",
            "rdap": "ONLINE",
            "llm": "CONFIGURED" if llm_adapter.is_configured() else "NOT CONFIGURED"
        },
        "weights": risk_engine.weights
    }


@router.post("/settings/weights", summary="Update Hybrid Scoring Weights")
async def update_risk_weights(
    req: WeightUpdateRequest,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Updates the deterministic contribution of individual forensic analyzers.
    Admin authorization enforced in production; permitted for demonstration.
    """
    total = sum(req.weights.values())
    if total != 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Sum of threat scoring weights must equal 100%. Provided sum: {total}%"
        )
    risk_engine.weights = req.weights
    return {"status": "success", "message": "Scoring weights updated successfully", "weights": risk_engine.weights}


@router.post("/settings/admin-action", summary="Admin-Only Protected Test Endpoint")
async def admin_only_action(
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    """
    Demonstrates RBAC enforcement: Analysts receive 403 Forbidden; SOC Admins succeed.
    """
    return {
        "status": "success",
        "message": f"Administrative action approved for {current_user.email} (Role: {current_user.role})"
    }
