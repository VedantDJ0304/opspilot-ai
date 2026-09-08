"""
Tests for health check and root endpoints.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health_check():
    """Verify GET /api/health returns 200 OK and product name."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["product"] == "OpsPilot AI"


@pytest.mark.asyncio
async def test_root_endpoint():
    """Verify GET / returns documentation links and operational status."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "OpsPilot AI"
        assert data["docs"] == "/docs"


@pytest.mark.asyncio
async def test_state_endpoint():
    """Verify GET /api/state returns full operational state snapshot."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/state")
        assert response.status_code == 200
        data = response.json()
        assert "restaurant" in data
        assert "inventory" in data
        assert "menuItems" in data
        assert "orders" in data
        assert "risks" in data
        assert "metrics" in data
        assert data["restaurant"]["name"] == "Spice Garden"
