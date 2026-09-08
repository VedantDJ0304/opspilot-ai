"""
OpsPilot AI — State Router
Returns the full operational state conforming to the OperationalStateSchema interface.
This provides all telemetry and data consumed by the React dashboard.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.models.restaurant import Restaurant
from app.models.ingredient import Ingredient
from app.models.inventory import InventoryItem, InventoryTransaction
from app.models.menu import MenuItem, RecipeIngredient
from app.models.order import Order, OrderItem
from app.models.risk import OperationalRisk
from app.models.agent import AgentEvent, AgentDecision
from app.models.notification import AppNotification
from app.models.settings import AgentSettings
from app.models.demo import DemoState, OperationalIncident
from app.schemas.dashboard import (
    OperationalStateSchema,
    RestaurantInfoSchema,
    DashboardMetricsSchema,
)
from app.schemas.inventory import (
    IngredientSchema,
    InventoryItemSchema,
    InventoryTransactionSchema,
    RecipeIngredientSchema,
)
from app.schemas.menu import MenuItemSchema
from app.schemas.order import OrderSchema, OrderItemSchema
from app.schemas.agent import (
    AgentEventSchema,
    AgentDecisionSchema,
    AgentSettingsSchema,
    AgentSettingsPermissionsSchema,
    DemoStepStateSchema,
)
from app.schemas.risk import (
    OperationalRiskSchema,
    AppNotificationSchema,
    OperationalIncidentSchema,
)

router = APIRouter(tags=["State"])


@router.get("/api/state", response_model=OperationalStateSchema)
async def get_operational_state(session: AsyncSession = Depends(get_db)):
    """Fetch complete operational state snapshot."""
    # 1. Restaurant
    rest_res = await session.execute(select(Restaurant).where(Restaurant.id == 1))
    restaurant = rest_res.scalar_one_or_none()
    if not restaurant:
        rest_info = RestaurantInfoSchema(
            name="Spice Garden",
            tagline="Autonomous AI Operations for Restaurants",
            location="Sector 14, Nashik, Maharashtra",
            manager="Rajesh Kulkarni",
            status="Operational",
        )
    else:
        rest_info = RestaurantInfoSchema(
            name=restaurant.name,
            tagline=restaurant.tagline,
            location=restaurant.location,
            manager=restaurant.manager,
            status=restaurant.status,
        )

    # 2. Ingredients
    ing_res = await session.execute(select(Ingredient))
    ingredients = [
        IngredientSchema(
            id=i.id,
            name=i.name,
            unit=i.unit,
            displayUnit=i.display_unit,
            minThreshold=i.min_threshold,
            normalRatePerHour=i.normal_rate_per_hour,
            costPerUnit=i.cost_per_unit,
        )
        for i in ing_res.scalars().all()
    ]

    # 3. Inventory Items
    inv_res = await session.execute(select(InventoryItem))
    inventory = [
        InventoryItemSchema(
            ingredientId=i.ingredient_id,
            name=i.name,
            unit=i.unit,
            displayUnit=i.display_unit,
            physicalBaselineStock=i.physical_baseline_stock,
            physicalBaselineTime=i.physical_baseline_time,
            estimatedStock=i.estimated_stock,
            consumptionRatePerHour=i.consumption_rate_per_hour,
            normalRatePerHour=i.normal_rate_per_hour,
            pendingDemandUnits=i.pending_demand_units,
            estimatedRunoutMinutes=i.estimated_runout_minutes,
            riskLevel=i.risk_level,
            lastCountAt=i.last_count_at,
        )
        for i in inv_res.scalars().all()
    ]

    # 4. Inventory Transactions (latest 50)
    tx_res = await session.execute(
        select(InventoryTransaction).order_by(desc(InventoryTransaction.id)).limit(50)
    )
    transactions = [
        InventoryTransactionSchema(
            id=t.id,
            timestamp=t.timestamp,
            ingredientId=t.ingredient_id,
            ingredientName=t.ingredient_name,
            type=t.type,
            delta=t.delta,
            unit=t.unit,
            balanceAfter=t.balance_after,
            referenceId=t.reference_id,
            note=t.note,
        )
        for t in tx_res.scalars().all()
    ]

    # 5. Menu Items with Recipes
    menu_res = await session.execute(select(MenuItem))
    menu_items_db = menu_res.scalars().all()

    recipe_res = await session.execute(select(RecipeIngredient))
    recipes_db = recipe_res.scalars().all()
    recipes_by_menu = {}
    for r in recipes_db:
        recipes_by_menu.setdefault(r.menu_item_id, []).append(
            RecipeIngredientSchema(ingredientId=r.ingredient_id, amount=r.amount, unit=r.unit)
        )

    menu_items = [
        MenuItemSchema(
            id=m.id,
            name=m.name,
            category=m.category,
            price=m.price,
            availabilityStatus=m.availability_status,
            limitedReason=m.limited_reason,
            recipe=recipes_by_menu.get(m.id, []),
            prepTimeMinutes=m.prep_time_minutes,
        )
        for m in menu_items_db
    ]

    # 6. Orders with Order Items (latest 50)
    orders_res = await session.execute(select(Order).order_by(desc(Order.id)).limit(50))
    orders_db = orders_res.scalars().all()

    order_items_res = await session.execute(select(OrderItem))
    order_items_db = order_items_res.scalars().all()
    items_by_order = {}
    for oi in order_items_db:
        items_by_order.setdefault(oi.order_id, []).append(
            OrderItemSchema(
                menuItemId=oi.menu_item_id,
                menuItemName=oi.menu_item_name,
                quantity=oi.quantity,
                unitPrice=oi.unit_price,
                total=oi.total,
            )
        )

    orders = [
        OrderSchema(
            id=o.id,
            orderNumber=o.order_number,
            items=items_by_order.get(o.id, []),
            subtotal=o.subtotal,
            tax=o.tax,
            total=o.total,
            status=o.status,
            createdAt=o.created_at,
            ingredientImpactSummary=o.ingredient_impact_summary,
            tableOrChannel=o.table_or_channel,
        )
        for o in orders_db
    ]

    # 7. Operational Risks
    risks_res = await session.execute(
        select(OperationalRisk).where(OperationalRisk.status == "ACTIVE")
    )
    risks = [
        OperationalRiskSchema(
            id=r.id,
            ingredientId=r.ingredient_id,
            ingredientName=r.ingredient_name,
            riskLevel=r.risk_level,
            detectedAt=r.detected_at,
            currentStock=r.current_stock,
            unit=r.unit,
            runoutMinutes=r.runout_minutes,
            consumptionRate=r.consumption_rate,
            normalRate=r.normal_rate,
            pendingOrdersCount=r.pending_orders_count,
            message=r.message,
            status=r.status,
        )
        for r in risks_res.scalars().all()
    ]

    # 8. Agent Events (chronological order)
    events_res = await session.execute(
        select(AgentEvent).order_by(desc(AgentEvent.id)).limit(50)
    )
    events_db = list(events_res.scalars().all())
    events_db.reverse()
    agent_events = [
        AgentEventSchema(
            id=e.id,
            timestamp=e.timestamp,
            stage=e.stage,
            title=e.title,
            description=e.description,
            inputData=e.get_input_data(),
            decision=e.decision,
            action=e.action,
            actionTarget=e.action_target,
            result=e.result,
            status=e.status,
        )
        for e in events_db
    ]

    # 9. Decisions
    dec_res = await session.execute(
        select(AgentDecision).order_by(desc(AgentDecision.id)).limit(20)
    )
    dec_db = list(dec_res.scalars().all())
    decisions = []
    for d in dec_db:
        import json
        ctx = json.loads(d.context_json) if d.context_json else {}
        alts = json.loads(d.alternatives_json) if d.alternatives_json else []
        params = json.loads(d.action_params_json) if d.action_params_json else {}
        decisions.append(
            AgentDecisionSchema(
                id=d.id,
                timestamp=d.timestamp,
                goal=d.goal,
                trigger=d.trigger,
                context=ctx,
                availableAlternatives=alts,
                decision=d.decision,
                reason=d.reason,
                action=d.action,
                actionParams=params,
                result=d.result or "",
                status=d.status,
            )
        )
    latest_decision = decisions[0] if decisions else None

    # 10. Notifications
    notif_res = await session.execute(
        select(AppNotification).order_by(desc(AppNotification.id)).limit(20)
    )
    notifications = [
        AppNotificationSchema(
            id=n.id,
            title=n.title,
            message=n.message,
            type=n.type,
            timestamp=n.timestamp,
            read=n.read,
            actionLink=n.action_link,
        )
        for n in notif_res.scalars().all()
    ]

    # 11. Settings
    set_res = await session.execute(select(AgentSettings).where(AgentSettings.id == 1))
    settings_db = set_res.scalar_one_or_none()
    if not settings_db:
        settings = AgentSettingsSchema(
            agentEnabled=True,
            monitoringFrequencyMinutes=1,
            riskSensitivity="balanced",
            permissions=AgentSettingsPermissionsSchema(
                notifyManager=True,
                limitMenuItems=True,
                disableMenuItems=False,
                restoreMenuItems=True,
                replenishmentAlerts=True,
            ),
            operatingHours="11:00 AM - 11:30 PM",
            restaurantName="Spice Garden",
            currencySymbol="₹",
        )
    else:
        perms = settings_db.get_permissions()
        settings = AgentSettingsSchema(
            agentEnabled=settings_db.agent_enabled,
            monitoringFrequencyMinutes=settings_db.monitoring_frequency_minutes,
            riskSensitivity=settings_db.risk_sensitivity,
            permissions=AgentSettingsPermissionsSchema(**perms),
            operatingHours=settings_db.operating_hours,
            restaurantName=settings_db.restaurant_name,
            currencySymbol=settings_db.currency_symbol,
        )

    # 12. Demo State
    demo_res = await session.execute(select(DemoState).where(DemoState.id == 1))
    demo_db = demo_res.scalar_one_or_none()
    if not demo_db:
        demo_state = DemoStepStateSchema(
            currentStep=6,
            totalSteps=10,
            stepTitle="Step 6: Autonomous Action Executed",
            stepDescription="Paneer dishes marked Limited. Agent is monitoring recovery.",
            isSimulating=False,
        )
    else:
        demo_state = DemoStepStateSchema(
            currentStep=demo_db.current_step,
            totalSteps=demo_db.total_steps,
            stepTitle=demo_db.step_title,
            stepDescription=demo_db.step_description,
            isSimulating=demo_db.is_simulating,
        )

    # 13. Incidents
    inc_res = await session.execute(select(OperationalIncident).limit(10))
    incidents = [
        OperationalIncidentSchema(
            id=inc.id,
            date=inc.date,
            ingredientName=inc.ingredient_name,
            cause=inc.cause,
            actionTaken=inc.action_taken,
            outcome=inc.outcome,
            status=inc.status,
        )
        for inc in inc_res.scalars().all()
    ]

    # 14. Metrics
    critical_r = next((r for r in risks if r.riskLevel == "CRITICAL"), None)
    today_orders_count = len(orders)
    pending_orders_count = sum(1 for o in orders if o.status in ("Pending", "Preparing"))
    agent_actions_today = sum(1 for e in agent_events if e.stage == "ACT")

    metrics = DashboardMetricsSchema(
        todayOrdersCount=today_orders_count,
        pendingOrdersCount=pending_orders_count,
        activeRisksCount=len(risks),
        agentActionsTodayCount=agent_actions_today,
        criticalShortageIngredient=critical_r.ingredientName if critical_r else None,
        criticalShortageTimeMinutes=critical_r.runoutMinutes if critical_r else None,
    )

    return OperationalStateSchema(
        restaurant=rest_info,
        ingredients=ingredients,
        inventory=inventory,
        inventoryTransactions=transactions,
        menuItems=menu_items,
        orders=orders,
        risks=risks,
        agentEvents=agent_events,
        latestDecision=latest_decision,
        decisionHistory=decisions,
        notifications=notifications,
        settings=settings,
        demoState=demo_state,
        incidents=incidents,
        metrics=metrics,
    )