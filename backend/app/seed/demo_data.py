"""
OpsPilot AI — Seed Data
Complete Python port of server/db.ts initial data.
Seeds the Spice Garden demo restaurant state on first run.
"""

import json
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

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


async def seed_initial_data(session: AsyncSession) -> None:
    """Seed all initial Spice Garden data if database is empty."""
    # Check if already seeded
    result = await session.execute(select(Ingredient).limit(1))
    if result.scalar_one_or_none() is not None:
        return  # Already seeded

    # ── Restaurant ────────────────────────────────────────────────────────────
    session.add(Restaurant(
        id=1,
        name="Spice Garden",
        tagline="Autonomous AI Operations for Restaurants",
        location="Sector 14, Nashik, Maharashtra",
        manager="Rajesh Kulkarni",
        status="Operational",
    ))

    # ── Ingredients ───────────────────────────────────────────────────────────
    ingredients = [
        Ingredient(id="ing-paneer", name="Paneer (Cottage Cheese)", unit="kg", display_unit="kg", min_threshold=3.0, normal_rate_per_hour=0.8, cost_per_unit=340),
        Ingredient(id="ing-tomato", name="Tomato (Fresh Farm)", unit="kg", display_unit="kg", min_threshold=3.0, normal_rate_per_hour=1.7, cost_per_unit=42),
        Ingredient(id="ing-cream", name="Fresh Dairy Cream", unit="L", display_unit="L", min_threshold=2.0, normal_rate_per_hour=0.9, cost_per_unit=220),
        Ingredient(id="ing-rice", name="Royal Basmati Rice", unit="kg", display_unit="kg", min_threshold=5.0, normal_rate_per_hour=4.0, cost_per_unit=95),
        Ingredient(id="ing-butter", name="Amul Butter", unit="kg", display_unit="kg", min_threshold=1.5, normal_rate_per_hour=0.5, cost_per_unit=520),
        Ingredient(id="ing-flour", name="Wheat & Maida Flour", unit="kg", display_unit="kg", min_threshold=5.0, normal_rate_per_hour=2.5, cost_per_unit=48),
        Ingredient(id="ing-spices", name="Spices & Garam Masala", unit="kg", display_unit="kg", min_threshold=1.0, normal_rate_per_hour=0.3, cost_per_unit=640),
        Ingredient(id="ing-dal", name="Toor Dal (Pigeon Pea)", unit="kg", display_unit="kg", min_threshold=3.0, normal_rate_per_hour=1.2, cost_per_unit=165),
    ]
    session.add_all(ingredients)

    # ── Inventory ─────────────────────────────────────────────────────────────
    inventory = [
        InventoryItem(ingredient_id="ing-paneer", name="Paneer (Cottage Cheese)", unit="kg", display_unit="kg", physical_baseline_stock=10.0, physical_baseline_time="08:00 AM Today", estimated_stock=2.1, consumption_rate_per_hour=1.6, normal_rate_per_hour=0.8, pending_demand_units=8, estimated_runout_minutes=45, risk_level="CRITICAL", last_count_at="Today, 08:00 AM"),
        InventoryItem(ingredient_id="ing-tomato", name="Tomato (Fresh Farm)", unit="kg", display_unit="kg", physical_baseline_stock=15.0, physical_baseline_time="08:00 AM Today", estimated_stock=4.8, consumption_rate_per_hour=2.1, normal_rate_per_hour=1.7, pending_demand_units=4, estimated_runout_minutes=110, risk_level="WARNING", last_count_at="Today, 08:00 AM"),
        InventoryItem(ingredient_id="ing-cream", name="Fresh Dairy Cream", unit="L", display_unit="L", physical_baseline_stock=8.0, physical_baseline_time="08:00 AM Today", estimated_stock=3.2, consumption_rate_per_hour=1.1, normal_rate_per_hour=0.9, pending_demand_units=3, estimated_runout_minutes=175, risk_level="WARNING", last_count_at="Today, 08:00 AM"),
        InventoryItem(ingredient_id="ing-rice", name="Royal Basmati Rice", unit="kg", display_unit="kg", physical_baseline_stock=35.0, physical_baseline_time="08:00 AM Today", estimated_stock=18.0, consumption_rate_per_hour=4.2, normal_rate_per_hour=4.0, pending_demand_units=5, estimated_runout_minutes=255, risk_level="NORMAL", last_count_at="Today, 08:00 AM"),
        InventoryItem(ingredient_id="ing-butter", name="Amul Butter", unit="kg", display_unit="kg", physical_baseline_stock=8.0, physical_baseline_time="08:00 AM Today", estimated_stock=4.5, consumption_rate_per_hour=0.6, normal_rate_per_hour=0.5, pending_demand_units=4, estimated_runout_minutes=450, risk_level="NORMAL", last_count_at="Today, 08:00 AM"),
        InventoryItem(ingredient_id="ing-flour", name="Wheat & Maida Flour", unit="kg", display_unit="kg", physical_baseline_stock=25.0, physical_baseline_time="08:00 AM Today", estimated_stock=16.2, consumption_rate_per_hour=2.6, normal_rate_per_hour=2.5, pending_demand_units=6, estimated_runout_minutes=370, risk_level="NORMAL", last_count_at="Today, 08:00 AM"),
        InventoryItem(ingredient_id="ing-spices", name="Spices & Garam Masala", unit="kg", display_unit="kg", physical_baseline_stock=6.0, physical_baseline_time="08:00 AM Today", estimated_stock=4.8, consumption_rate_per_hour=0.35, normal_rate_per_hour=0.3, pending_demand_units=4, estimated_runout_minutes=820, risk_level="NORMAL", last_count_at="Today, 08:00 AM"),
        InventoryItem(ingredient_id="ing-dal", name="Toor Dal (Pigeon Pea)", unit="kg", display_unit="kg", physical_baseline_stock=14.0, physical_baseline_time="08:00 AM Today", estimated_stock=9.4, consumption_rate_per_hour=1.3, normal_rate_per_hour=1.2, pending_demand_units=3, estimated_runout_minutes=430, risk_level="NORMAL", last_count_at="Today, 08:00 AM"),
    ]
    session.add_all(inventory)

    # ── Menu Items ────────────────────────────────────────────────────────────
    menu_items = [
        MenuItem(id="menu-pbm", name="Paneer Butter Masala", category="Main Course", price=310, availability_status="LIMITED", limited_reason="OpsPilot Autonomous Guard: Limited to conserve paneer stock during peak spike.", prep_time_minutes=18),
        MenuItem(id="menu-pt", name="Paneer Tikka", category="Starters", price=280, availability_status="LIMITED", limited_reason="OpsPilot Autonomous Guard: Limited to conserve paneer stock during peak spike.", prep_time_minutes=15),
        MenuItem(id="menu-pb", name="Paneer Dum Biryani", category="Rice & Biryani", price=340, availability_status="LIMITED", limited_reason="OpsPilot Autonomous Guard: Limited to conserve paneer stock during peak spike.", prep_time_minutes=22),
        MenuItem(id="menu-thali", name="Special Veg Thali", category="Thalis", price=260, availability_status="AVAILABLE", prep_time_minutes=15),
        MenuItem(id="menu-dt", name="Dal Tadka Special", category="Main Course", price=190, availability_status="AVAILABLE", prep_time_minutes=12),
        MenuItem(id="menu-vb", name="Subz Veg Biryani", category="Rice & Biryani", price=240, availability_status="AVAILABLE", prep_time_minutes=20),
        MenuItem(id="menu-bn", name="Butter Naan", category="Breads", price=60, availability_status="AVAILABLE", prep_time_minutes=8),
        MenuItem(id="menu-roti", name="Tandoori Roti (Butter)", category="Breads", price=30, availability_status="AVAILABLE", prep_time_minutes=6),
        MenuItem(id="menu-jr", name="Jeera Basmati Rice", category="Rice & Biryani", price=150, availability_status="AVAILABLE", prep_time_minutes=10),
    ]
    session.add_all(menu_items)

    # ── Recipes ───────────────────────────────────────────────────────────────
    recipes = [
        # Paneer Butter Masala
        RecipeIngredient(menu_item_id="menu-pbm", ingredient_id="ing-paneer", amount=0.15, unit="kg"),
        RecipeIngredient(menu_item_id="menu-pbm", ingredient_id="ing-butter", amount=0.02, unit="kg"),
        RecipeIngredient(menu_item_id="menu-pbm", ingredient_id="ing-cream", amount=0.03, unit="L"),
        RecipeIngredient(menu_item_id="menu-pbm", ingredient_id="ing-tomato", amount=0.10, unit="kg"),
        RecipeIngredient(menu_item_id="menu-pbm", ingredient_id="ing-spices", amount=0.01, unit="kg"),
        # Paneer Tikka
        RecipeIngredient(menu_item_id="menu-pt", ingredient_id="ing-paneer", amount=0.20, unit="kg"),
        RecipeIngredient(menu_item_id="menu-pt", ingredient_id="ing-butter", amount=0.015, unit="kg"),
        RecipeIngredient(menu_item_id="menu-pt", ingredient_id="ing-spices", amount=0.02, unit="kg"),
        # Paneer Dum Biryani
        RecipeIngredient(menu_item_id="menu-pb", ingredient_id="ing-paneer", amount=0.12, unit="kg"),
        RecipeIngredient(menu_item_id="menu-pb", ingredient_id="ing-rice", amount=0.20, unit="kg"),
        RecipeIngredient(menu_item_id="menu-pb", ingredient_id="ing-butter", amount=0.025, unit="kg"),
        RecipeIngredient(menu_item_id="menu-pb", ingredient_id="ing-spices", amount=0.015, unit="kg"),
        # Special Veg Thali
        RecipeIngredient(menu_item_id="menu-thali", ingredient_id="ing-paneer", amount=0.05, unit="kg"),
        RecipeIngredient(menu_item_id="menu-thali", ingredient_id="ing-dal", amount=0.10, unit="kg"),
        RecipeIngredient(menu_item_id="menu-thali", ingredient_id="ing-rice", amount=0.15, unit="kg"),
        RecipeIngredient(menu_item_id="menu-thali", ingredient_id="ing-flour", amount=0.10, unit="kg"),
        RecipeIngredient(menu_item_id="menu-thali", ingredient_id="ing-tomato", amount=0.05, unit="kg"),
        # Dal Tadka Special
        RecipeIngredient(menu_item_id="menu-dt", ingredient_id="ing-dal", amount=0.15, unit="kg"),
        RecipeIngredient(menu_item_id="menu-dt", ingredient_id="ing-tomato", amount=0.08, unit="kg"),
        RecipeIngredient(menu_item_id="menu-dt", ingredient_id="ing-butter", amount=0.02, unit="kg"),
        RecipeIngredient(menu_item_id="menu-dt", ingredient_id="ing-spices", amount=0.01, unit="kg"),
        # Subz Veg Biryani
        RecipeIngredient(menu_item_id="menu-vb", ingredient_id="ing-rice", amount=0.25, unit="kg"),
        RecipeIngredient(menu_item_id="menu-vb", ingredient_id="ing-tomato", amount=0.06, unit="kg"),
        RecipeIngredient(menu_item_id="menu-vb", ingredient_id="ing-butter", amount=0.02, unit="kg"),
        RecipeIngredient(menu_item_id="menu-vb", ingredient_id="ing-spices", amount=0.015, unit="kg"),
        # Butter Naan
        RecipeIngredient(menu_item_id="menu-bn", ingredient_id="ing-flour", amount=0.12, unit="kg"),
        RecipeIngredient(menu_item_id="menu-bn", ingredient_id="ing-butter", amount=0.025, unit="kg"),
        # Tandoori Roti
        RecipeIngredient(menu_item_id="menu-roti", ingredient_id="ing-flour", amount=0.10, unit="kg"),
        RecipeIngredient(menu_item_id="menu-roti", ingredient_id="ing-butter", amount=0.005, unit="kg"),
        # Jeera Basmati Rice
        RecipeIngredient(menu_item_id="menu-jr", ingredient_id="ing-rice", amount=0.20, unit="kg"),
        RecipeIngredient(menu_item_id="menu-jr", ingredient_id="ing-butter", amount=0.015, unit="kg"),
        RecipeIngredient(menu_item_id="menu-jr", ingredient_id="ing-spices", amount=0.005, unit="kg"),
    ]
    session.add_all(recipes)

    # ── Orders ────────────────────────────────────────────────────────────────
    orders = [
        Order(id="ord-1042", order_number=1042, subtotal=740, tax=37, total=777, status="Preparing", created_at="10:42 AM", ingredient_impact_summary="Paneer -300g, Butter -90g, Cream -60ml, Tomato -200g, Flour -240g", table_or_channel="Dine-In Table 4"),
        Order(id="ord-1041", order_number=1041, subtotal=900, tax=45, total=945, status="Pending", created_at="10:38 AM", ingredient_impact_summary="Paneer -520g, Rice -200g, Butter -55g, Spices -55g", table_or_channel="Dine-In Table 7"),
        Order(id="ord-1040", order_number=1040, subtotal=830, tax=41.5, total=871.5, status="Preparing", created_at="10:34 AM", ingredient_impact_summary="Paneer -250g, Dal -200g, Rice -300g, Flour -200g, Tomato -200g", table_or_channel="Dine-In Table 2"),
        Order(id="ord-1039", order_number=1039, subtotal=430, tax=21.5, total=451.5, status="Ready", created_at="10:28 AM", ingredient_impact_summary="Dal -150g, Rice -200g, Flour -300g, Tomato -80g, Butter -50g", table_or_channel="Takeaway #12"),
        Order(id="ord-1038", order_number=1038, subtotal=480, tax=24, total=504, status="Completed", created_at="10:15 AM", ingredient_impact_summary="Rice -500g, Tomato -120g, Butter -40g, Spices -30g", table_or_channel="Swiggy Online"),
        Order(id="ord-1037", order_number=1037, subtotal=1290, tax=64.5, total=1354.5, status="Completed", created_at="10:02 AM", ingredient_impact_summary="Paneer -450g, Butter -210g, Cream -90ml, Tomato -300g, Flour -720g", table_or_channel="Zomato Online"),
    ]
    session.add_all(orders)

    order_items = [
        # ord-1042
        OrderItem(order_id="ord-1042", menu_item_id="menu-pbm", menu_item_name="Paneer Butter Masala", quantity=2, unit_price=310, total=620),
        OrderItem(order_id="ord-1042", menu_item_id="menu-bn", menu_item_name="Butter Naan", quantity=2, unit_price=60, total=120),
        # ord-1041
        OrderItem(order_id="ord-1041", menu_item_id="menu-pt", menu_item_name="Paneer Tikka", quantity=2, unit_price=280, total=560),
        OrderItem(order_id="ord-1041", menu_item_id="menu-pb", menu_item_name="Paneer Dum Biryani", quantity=1, unit_price=340, total=340),
        # ord-1040
        OrderItem(order_id="ord-1040", menu_item_id="menu-pbm", menu_item_name="Paneer Butter Masala", quantity=1, unit_price=310, total=310),
        OrderItem(order_id="ord-1040", menu_item_id="menu-thali", menu_item_name="Special Veg Thali", quantity=2, unit_price=260, total=520),
        # ord-1039
        OrderItem(order_id="ord-1039", menu_item_id="menu-dt", menu_item_name="Dal Tadka Special", quantity=1, unit_price=190, total=190),
        OrderItem(order_id="ord-1039", menu_item_id="menu-jr", menu_item_name="Jeera Basmati Rice", quantity=1, unit_price=150, total=150),
        OrderItem(order_id="ord-1039", menu_item_id="menu-roti", menu_item_name="Tandoori Roti (Butter)", quantity=3, unit_price=30, total=90),
        # ord-1038
        OrderItem(order_id="ord-1038", menu_item_id="menu-vb", menu_item_name="Subz Veg Biryani", quantity=2, unit_price=240, total=480),
        # ord-1037
        OrderItem(order_id="ord-1037", menu_item_id="menu-pbm", menu_item_name="Paneer Butter Masala", quantity=3, unit_price=310, total=930),
        OrderItem(order_id="ord-1037", menu_item_id="menu-bn", menu_item_name="Butter Naan", quantity=6, unit_price=60, total=360),
    ]
    session.add_all(order_items)

    # ── Risks ─────────────────────────────────────────────────────────────────
    risks = [
        OperationalRisk(id="risk-paneer-critical", ingredient_id="ing-paneer", ingredient_name="Paneer (Cottage Cheese)", risk_level="CRITICAL", detected_at="10:41 AM", current_stock=2.1, unit="kg", runout_minutes=45, consumption_rate=1.6, normal_rate=0.8, pending_orders_count=8, message="Paneer may run out in approximately 45 minutes due to 2× demand surge.", status="ACTIVE"),
        OperationalRisk(id="risk-tomato-warning", ingredient_id="ing-tomato", ingredient_name="Tomato (Fresh Farm)", risk_level="WARNING", detected_at="10:35 AM", current_stock=4.8, unit="kg", runout_minutes=110, consumption_rate=2.1, normal_rate=1.7, pending_orders_count=4, message="Tomato consumption elevated (+24% above baseline). Stock covers ~1h 50m.", status="ACTIVE"),
    ]
    session.add_all(risks)

    # ── Inventory Transactions ────────────────────────────────────────────────
    transactions = [
        InventoryTransaction(id="tx-1", timestamp="10:42 AM", ingredient_id="ing-paneer", ingredient_name="Paneer (Cottage Cheese)", type="ORDER_CONSUMPTION", delta=-0.3, unit="kg", balance_after=2.1, reference_id="ord-1042", note="Consumption from Order #1042 (2x Paneer Butter Masala)"),
        InventoryTransaction(id="tx-2", timestamp="10:38 AM", ingredient_id="ing-paneer", ingredient_name="Paneer (Cottage Cheese)", type="ORDER_CONSUMPTION", delta=-0.52, unit="kg", balance_after=2.4, reference_id="ord-1041", note="Consumption from Order #1041 (2x Paneer Tikka, 1x Paneer Biryani)"),
        InventoryTransaction(id="tx-3", timestamp="10:34 AM", ingredient_id="ing-paneer", ingredient_name="Paneer (Cottage Cheese)", type="ORDER_CONSUMPTION", delta=-0.25, unit="kg", balance_after=2.92, reference_id="ord-1040", note="Consumption from Order #1040 (1x Paneer Butter Masala, 2x Thali)"),
        InventoryTransaction(id="tx-4", timestamp="10:02 AM", ingredient_id="ing-paneer", ingredient_name="Paneer (Cottage Cheese)", type="ORDER_CONSUMPTION", delta=-0.45, unit="kg", balance_after=3.17, reference_id="ord-1037", note="Consumption from Order #1037 (3x Paneer Butter Masala)"),
        InventoryTransaction(id="tx-0", timestamp="08:00 AM", ingredient_id="ing-paneer", ingredient_name="Paneer (Cottage Cheese)", type="INITIAL", delta=10.0, unit="kg", balance_after=10.0, reference_id="baseline-init", note="Physical morning stock audit by Manager Rajesh K."),
    ]
    session.add_all(transactions)

    # ── Agent Events ──────────────────────────────────────────────────────────
    agent_events = [
        AgentEvent(id="evt-6", timestamp="10:42 AM", stage="MONITOR", title="Monitoring Order Inflow & Stock Stabilization", description="Agent is observing post-action order velocity and inventory runout trajectory.", input_data_json=json.dumps({"paneerStockKg": 2.1, "pendingOrders": 8, "status": "Active Watch"}), status="MONITORING"),
        AgentEvent(id="evt-5", timestamp="10:41 AM", stage="ACT", title="Autonomous Action: Limited Paneer-Heavy Menu Items", description="Executed LIMIT_MENU_ITEM on Paneer Butter Masala, Paneer Tikka, and Paneer Biryani.", action="LIMIT_MENU_ITEM", action_target="Paneer Butter Masala, Paneer Tikka, Paneer Biryani", result="Menu availability updated in real-time. POS and digital channels restricted.", status="COMPLETED"),
        AgentEvent(id="evt-4", timestamp="10:41 AM", stage="DECIDE", title="Decision: Limit Paneer Dishes to Prevent Full Outage", description="Determined high probability of paneer stockout within 45 minutes; selected targeted menu limiting.", decision="Temporarily limit paneer-heavy dishes while notifying manager.", status="COMPLETED"),
        AgentEvent(id="evt-3", timestamp="10:41 AM", stage="ANALYZE", title="Consumption Surge Analysis (+100% vs Baseline)", description="Current paneer consumption of 1.6 kg/hr is exactly double normal rate of 0.8 kg/hr.", input_data_json=json.dumps({"currentRate": 1.6, "normalRate": 0.8, "ratio": "2.0x", "runoutMinutes": 45}), status="COMPLETED"),
        AgentEvent(id="evt-2", timestamp="10:40 AM", stage="OBSERVE", title="Operational Inflow Spike Detected", description="8 new orders received in the last 20 minutes with high concentration in paneer entrees.", input_data_json=json.dumps({"batchOrders": 8, "paneerImpactGrams": 1450}), status="COMPLETED"),
        AgentEvent(id="evt-1", timestamp="08:00 AM", stage="OBSERVE", title="Morning Baseline Stock Registered", description="Manager logged physical opening inventory count: Paneer 10.0kg, Tomato 15.0kg, Rice 35.0kg.", input_data_json=json.dumps({"paneerBaselineKg": 10.0, "status": "Normal Start"}), status="COMPLETED"),
    ]
    session.add_all(agent_events)

    # ── Agent Decision ────────────────────────────────────────────────────────
    decision = AgentDecision(
        id="dec-1041-paneer",
        timestamp="10:41 AM",
        goal="Prevent paneer stockout and safeguard service continuity.",
        trigger="Paneer consumption rate reached 1.6 kg/hr (2.0× baseline), estimated runout under 45 minutes with 8 pending orders.",
        context_json=json.dumps({"ingredientName": "Paneer", "stock": 2.1, "unit": "kg", "consumptionRate": 1.6, "normalRate": 0.8, "pendingOrders": 8, "runoutMinutes": 45}),
        alternatives_json=json.dumps(["Limit paneer-heavy dishes (Targeted mitigation)", "Disable all paneer menu items immediately (Heavy disruption)", "Send urgent procurement alert to kitchen manager without menu changes", "Continue monitoring without operational intervention"]),
        decision="Temporarily limit paneer-heavy dishes and dispatch replenishment alert.",
        reason="Current demand is approximately 2× normal consumption and available stock cannot satisfy pending and projected lunch surge. Limiting menu items preserves remaining 2.1 kg for high-margin pending orders while allowing other dishes to sell.",
        action="LIMIT_MENU_ITEM",
        action_params_json=json.dumps({"menuItemIds": ["menu-pbm", "menu-pt", "menu-pb"], "status": "LIMITED", "reason": "OpsPilot Autonomous Guard: Limited to conserve paneer stock during peak spike."}),
        result="3 paneer-heavy dishes marked as Limited Availability. New incoming paneer order velocity decelerated by 65%.",
        status="Monitoring",
    )
    session.add(decision)

    # ── Notifications ─────────────────────────────────────────────────────────
    notifications = [
        AppNotification(id="notif-1", title="Critical Inventory Risk: Paneer", message="Estimated runout in 45 minutes. Current consumption (1.6 kg/hr) exceeds baseline (0.8 kg/hr).", type="CRITICAL", timestamp="10:41 AM", read=False, action_link="/ai-operations"),
        AppNotification(id="notif-2", title="Autonomous Action Executed", message="OpsPilot marked 3 paneer-heavy dishes as Limited Availability to prevent total stockout.", type="WARNING", timestamp="10:41 AM", read=False, action_link="/menu"),
        AppNotification(id="notif-3", title="Tomato Consumption Warning", message="Tomato rate elevated at 2.1 kg/hr. Stock sufficient for approximately 1h 50m.", type="INFO", timestamp="10:35 AM", read=True, action_link="/inventory"),
    ]
    session.add_all(notifications)

    # ── Settings ──────────────────────────────────────────────────────────────
    session.add(AgentSettings(
        id=1,
        agent_enabled=True,
        monitoring_frequency_minutes=1,
        risk_sensitivity="balanced",
        permissions_json=json.dumps({"notifyManager": True, "limitMenuItems": True, "disableMenuItems": False, "restoreMenuItems": True, "replenishmentAlerts": True}),
        operating_hours="11:00 AM - 11:30 PM",
        restaurant_name="Spice Garden",
        currency_symbol="₹",
    ))

    # ── Demo State ────────────────────────────────────────────────────────────
    session.add(DemoState(
        id=1,
        current_step=6,
        total_steps=10,
        step_title="Step 6: Autonomous Action Executed",
        step_description="Paneer-heavy items marked Limited Availability. Agent is currently monitoring recovery.",
        is_simulating=False,
    ))

    # ── Incidents ─────────────────────────────────────────────────────────────
    incidents = [
        OperationalIncident(id="inc-01", date="Yesterday, 14:15 PM", ingredient_name="Fresh Dairy Cream", cause="Party hall catering booked 12 Dal Makhani & 8 Butter Chicken without advance notice.", action_taken="Limited cream-heavy portioning & dispatched runner restock alert to Amul distributor.", outcome="Stock preserved for evening service without running dry. Restocked at 16:00 PM.", status="RESOLVED"),
        OperationalIncident(id="inc-02", date="3 days ago, 20:30 PM", ingredient_name="Basmati Biryani Rice", cause="Heavy Friday dinner online delivery surge (28 biryanis in 45 minutes).", action_taken="Autonomously set Dum Biryani to LIMITED to protect dine-in orders.", outcome="Zero kitchen stockout disputes. Dine-in tables served without cancellation.", status="RESOLVED"),
        OperationalIncident(id="inc-03", date="Today, 10:45 AM", ingredient_name="Paneer (Fresh Malai)", cause="Abnormal lunch rush surge: 8 orders in 20 minutes (2x normal burn rate).", action_taken="Limited Paneer Butter Masala, Tikka & Biryani dishes to protect pending queue.", outcome="Active operational throttling in effect. Awaiting dairy batch restock.", status="ACTIVE"),
    ]
    session.add_all(incidents)

    await session.commit()
