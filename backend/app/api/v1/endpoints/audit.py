from typing import List
from fastapi import APIRouter
from app.models.audit import AuditEntry, AuditVerificationResult
from app.services.audit_ledger import audit_ledger

router = APIRouter()


@router.get("/audit", response_model=List[AuditEntry], summary="Get Tamper-Evident Audit Ledger")
async def get_audit_ledger():
    """Returns chronological append-only cryptographic audit chain of all forensic operations."""
    return audit_ledger.get_entries()


@router.post("/audit/verify", response_model=AuditVerificationResult, summary="Verify Audit Chain Integrity")
async def verify_audit_ledger():
    """
    Recalculates cryptographic SHA-256 hash seals from genesis root to verify that
    no logs, hashes, timestamps, or cases have been altered.
    """
    return audit_ledger.verify_integrity()
