"""
OpsPilot AI — Order Service
Creates orders, calculates consumption, updates inventory, triggers risk engine.
"""

import time
from datetime import datetime
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.order import Order, OrderItem
from app.models.menu import MenuItem, RecipeIngredient
from app.models.ingredient import Ingredient
from app.models.inventory import InventoryItem, InventoryTransaction
from app.models.settings import AgentSettings
from app.services.recipe_service import calculate_order_consumption
from app.risk_engine.calculator import calculate_runout_minutes
from app.risk_engine.engine import run_risk_engine
from app.core.logging import get_logger

logger = get_logger(__name__)


async def create_order(
    session: AsyncSession,
    items: List[dict],
    table_or_channel: str = "Dine-In Table 1",
) -> Order:
    """
    Full order creation pipeline:
    1. Calculate totals
    2. Calculate ingredient consumption
    3. Save order + order items
    4. Deduct from inventory + record transactions
    5. Re-run risk engine
    """
    time_str = datetime.now().strftime("%I:%M %p")

    # 1. Fetch required data
    menu_result = await session.execute(select(MenuItem))
    menu_items = menu_result.scalars().all()

    recipe_result = await session.execute(select(RecipeIngredient))
    recipes = recipe_result.scalars().all()

    ing_result = await session.execute(select(Ingredient))
    ingredients = ing_result.scalars().all()

    # 2. Calculate totals
    subtotal = sum(i["unit_price"] * i["quantity"] for i in items)
    tax = round(subtotal * 0.05 * 100) / 100
    total = round((subtotal + tax) * 100) / 100

    # 3. Calculate ingredient consumption
    impacts, summary_text = calculate_order_consumption(
        order_items=items,
        menu_items=menu_items,
        recipes=recipes,
        ingredients=ingredients,
    )

    # 4. Generate order number
    count_result = await session.execute(select(func.count(Order.id)))
    order_count = count_result.scalar_one()
    order_number = 1040 + order_count + 1

    # 5. Create the order record
    order_id = f"ord-{int(time.time() * 1000)}"
    order = Order(
        id=order_id,
        order_number=order_number,
        subtotal=subtotal,
        tax=tax,
        total=total,
        status="Pending",
        created_at=time_str,
        ingredient_impact_summary=summary_text,
        table_or_channel=table_or_channel,
    )
    session.add(order)

    # 6. Create order items
    for item in items:
        session.add(OrderItem(
            order_id=order_id,
            menu_item_id=item["menu_item_id"],
            menu_item_name=item["menu_item_name"],
            quantity=item["quantity"],
            unit_price=item["unit_price"],
            total=item["unit_price"] * item["quantity"],
        ))

    # 7. Deduct from inventory + record transactions
    inv_result = await session.execute(select(InventoryItem))
    inventory_map = {i.ingredient_id: i for i in inv_result.scalars().all()}

    for impact in impacts:
        inv_item = inventory_map.get(impact.ingredient_id)
        if not inv_item:
            continue

        prev_stock = inv_item.estimated_stock
        new_stock = max(0.0, round((prev_stock - impact.consumed_amount) * 1000) / 1000)
        inv_item.estimated_stock = new_stock

        # Dynamically increase consumption rate under burst orders
        inv_item.consumption_rate_per_hour = round(
            (inv_item.consumption_rate_per_hour + 0.08) * 100
        ) / 100
        inv_item.estimated_runout_minutes = calculate_runout_minutes(
            new_stock, inv_item.consumption_rate_per_hour
        )
        inv_item.pending_demand_units += 1

        session.add(InventoryTransaction(
            id=f"tx-{int(time.time() * 1000)}-{impact.ingredient_id}",
            timestamp=time_str,
            ingredient_id=impact.ingredient_id,
            ingredient_name=inv_item.name,
            type="ORDER_CONSUMPTION",
            delta=-impact.consumed_amount,
            unit=impact.unit,
            balance_after=new_stock,
            reference_id=order_id,
            note=f"Order #{order_number} consumption: {impact.formatted_text}",
        ))

    # 8. Re-run risk engine
    settings_result = await session.execute(select(AgentSettings).where(AgentSettings.id == 1))
    settings = settings_result.scalar_one_or_none()
    sensitivity = settings.risk_sensitivity if settings else "balanced"

    await run_risk_engine(session, sensitivity)

    logger.info(f"Order #{order_number} created: {summary_text}")
    return order
