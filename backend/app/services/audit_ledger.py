import hashlib
from datetime import datetime, timezone
from typing import List, Optional
from app.models.audit import AuditEntry, AuditVerificationResult

GENESIS_HASH = "5e44a19bce32b0f491c10fae12089401abef8214b2d18471b069d300e8f23c02"


def compute_entry_hash(
    previous_hash: str,
    timestamp: str,
    analyst: str,
    action: str,
    resource: str,
    status: str
) -> str:
    """Derives canonical SHA-256 hash sealing current event with previous block hash."""
    canonical_str = f"{previous_hash}|{timestamp}|{analyst}|{action}|{resource}|{status}"
    return hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()


class AuditLedger:
    def __init__(self):
        self._entries: List[AuditEntry] = []
        self._initialize_seed_ledger()

    def _initialize_seed_ledger(self):
        """Initializes the verifiable cryptographic chain with seed hackathon events."""
        prev = GENESIS_HASH

        seeds = [
            ("AUD-8801", "2026-09-07 11:25:03 UTC", "sarah.jenkins@trace-x.soc", "EMAIL_ANALYSIS_EXECUTED", "CAS-2026-0091 / e3b0c442...b855", "SUCCESS"),
            ("AUD-8802", "2026-09-07 11:27:14 UTC", "sarah.jenkins@trace-x.soc", "CASE_ESCALATION_CRITICAL", "CAS-2026-0091 (ShadowWire Campaign)", "SUCCESS"),
            ("AUD-8803", "2026-09-07 11:32:40 UTC", "sarah.jenkins@trace-x.soc", "FORENSIC_REPORT_GENERATED", "REP-CAS-2026-0091.pdf", "SUCCESS"),
            ("AUD-8804", "2026-09-07 11:35:10 UTC", "system-sentinel", "CHAIN_INTEGRITY_VERIFICATION", "LEDGER_BLOCK_0091", "CHAIN VERIFIED"),
        ]

        for entry_id, ts, analyst, action, res, st in seeds:
            curr_hash = compute_entry_hash(prev, ts, analyst, action, res, st)
            self._entries.append(AuditEntry(
                id=entry_id,
                timestamp=ts,
                analyst=analyst,
                action=action,
                resource=res,
                status=st,
                hash=curr_hash,
                previousHash=prev
            ))
            prev = curr_hash

    def record_event(
        self,
        analyst: str,
        action: str,
        resource: str,
        status: str = "SUCCESS"
    ) -> AuditEntry:
        """Appends a cryptographically sealed block to the ledger."""
        prev_hash = self._entries[-1].hash if self._entries else GENESIS_HASH
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        next_id = f"AUD-{len(self._entries) + 8801}"

        curr_hash = compute_entry_hash(prev_hash, timestamp, analyst, action, resource, status)

        entry = AuditEntry(
            id=next_id,
            timestamp=timestamp,
            analyst=analyst,
            action=action,
            resource=resource,
            status=status,
            hash=curr_hash,
            previousHash=prev_hash
        )
        self._entries.append(entry)
        return entry

    def get_entries(self) -> List[AuditEntry]:
        return list(self._entries)

    def verify_integrity(self) -> AuditVerificationResult:
        """
        Recalculates every block hash from genesis root to current head.
        Detects any tampering, altered fields, or broken hash links.
        """
        expected_prev = GENESIS_HASH

        for idx, entry in enumerate(self._entries):
            # Check previous hash link
            if entry.previousHash != expected_prev:
                return AuditVerificationResult(
                    verified=False,
                    entries_checked=idx,
                    tampering_detected=True,
                    genesis_root=GENESIS_HASH,
                    latest_hash=self._entries[-1].hash if self._entries else GENESIS_HASH,
                    tampered_entry_id=entry.id,
                    message=f"Hash chain broken at entry {entry.id}: previousHash does not match prior block."
                )

            # Recompute current hash
            recomputed = compute_entry_hash(
                expected_prev,
                entry.timestamp,
                entry.analyst,
                entry.action,
                entry.resource,
                entry.status
            )
            if recomputed != entry.hash:
                return AuditVerificationResult(
                    verified=False,
                    entries_checked=idx + 1,
                    tampering_detected=True,
                    genesis_root=GENESIS_HASH,
                    latest_hash=self._entries[-1].hash if self._entries else GENESIS_HASH,
                    tampered_entry_id=entry.id,
                    message=f"Tampering detected in entry {entry.id}: cryptographic hash signature invalid."
                )

            expected_prev = entry.hash

        return AuditVerificationResult(
            verified=True,
            entries_checked=len(self._entries),
            tampering_detected=False,
            genesis_root=GENESIS_HASH,
            latest_hash=self._entries[-1].hash if self._entries else GENESIS_HASH,
            message="Cryptographic hash chain intact. All block seals verified against genesis root."
        )


audit_ledger = AuditLedger()
