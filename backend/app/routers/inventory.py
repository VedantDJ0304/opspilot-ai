"""
OpsPilot AI — Inventory Router
Handles stock queries, physical inventory counts, adjustments, and deliveries.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.inventory import InventoryItem, InventoryTransaction
from app.models.ingredient import Ingredient
from app.models.settings import AgentSettings
from app.schemas.inventory import InventoryAdjustRequest
from app.services.inventory_service import adjust_inventory as service_adjust_inventory
from app.agent.graph import execute_agent_workflow
from app.routers.state import get_operational_state

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


@router.get("")
async def get_inventory(session: AsyncSession = Depends(get_db)):
    """Retrieve all inventory items."""
    result = await session.execute(select(InventoryItem))
    items = result.scalars().all()
    return [
        {
            "id": i.ingredient_id,
            "ingredientId": i.ingredient_id,
            "name": i.name,
            "unit": i.unit,
            "displayUnit": i.display_unit,
            "physicalStock": i.physical_baseline_stock,
            "estimatedStock": i.estimated_stock,
            "consumptionRatePerHour": i.consumption_rate_per_hour,
            "normalRatePerHour": i.normal_rate_per_hour,
            "pendingDemandUnits": i.pending_demand_units,
            "estimatedRunoutMinutes": i.estimated_runout_minutes,
            "riskLevel": i.risk_level,
            "lastCountAt": i.last_count_at,
        }
        for i in items
    ]


@router.get("/{ingredient_id}")
async def get_inventory_item_by_id(ingredient_id: str, session: AsyncSession = Depends(get_db)):
    """Retrieve details for a single inventory ingredient."""
    result = await session.execute(
        select(InventoryItem).where(InventoryItem.ingredient_id == ingredient_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    return {
        "ingredientId": item.ingredient_id,
        "name": item.name,
        "unit": item.unit,
        "displayUnit": item.display_unit,
        "physicalStock": item.physical_baseline_stock,
        "estimatedStock": item.estimated_stock,
        "consumptionRatePerHour": item.consumption_rate_per_hour,
        "normalRatePerHour": item.normal_rate_per_hour,
        "pendingDemandUnits": item.pending_demand_units,
        "estimatedRunoutMinutes": item.estimated_runout_minutes,
        "riskLevel": item.risk_level,
        "lastCountAt": item.last_count_at,
    }


@router.post("")
async def create_inventory_item(
    payload: dict,
    session: AsyncSession = Depends(get_db),
):
    """Create a new tracked ingredient in the inventory."""
    name = payload.get("name")
    if not name:
        raise HTTPException(status_code=400, detail="Ingredient name is required")

    ing_id = payload.get("id") or f"ing-{name.lower().replace(' ', '-')}"
    unit = payload.get("unit", "kg")
    physical_stock = float(payload.get("physical_stock", payload.get("physicalStock", 5.0)))
    reorder_level = float(payload.get("reorder_level", payload.get("minThreshold", 2.0)))

    # Create master ingredient
    ing = Ingredient(
        id=ing_id,
        name=name,
        unit=unit,
        display_unit=unit,
        min_threshold=reorder_level,
        normal_rate_per_hour=1.0,
        cost_per_unit=100.0,
    )
    session.add(ing)

    # Create inventory item
    inv = InventoryItem(
        ingredient_id=ing_id,
        name=name,
        unit=unit,
        display_unit=unit,
        physical_baseline_stock=physical_stock,
        physical_baseline_time="Just now",
        estimated_stock=physical_stock,
        consumption_rate_per_hour=1.0,
        normal_rate_per_hour=1.0,
        pending_demand_units=0,
        estimated_runout_minutes=int(physical_stock * 60),
        risk_level="NORMAL",
        last_count_at="Just now",
    )
    session.add(inv)
    await session.commit()

    return {
        "success": True,
        "ingredient": {
            "id": ing.id,
            "name": ing.name,
            "unit": ing.unit,
            "physicalStock": inv.physical_baseline_stock,
            "estimatedStock": inv.estimated_stock,
        },
    }


@router.post("/adjust")
@router.patch("/adjust")
async def adjust_inventory_stock(
    payload: InventoryAdjustRequest,
    session: AsyncSession = Depends(get_db),
):
    """
    Adjust inventory stock either by physical baseline reset or delta.
    Records inventory transaction, re-evaluates risk, and triggers agent.
    """
    try:
        inv_item = await service_adjust_inventory(
            session=session,
            ingredient_id=payload.ingredientId,
            delta=payload.delta,
            new_physical_stock=payload.newPhysicalStock,
            transaction_type=payload.type or "MANUAL_ADJUSTMENT",
            note=payload.note or "Stock update by Manager Rajesh K.",
        )

        # Trigger autonomous agent evaluation
        set_res = await session.execute(select(AgentSettings).where(AgentSettings.id == 1))
        settings = set_res.scalar_one_or_none()
        if settings and settings.agent_enabled:
            await execute_agent_workflow(
                session=session,
                trigger=f"Inventory adjusted on {inv_item.name}: new stock {inv_item.estimated_stock} {inv_item.unit}",
            )

        updated_state = await get_operational_state(session)
        return {"success": True, "state": updated_state}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Adjustment failed: {str(e)}")