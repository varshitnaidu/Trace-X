import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings


@pytest.mark.asyncio
async def test_login_success_analyst():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/auth/login", json={
            "username": settings.DEMO_ANALYST_EMAIL,
            "password": settings.DEMO_ANALYST_PASSWORD
        })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == settings.DEMO_ANALYST_EMAIL
    assert data["user"]["role"] == "ANALYST"


@pytest.mark.asyncio
async def test_login_success_admin():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/auth/login", json={
            "username": settings.DEMO_ADMIN_EMAIL,
            "password": settings.DEMO_ADMIN_PASSWORD
        })
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["role"] == "ADMIN"


@pytest.mark.asyncio
async def test_login_invalid_password():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/auth/login", json={
            "username": "sarah.jenkins@trace-x.soc",
            "password": "wrongpassword123"
        })
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_get_me_with_token():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/api/v1/auth/login", json={
            "username": settings.DEMO_ANALYST_EMAIL,
            "password": settings.DEMO_ANALYST_PASSWORD
        })
        token = login_res.json()["access_token"]
        me_res = await ac.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == settings.DEMO_ANALYST_EMAIL


@pytest.mark.asyncio
async def test_rbac_admin_endpoint_forbidden_for_analyst():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/api/v1/auth/login", json={
            "username": settings.DEMO_ANALYST_EMAIL,
            "password": settings.DEMO_ANALYST_PASSWORD
        })
        token = login_res.json()["access_token"]
        res = await ac.post("/api/v1/settings/admin-action", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_rbac_admin_endpoint_allowed_for_admin():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/api/v1/auth/login", json={
            "username": settings.DEMO_ADMIN_EMAIL,
            "password": settings.DEMO_ADMIN_PASSWORD
        })
        token = login_res.json()["access_token"]
        res = await ac.post("/api/v1/settings/admin-action", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert "approved" in res.json()["message"]
