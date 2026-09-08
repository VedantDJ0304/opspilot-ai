"""
OpsPilot AI — Deterministic Risk Engine
Runs across all inventory items and returns active OperationalRisk records.
Gemini never does this. Python does this.
"""

from datetime import datetime
from typing import List, Sequence

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

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
    # Flush any pending uncommitted operations so queries see current state
    await session.flush()

    inv_result = await session.execute(select(InventoryItem))
    inventory_items: Sequence[InventoryItem] = inv_result.scalars().all()

    ing_result = await session.execute(select(Ingredient))
    ingredients_map = {i.id: i for i in ing_result.scalars().all()}

    existing_result = await session.execute(select(OperationalRisk))
    existing_risks = {r.ingredient_id: r for r in existing_result.scalars().all()}

    time_str = datetime.now().strftime("%I:%M %p")
    active_risks: list[OperationalRisk] = []
    active_ingredient_ids = set()

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

        item.risk_level = risk_level

        if risk_level in ("CRITICAL", "WARNING"):
            active_ingredient_ids.add(item.ingredient_id)
            if item.ingredient_id in existing_risks:
                risk_obj = existing_risks[item.ingredient_id]
                risk_obj.risk_level = risk_level
                risk_obj.detected_at = time_str
                risk_obj.current_stock = item.estimated_stock
                risk_obj.unit = item.unit
                risk_obj.runout_minutes = item.estimated_runout_minutes
                risk_obj.consumption_rate = item.consumption_rate_per_hour
                risk_obj.normal_rate = item.normal_rate_per_hour
                risk_obj.pending_orders_count = item.pending_demand_units
                risk_obj.message = message
                risk_obj.status = "ACTIVE"
            else:
                risk_obj = OperationalRisk(
                    id=f"risk-{item.ingredient_id}",
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
                )
                session.add(risk_obj)
                existing_risks[item.ingredient_id] = risk_obj
            active_risks.append(risk_obj)

    # Clean up resolved risks
    for ing_id, old_risk in list(existing_risks.items()):
        if ing_id not in active_ingredient_ids:
            await session.delete(old_risk)

    await session.flush()
    return active_risks
