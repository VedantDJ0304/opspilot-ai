"""
OpsPilot AI — Inventory Service
Handles stock adjustments, physical counts, and restock deliveries.
"""

import time
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.inventory import InventoryItem, InventoryTransaction
from app.models.settings import AgentSettings
from app.risk_engine.calculator import calculate_runout_minutes
from app.risk_engine.engine import run_risk_engine
from app.core.logging import get_logger

logger = get_logger(__name__)


async def adjust_inventory(
    session: AsyncSession,
    ingredient_id: str,
    delta: float | None = None,
    new_physical_stock: float | None = None,
    transaction_type: str = "MANUAL_ADJUSTMENT",
    note: str = "Stock update by Manager Rajesh K.",
) -> InventoryItem:
    """
    Adjust inventory for a single ingredient.

    Modes:
    - new_physical_stock: Full physical count reset (sets both physical baseline and estimated)
    - delta: Incremental adjustment (add or subtract from estimated stock)
    """
    time_str = datetime.now().strftime("%I:%M %p")

    result = await session.execute(
        select(InventoryItem).where(InventoryItem.ingredient_id == ingredient_id)
    )
    inv_item = result.scalar_one_or_none()
    if not inv_item:
        raise ValueError(f"Inventory item not found: {ingredient_id}")

    prev_stock = inv_item.estimated_stock

    if new_physical_stock is not None:
        # Physical count baseline reset
        inv_item.physical_baseline_stock = float(new_physical_stock)
        inv_item.physical_baseline_time = f"{time_str} Today"
        inv_item.estimated_stock = float(new_physical_stock)
        inv_item.last_count_at = f"{time_str} (Physical Audit)"
        balance_after = float(new_physical_stock)
        actual_delta = balance_after - prev_stock
    elif delta is not None:
        balance_after = max(0.0, round((prev_stock + float(delta)) * 1000) / 1000)
        inv_item.estimated_stock = balance_after
        actual_delta = float(delta)
    else:
        raise ValueError("Either delta or new_physical_stock must be provided")

    # Recalculate runout
    inv_item.estimated_runout_minutes = calculate_runout_minutes(
        inv_item.estimated_stock, inv_item.consumption_rate_per_hour
    )

    # Record transaction
    session.add(InventoryTransaction(
        id=f"tx-adj-{int(time.time() * 1000)}",
        timestamp=time_str,
        ingredient_id=ingredient_id,
        ingredient_name=inv_item.name,
        type=transaction_type,
        delta=actual_delta,
        unit=inv_item.unit,
        balance_after=inv_item.estimated_stock,
        note=note,
    ))

    # Re-run risk engine
    settings_result = await session.execute(select(AgentSettings).where(AgentSettings.id == 1))
    settings = settings_result.scalar_one_or_none()
    sensitivity = settings.risk_sensitivity if settings else "balanced"

    await run_risk_engine(session, sensitivity)

    logger.info(
        f"Inventory adjusted: {ingredient_id} "
        f"{'+' if actual_delta >= 0 else ''}{actual_delta:.3f} {inv_item.unit} → {inv_item.estimated_stock:.3f}"
    )
    return inv_item
