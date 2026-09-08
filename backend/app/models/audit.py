from typing import Optional, List
from pydantic import BaseModel


class AuditEntry(BaseModel):
    id: str
    timestamp: str
    analyst: str
    action: str
    resource: str
    status: str
    hash: str
    previousHash: str


class AuditVerificationResult(BaseModel):
    verified: bool
    entries_checked: int
    tampering_detected: bool
    genesis_root: str
    latest_hash: str
    tampered_entry_id: Optional[str] = None
    message: str
