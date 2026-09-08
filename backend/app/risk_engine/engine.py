"""
OpsPilot AI — Deterministic Risk Engine
Runs across all inventory items and returns active OperationalRisk records.
Gemini never does this. Python does this.
"""

import time
from datetime import datetime
from typing import List, Sequence

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.models.inventory import InventoryItem
from app.models.ingredient import Ingredient
from app.models.risk import OperationalRisk
from app.risk_engine.calculator import evaluate_ingredient_risk


async def run_risk_engine(
    session: AsyncSession,
    sensitivity: str = "balanced",
) -> List[OperationalRisk]:
    """
    Evaluate all inventory items, upsert OperationalRisk records, return active risks.
    Called after every order, inventory adjustment, and agent cycle.
    """
    inv_result = await session.execute(select(InventoryItem))
    inventory_items: Sequence[InventoryItem] = inv_result.scalars().all()

    ing_result = await session.execute(select(Ingredient))
    ingredients_map = {i.id: i for i in ing_result.scalars().all()}

    time_str = datetime.now().strftime("%I:%M %p")
    new_risk_ids: list[str] = []
    new_risks: list[OperationalRisk] = []

    for item in inventory_items:
        ingredient = ingredients_map.get(item.ingredient_id)
        if not ingredient:
            continue

        risk_level, message = evaluate_ingredient_risk(
            estimated_stock=item.estimated_stock,
            estimated_runout_minutes=item.estimated_runout_minutes,
            consumption_rate_per_hour=item.consumption_rate_per_hour,
            normal_rate_per_hour=item.normal_rate_per_hour,
            min_threshold=ingredient.min_threshold,
            ingredient_name=item.name,
            sensitivity=sensitivity,
        )

        # Update the inventory item's risk_level
        item.risk_level = risk_level

        if risk_level in ("CRITICAL", "WARNING"):
            risk_id = f"risk-{item.ingredient_id}"
            new_risk_ids.append(risk_id)
            new_risks.append(OperationalRisk(
                id=risk_id,
                ingredient_id=item.ingredient_id,
                ingredient_name=item.name,
                risk_level=risk_level,
                detected_at=time_str,
                current_stock=item.estimated_stock,
                unit=item.unit,
                runout_minutes=item.estimated_runout_minutes,
                consumption_rate=item.consumption_rate_per_hour,
                normal_rate=item.normal_rate_per_hour,
                pending_orders_count=item.pending_demand_units,
                message=message,
                status="ACTIVE",
            ))

    # Replace all risk records atomically
    await session.execute(delete(OperationalRisk))
    session.add_all(new_risks)

    return new_risks
