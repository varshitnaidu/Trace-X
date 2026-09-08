import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_download_pdf_report():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/reports/CAS-2026-0091/pdf")
    assert res.status_code == 200
    assert "application/pdf" in res.headers["content-type"]
    assert res.headers["content-disposition"].startswith('attachment; filename="REP-CAS-2026-0091.pdf"')
    assert res.content.startswith(b"%PDF")


@pytest.mark.asyncio
async def test_download_csv_report():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/reports/CAS-2026-0091/csv")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    content = res.text
    assert "Type,Indicator,Reputation" in content
    assert "paypaI-billing-service.net" in content


@pytest.mark.asyncio
async def test_download_json_dossier():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/reports/CAS-2026-0091/json")
    assert res.status_code == 200
    assert "application/json" in res.headers["content-type"]
    data = res.json()
    assert data["id"] == "CAS-2026-0091"
    assert "relays" in data
    assert "sha256" in data


@pytest.mark.asyncio
async def test_report_not_found():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/reports/CAS-NONEXISTENT-9999/pdf")
    assert res.status_code == 404
