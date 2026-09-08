import hashlib
from pathlib import Path
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

FIXTURE_PATH = Path(__file__).parent / "fixtures" / "synthetic_phish.eml"


@pytest.mark.asyncio
async def test_analyze_valid_eml_file():
    raw_bytes = FIXTURE_PATH.read_bytes()
    expected_sha256 = hashlib.sha256(raw_bytes).hexdigest()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("synthetic_phish.eml", raw_bytes, "message/rfc822")}
        res = await ac.post("/api/v1/analyze", files=files)

    assert res.status_code == 200
    data = res.json()

    # Verify SHA-256 byte precision
    assert data["sha256"] == expected_sha256
    assert data["sha256"] != ""
    assert len(data["sha256"]) == 64

    # Verify classification & risk
    assert data["classification"] in ["BEC", "PHISHING"]
    assert data["severity"] in ["CRITICAL", "HIGH"]
    assert data["riskScore"] >= 75

    # Verify Authentication
    assert data["spf"]["status"] == "FAIL"
    assert data["dkim"]["status"] == "FAIL"
    assert data["dmarc"]["status"] == "FAIL"

    # Verify Relays
    assert len(data["relays"]) >= 2
    tor_relays = [r for r in data["relays"] if r["isSuspicious"]]
    assert len(tor_relays) >= 1

    # Verify Extracted URLs & Domains
    domains = [d["domain"] for d in data["domains"]]
    assert any("paypa" in d.lower() for d in domains)

    # Verify case ID format
    assert data["id"].startswith("CAS-2026-")

    # Verify case stored and retrievable
    case_id = data["id"]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        get_res = await ac.get(f"/api/v1/cases/{case_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == case_id


@pytest.mark.asyncio
async def test_analyze_empty_file():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("empty.eml", b"", "message/rfc822")}
        res = await ac.post("/api/v1/analyze", files=files)
    assert res.status_code == 400


@pytest.mark.asyncio
async def test_analyze_invalid_extension():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("malicious.exe", b"MZDummyExecutableBytes", "application/octet-stream")}
        res = await ac.post("/api/v1/analyze", files=files)
    assert res.status_code == 400


@pytest.mark.asyncio
async def test_analyze_raw_pasted_email():
    raw_text = (
        "From: IT Support <support@company.org>\n"
        "To: user@company.org\n"
        "Subject: Routine System Maintenance\n"
        "Date: Mon, 07 Sep 2026 12:00:00 +0000\n"
        "Authentication-Results: spf=pass; dkim=pass; dmarc=pass\n\n"
        "Please note server updates scheduled tonight."
    )
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/analyze/raw", json={"raw_content": raw_text})
    assert res.status_code == 200
    data = res.json()
    assert data["classification"] == "BENIGN"
    assert data["severity"] == "LOW"
    assert data["riskScore"] <= 25


@pytest.mark.asyncio
async def test_case_chat_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/cases/CAS-2026-0091/chat", json={"question": "Why is this high risk?"})
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert "score" in data["reply"].lower() or "threat" in data["reply"].lower()
