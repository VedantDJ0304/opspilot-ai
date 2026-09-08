"""
OpsPilot AI — Agent Tools
Real Python operational tools used by the autonomous agent to inspect state,
run calculations, and execute changes in the database.
All database mutations occur through these validated tools.
"""

from typing import List, Dict, Any, Optional, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.restaurant import Restaurant
from app.models.inventory import InventoryItem, InventoryTransaction
from app.models.ingredient import Ingredient
from app.models.menu import MenuItem, RecipeIngredient
from app.models.order import Order, OrderItem
from app.models.settings import AgentSettings
from app.models.risk import OperationalRisk
from app.risk_engine.calculator import calculate_runout_minutes, evaluate_ingredient_risk
from app.risk_engine.engine import run_risk_engine
from app.services.activity_service import log_agent_event, add_notification


async def get_restaurant_state(session: AsyncSession) -> Dict[str, Any]:
    """Fetch core restaurant metadata and operational status."""
    res = await session.execute(select(Restaurant).where(Restaurant.id == 1))
    restaurant = res.scalar_one_or_none()
    if not restaurant:
        return {
            "name": "Spice Garden",
            "city": "Amravati",
            "status": "Operational",
            "agent_enabled": True,
        }
    return {
        "id": restaurant.id,
        "name": restaurant.name,
        "city": restaurant.location,
        "status": restaurant.status,
        "manager": restaurant.manager,
        "agent_enabled": True,
    }


async def get_inventory(session: AsyncSession) -> List[Dict[str, Any]]:
    """Get all current inventory items with estimated stock and runout time."""
    result = await session.execute(select(InventoryItem))
    items = result.scalars().all()
    return [
        {
            "ingredientId": i.ingredient_id,
            "name": i.name,
            "unit": i.unit,
            "displayUnit": i.display_unit,
            "physicalBaselineStock": i.physical_baseline_stock,
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


async def get_inventory_item(session: AsyncSession, ingredient_id: str) -> Optional[Dict[str, Any]]:
    """Get details for a single inventory item."""
    result = await session.execute(
        select(InventoryItem).where(InventoryItem.ingredient_id == ingredient_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        return None
    return {
        "ingredientId": item.ingredient_id,
        "name": item.name,
        "unit": item.unit,
        "estimatedStock": item.estimated_stock,
        "consumptionRatePerHour": item.consumption_rate_per_hour,
        "normalRatePerHour": item.normal_rate_per_hour,
        "pendingDemandUnits": item.pending_demand_units,
        "estimatedRunoutMinutes": item.estimated_runout_minutes,
        "riskLevel": item.risk_level,
    }


async def get_recent_orders(session: AsyncSession, limit: int = 10) -> List[Dict[str, Any]]:
    """Retrieve recent orders with item breakdown."""
    result = await session.execute(select(Order).order_by(desc(Order.id)).limit(limit))
    orders = result.scalars().all()
    return [
        {
            "id": o.id,
            "orderNumber": o.order_number,
            "total": o.total,
            "status": o.status,
            "channel": o.table_or_channel,
            "createdAt": o.created_at,
            "ingredientImpact": o.ingredient_impact_summary,
        }
        for o in orders
    ]


async def get_pending_orders(session: AsyncSession) -> List[Dict[str, Any]]:
    """Retrieve orders that are currently Pending or Preparing."""
    result = await session.execute(
        select(Order).where(Order.status.in_(["Pending", "Preparing"])).order_by(desc(Order.id))
    )
    orders = result.scalars().all()
    return [
        {
            "id": o.id,
            "orderNumber": o.order_number,
            "total": o.total,
            "status": o.status,
            "channel": o.table_or_channel,
        }
        for o in orders
    ]


async def get_menu(session: AsyncSession) -> List[Dict[str, Any]]:
    """Fetch all menu items with current availability and pricing."""
    result = await session.execute(select(MenuItem))
    items = result.scalars().all()
    return [
        {
            "id": m.id,
            "name": m.name,
            "category": m.category,
            "price": m.price,
            "availabilityStatus": m.availability_status,
            "limitedReason": m.limited_reason,
            "prepTimeMinutes": m.prep_time_minutes,
        }
        for m in items
    ]


async def get_recipe(session: AsyncSession, menu_item_id: str) -> List[Dict[str, Any]]:
    """Fetch ingredients and required quantities for a specific menu item."""
    result = await session.execute(
        select(RecipeIngredient).where(RecipeIngredient.menu_item_id == menu_item_id)
    )
    ingredients = result.scalars().all()
    return [
        {
            "ingredientId": r.ingredient_id,
            "amount": r.amount,
            "unit": r.unit,
        }
        for r in ingredients
    ]


def calculate_consumption(order_items: List[Dict[str, Any]], recipes: Sequence[Any]) -> Dict[str, float]:
    """
    Pure Python deterministic calculation of ingredient consumption for items.
    """
    recipe_map: Dict[str, List[Any]] = {}
    for r in recipes:
        recipe_map.setdefault(r.menu_item_id, []).append(r)

    consumption: Dict[str, float] = {}
    for item in order_items:
        m_id = item["menu_item_id"]
        qty = item["quantity"]
        for ri in recipe_map.get(m_id, []):
            consumption[ri.ingredient_id] = consumption.get(ri.ingredient_id, 0.0) + (ri.amount * qty)

    return {k: round(v, 3) for k, v in consumption.items()}


def calculate_runout_time(stock: float, rate_per_hour: float) -> int:
    """Deterministic calculation of runout time in minutes."""
    return calculate_runout_minutes(stock, rate_per_hour)


async def detect_inventory_risks(session: AsyncSession, sensitivity: str = "balanced") -> List[Dict[str, Any]]:
    """Run the deterministic risk engine and return active risks."""
    risks = await run_risk_engine(session, sensitivity)
    return [
        {
            "id": r.id,
            "ingredientId": r.ingredient_id,
            "ingredientName": r.ingredient_name,
            "riskLevel": r.risk_level,
            "currentStock": r.current_stock,
            "unit": r.unit,
            "runoutMinutes": r.runout_minutes,
            "consumptionRate": r.consumption_rate,
            "normalRate": r.normal_rate,
            "pendingOrdersCount": r.pending_orders_count,
            "message": r.message,
            "status": r.status,
        }
        for r in risks
    ]


async def update_menu_availability(
    session: AsyncSession,
    menu_item_ids: List[str],
    status: str,
    reason: Optional[str] = None,
) -> List[str]:
    """
    Safely update availability status for target menu items (AVAILABLE, LIMITED, DISABLED).
    Returns list of modified menu item names.
    """
    result = await session.execute(
        select(MenuItem).where(MenuItem.id.in_(menu_item_ids))
    )
    items = result.scalars().all()
    updated_names: List[str] = []

    for item in items:
        item.availability_status = status
        item.limited_reason = reason if status in ("LIMITED", "DISABLED") else None
        updated_names.append(item.name)

    return updated_names


async def create_operational_alert(
    session: AsyncSession,
    title: str,
    message: str,
    alert_type: str = "WARNING",
    action_link: Optional[str] = None,
) -> str:
    """Create and dispatch an in-app operational alert."""
    notif = await add_notification(session, title, message, alert_type, action_link)
    return notif.id


async def record_agent_action(
    session: AsyncSession,
    stage: str,
    title: str,
    description: str,
    action: Optional[str] = None,
    action_target: Optional[str] = None,
    result: Optional[str] = None,
    status: str = "COMPLETED",
) -> str:
    """Log an agent action step to the database."""
    event = await log_agent_event(
        session=session,
        stage=stage,
        title=title,
        description=description,
        action=action,
        action_target=action_target,
        result=result,
        status=status,
    )
    return event.id


async def get_agent_settings(session: AsyncSession) -> Dict[str, Any]:
    """Retrieve operational permissions and agent configuration."""
    res = await session.execute(select(AgentSettings).where(AgentSettings.id == 1))
    settings = res.scalar_one_or_none()
    if not settings:
        return {
            "agentEnabled": True,
            "monitoringFrequencyMinutes": 1,
            "riskSensitivity": "balanced",
            "permissions": {
                "notifyManager": True,
                "limitMenuItems": True,
                "disableMenuItems": False,
                "restoreMenuItems": True,
                "replenishmentAlerts": True,
            },
            "operatingHours": "11:00 AM - 11:30 PM",
            "restaurantName": "Spice Garden",
            "currencySymbol": "₹",
        }
    return {
        "agentEnabled": settings.agent_enabled,
        "monitoringFrequencyMinutes": settings.monitoring_frequency_minutes,
        "riskSensitivity": settings.risk_sensitivity,
        "permissions": settings.get_permissions(),
        "operatingHours": settings.operating_hours,
        "restaurantName": settings.restaurant_name,
        "currencySymbol": settings.currency_symbol,
    }
