"""
Tests for order placement, recipe resolution, and inventory consumption.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db


@pytest.mark.asyncio
async def test_create_order_deducts_ingredients():
    """
    Test placing an order:
    1 Paneer Butter Masala consumes 150g (0.15 kg) of Paneer.
    Verify estimated stock decreases by exactly 0.15 kg.
    """
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Get baseline paneer stock
        inv_before = await client.get("/api/inventory/ing-paneer")
        assert inv_before.status_code == 200
        stock_before = inv_before.json()["estimatedStock"]

        # Place order for 1x Paneer Butter Masala
        order_payload = {
            "items": [
                {
                    "menuItemId": "menu-pbm",
                    "menuItemName": "Paneer Butter Masala",
                    "quantity": 1,
                    "unitPrice": 310,
                }
            ],
            "tableOrChannel": "Dine-In Table 4",
        }
        res = await client.post("/api/orders", json=order_payload)
        assert res.status_code == 200
        order_data = res.json()
        assert order_data["success"] is True
        assert order_data["order"]["total"] > 0

        # Verify paneer decreased by 0.15 kg
        inv_after = await client.get("/api/inventory/ing-paneer")
        assert inv_after.status_code == 200
        stock_after = inv_after.json()["estimatedStock"]
        expected_stock = max(0.0, round(stock_before - 0.15, 3))
        assert stock_after == expected_stock
