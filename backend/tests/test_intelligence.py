import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_intelligence_providers_list():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/intelligence/providers")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 4
    names = [p["name"] for p in data]
    assert any("VirusTotal" in n for n in names)
    assert any("AbuseIPDB" in n for n in names)


@pytest.mark.asyncio
async def test_intelligence_lookup_ip():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/intelligence/lookup", json={
            "indicator": "185.220.101.42",
            "type": "ip"
        })
    assert res.status_code == 200
    data = res.json()
    assert data["indicator"] == "185.220.101.42"
    assert data["reputation"] == "MALICIOUS"
    assert data["abuseConfidenceScore"] >= 90
    assert len(data["sources"]) >= 2


@pytest.mark.asyncio
async def test_intelligence_lookup_domain():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/intelligence/lookup", json={
            "indicator": "paypaI-billing-service.net",
            "type": "domain"
        })
    assert res.status_code == 200
    data = res.json()
    assert data["indicator"] == "paypaI-billing-service.net"
    assert data["reputation"] == "MALICIOUS"


@pytest.mark.asyncio
async def test_campaigns_list():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/campaigns")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 2
    assert any("ShadowWire" in c["name"] for c in data)


@pytest.mark.asyncio
async def test_settings_no_key_leak():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/settings")
    assert res.status_code == 200
    data = res.json()
    assert "providers" in data
    # Ensure no secret strings leaked
    assert "api_key" not in str(data).lower()
    assert data["providers"]["virustotal"] in ["CONFIGURED", "NOT CONFIGURED"]
