"""
OpsPilot AI — Orders Router
Handles order creation, status transitions, and deterministic recipe deduction.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.models.order import Order, OrderItem
from app.models.settings import AgentSettings
from app.schemas.order import OrderCreateRequest, OrderStatusUpdateRequest, OrderSchema, OrderItemSchema
from app.services.order_service import create_order as service_create_order
from app.agent.graph import execute_agent_workflow
from app.routers.state import get_operational_state

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.get("")
async def get_orders(session: AsyncSession = Depends(get_db)):
    """Retrieve all orders in descending order."""
    result = await session.execute(select(Order).order_by(desc(Order.id)))
    orders = result.scalars().all()

    items_res = await session.execute(select(OrderItem))
    all_items = items_res.scalars().all()
    items_by_order = {}
    for i in all_items:
        items_by_order.setdefault(i.order_id, []).append(
            {
                "menuItemId": i.menu_item_id,
                "menuItemName": i.menu_item_name,
                "quantity": i.quantity,
                "unitPrice": i.unit_price,
                "total": i.total,
            }
        )

    return [
        {
            "id": o.id,
            "orderNumber": o.order_number,
            "items": items_by_order.get(o.id, []),
            "subtotal": o.subtotal,
            "tax": o.tax,
            "total": o.total,
            "status": o.status,
            "createdAt": o.created_at,
            "ingredientImpactSummary": o.ingredient_impact_summary,
            "tableOrChannel": o.table_or_channel,
        }
        for o in orders
    ]


@router.post("")
async def create_order(payload: OrderCreateRequest, session: AsyncSession = Depends(get_db)):
    """
    Create a new order:
    1. Validates items
    2. Calculates totals
    3. Resolves recipe consumption
    4. Updates estimated inventory
    5. Records inventory transactions
    6. Re-runs risk engine
    7. Triggers agent cycle if agent enabled
    """
    if not payload.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item.")

    items_dict = [
        {
            "menu_item_id": item.menuItemId,
            "menu_item_name": item.menuItemName,
            "quantity": item.quantity,
            "unit_price": item.unitPrice,
        }
        for item in payload.items
    ]

    order = await service_create_order(
        session=session,
        items=items_dict,
        table_or_channel=payload.tableOrChannel or "Dine-In Table 1",
    )

    # Check if agent is enabled and run autonomous loop
    set_res = await session.execute(select(AgentSettings).where(AgentSettings.id == 1))
    settings = set_res.scalar_one_or_none()
    if settings and settings.agent_enabled:
        await execute_agent_workflow(
            session=session,
            trigger=f"New Order #{order.order_number} received ({order.ingredient_impact_summary})",
        )

    # Return updated state to update frontend immediately
    updated_state = await get_operational_state(session)
    return {
        "success": True,
        "order": {
            "id": order.id,
            "orderNumber": order.order_number,
            "subtotal": order.subtotal,
            "tax": order.tax,
            "total": order.total,
            "status": order.status,
            "createdAt": order.created_at,
        },
        "state": updated_state,
    }


@router.get("/{order_id}")
async def get_order_by_id(order_id: str, session: AsyncSession = Depends(get_db)):
    """Retrieve details for a specific order."""
    result = await session.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    items_res = await session.execute(select(OrderItem).where(OrderItem.order_id == order_id))
    items = items_res.scalars().all()

    return {
        "id": order.id,
        "orderNumber": order.order_number,
        "items": [
            {
                "menuItemId": i.menu_item_id,
                "menuItemName": i.menu_item_name,
                "quantity": i.quantity,
                "unitPrice": i.unit_price,
                "total": i.total,
            }
            for i in items
        ],
        "subtotal": order.subtotal,
        "tax": order.tax,
        "total": order.total,
        "status": order.status,
        "createdAt": order.created_at,
        "ingredientImpactSummary": order.ingredient_impact_summary,
        "tableOrChannel": order.table_or_channel,
    }


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: str,
    payload: OrderStatusUpdateRequest,
    session: AsyncSession = Depends(get_db),
):
    """Update status of an order (Pending, Preparing, Ready, Completed, Cancelled)."""
    result = await session.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = payload.status
    updated_state = await get_operational_state(session)

    return {
        "success": True,
        "order": {
            "id": order.id,
            "orderNumber": order.order_number,
            "status": order.status,
        },
        "state": updated_state,
    }