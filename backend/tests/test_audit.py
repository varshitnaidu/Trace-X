import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.audit_ledger import audit_ledger


@pytest.mark.asyncio
async def test_audit_list():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/audit")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 4
    first_entry = data[0]
    assert "hash" in first_entry
    assert "previousHash" in first_entry


@pytest.mark.asyncio
async def test_audit_verify_success():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/audit/verify")
    assert res.status_code == 200
    data = res.json()
    assert data["verified"] is True
    assert data["tampering_detected"] is False
    assert data["entries_checked"] >= 4


@pytest.mark.asyncio
async def test_audit_tampering_detection():
    # Record a genuine event
    entry = audit_ledger.record_event(
        analyst="test@trace-x.soc",
        action="TEST_ACTION",
        resource="TEST_RES"
    )
    # Verification should succeed
    v_res = audit_ledger.verify_integrity()
    assert v_res.verified is True

    # Tamper with the action of the last entry
    original_action = entry.action
    entry.action = "TAMPERED_ACTION_FORGED"
    
    # Verification should detect tampering
    tamper_check = audit_ledger.verify_integrity()
    assert tamper_check.verified is False
    assert tamper_check.tampering_detected is True
    assert tamper_check.tampered_entry_id == entry.id

    # Restore original action
    entry.action = original_action
    restore_check = audit_ledger.verify_integrity()
    assert restore_check.verified is True
