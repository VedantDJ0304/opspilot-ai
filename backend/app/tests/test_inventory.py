"""
Tests for inventory operations and stock adjustments.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import AsyncSessionLocal, init_db
from app.models.inventory import InventoryItem


@pytest.mark.asyncio
async def test_get_inventory():
    """Verify GET /api/inventory returns list of tracked ingredients."""
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/inventory")
        assert response.status_code == 200
        items = response.json()
        assert isinstance(items, list)
        assert len(items) > 0
        paneer = next((i for i in items if i["ingredientId"] == "ing-paneer"), None)
        assert paneer is not None
        assert "estimatedStock" in paneer


@pytest.mark.asyncio
async def test_adjust_inventory_delta():
    """Verify POST /api/inventory/adjust applies delta correctly."""
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Fetch current stock of tomato
        res = await client.get("/api/inventory/ing-tomato")
        assert res.status_code == 200
        prev_stock = res.json()["estimatedStock"]

        # Adjust +2.0 kg
        adj_res = await client.post(
            "/api/inventory/adjust",
            json={
                "ingredientId": "ing-tomato",
                "delta": 2.0,
                "type": "PURCHASE",
                "note": "Pytest delivery restock",
            },
        )
        assert adj_res.status_code == 200
        data = adj_res.json()
        assert data["success"] is True

        # Check new stock
        res_after = await client.get("/api/inventory/ing-tomato")
        assert res_after.status_code == 200
        assert res_after.json()["estimatedStock"] == round(prev_stock + 2.0, 3)
