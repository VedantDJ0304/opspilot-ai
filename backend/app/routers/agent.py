"""
OpsPilot AI — Agent & Demo Router
Provides manual triggers, full demo scenario, 10-step interactive progression,
activity timelines, and agent settings.
"""

import time
from datetime import datetime
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, delete

from app.core.database import get_db
from app.models.agent import AgentRun, AgentEvent, AgentDecision
from app.models.settings import AgentSettings
from app.models.demo import DemoState
from app.models.inventory import InventoryItem, InventoryTransaction
from app.models.order import Order, OrderItem
from app.models.notification import AppNotification
from app.schemas.agent import AgentRunRequest, DemoStepRequest
from app.agent.graph import execute_agent_workflow
from app.risk_engine.engine import run_risk_engine
from app.risk_engine.calculator import calculate_runout_minutes
from app.routers.state import get_operational_state
from app.seed.demo_data import seed_initial_data
from app.models.base import Base
from app.core.database import engine

router = APIRouter(prefix="/api/agent", tags=["Agent"])


DEMO_STEPS = [
    {"stepNumber": 1, "title": "New Orders Arriving", "description": "A sudden burst of lunch rush orders arrives for paneer-heavy entrees."},
    {"stepNumber": 2, "title": "Consumption Rate Increased", "description": "Deterministic consumption calculation surges paneer rate from 0.8 kg/hr to 1.6 kg/hr (2× normal)."},
    {"stepNumber": 3, "title": "Operational Risk Detected", "description": "Estimated runout drops below 45 minutes; risk engine elevates Paneer to CRITICAL."},
    {"stepNumber": 4, "title": "AI Analyzing Situation", "description": "OpsPilot AI observes the spike, calculates depletion trajectory, and evaluates mitigation alternatives."},
    {"stepNumber": 5, "title": "Decision Formulated", "description": "Agent decides to temporarily limit paneer-heavy items to preserve core stock."},
    {"stepNumber": 6, "title": "Autonomous Action Executed", "description": "Paneer Butter Masala, Paneer Tikka, and Paneer Biryani marked Limited across channels."},
    {"stepNumber": 7, "title": "Monitoring Outcome", "description": "Agent monitors real-time telemetry; paneer burn rate stabilizes and remaining stock is shielded."},
    {"stepNumber": 8, "title": "Inventory Restocked", "description": "Manager logs delivery of fresh dairy stock: +8.0 kg Paneer added to inventory baseline."},
    {"stepNumber": 9, "title": "Risk Metric Normalized", "description": "Recalculated runout exceeds 8 hours; risk engine clears CRITICAL status to NORMAL."},
    {"stepNumber": 10, "title": "Menu Availability Restored", "description": "AI adapts to recovered operational conditions and autonomously restores all dishes to Available."},
]


@router.post("/run")
async def run_agent(
    payload: Optional[AgentRunRequest] = None,
    session: AsyncSession = Depends(get_db),
):
    """Manually trigger a complete LangGraph agent cycle."""
    trigger = payload.trigger if payload and payload.trigger else "Manager requested operational analysis"
    result = await execute_agent_workflow(session=session, trigger=trigger)
    updated_state = await get_operational_state(session)
    return {
        "success": True,
        "result": result,
        "state": updated_state,
    }


@router.post("/demo")
async def run_full_demo(session: AsyncSession = Depends(get_db)):
    """
    Run complete end-to-end AI Operations Demo Scenario:
    1. Simulates burst of orders
    2. Elevates consumption rate & triggers CRITICAL risk
    3. Runs LangGraph agent (Observe -> Analyze -> Decide -> Act -> Monitor -> Adapt)
    4. Automatically mitigates shortage by limiting items
    5. Returns the updated state
    """
    time_str = datetime.now().strftime("%I:%M %p")

    # 1. Simulate burst order
    new_order = Order(
        id=f"ord-demo-{int(time.time() * 1000)}",
        order_number=1045,
        subtotal=1490.0,
        tax=74.5,
        total=1564.5,
        status="Pending",
        created_at=time_str,
        ingredient_impact_summary="Paneer -850g, Butter -90g, Cream -90ml, Tomato -300g",
        table_or_channel="Dine-In Banquet",
    )
    session.add(new_order)

    # 2. Surge paneer consumption to trigger CRITICAL risk
    paneer_res = await session.execute(
        select(InventoryItem).where(InventoryItem.ingredient_id == "ing-paneer")
    )
    paneer = paneer_res.scalar_one_or_none()
    if paneer:
        paneer.estimated_stock = 2.1
        paneer.consumption_rate_per_hour = 1.6
        paneer.estimated_runout_minutes = 45
        paneer.risk_level = "CRITICAL"
        paneer.pending_demand_units = 8

    await run_risk_engine(session, "balanced")

    # 3. Execute LangGraph agent
    agent_result = await execute_agent_workflow(
        session=session,
        trigger="Demonstration: Severe Paneer Surge during Banquet Lunch Rush",
    )

    # Update demo state to Step 6
    demo_res = await session.execute(select(DemoState).where(DemoState.id == 1))
    demo = demo_res.scalar_one_or_none()
    if demo:
        demo.current_step = 6
        demo.step_title = "Step 6: Autonomous Action Executed"
        demo.step_description = "Paneer-heavy items marked Limited Availability. Agent is currently monitoring recovery."

    updated_state = await get_operational_state(session)
    return {
        "success": True,
        "agentResult": agent_result,
        "state": updated_state,
    }


@router.post("/demo-step")
async def advance_demo_step(
    payload: Optional[DemoStepRequest] = None,
    session: AsyncSession = Depends(get_db),
):
    """
    Advance the 10-step interactive demo scenario.
    Demonstrates the complete Judge lifecycle step by step.
    """
    demo_res = await session.execute(select(DemoState).where(DemoState.id == 1))
    demo = demo_res.scalar_one_or_none()
    current = demo.current_step if demo else 1

    target_step = payload.step if payload and payload.step is not None else (1 if current >= 10 else current + 1)
    time_str = datetime.now().strftime("%I:%M %p")

    paneer_res = await session.execute(
        select(InventoryItem).where(InventoryItem.ingredient_id == "ing-paneer")
    )
    paneer = paneer_res.scalar_one_or_none()

    if target_step == 1:
        # Step 1: Simulate new orders
        new_order = Order(
            id=f"ord-step1-{int(time.time() * 1000)}",
            order_number=1043,
            subtotal=1490.0,
            tax=74.5,
            total=1564.5,
            status="Pending",
            created_at=time_str,
            ingredient_impact_summary="Paneer -850g, Butter -90g, Cream -90ml, Tomato -300g",
            table_or_channel="Dine-In Banquet",
        )
        session.add(new_order)

    elif target_step == 2:
        # Step 2: Consumption rate increase
        if paneer:
            paneer.estimated_stock = 2.1
            paneer.consumption_rate_per_hour = 1.6
            paneer.estimated_runout_minutes = 45

    elif target_step == 3:
        # Step 3: Risk engine triggers CRITICAL
        if paneer:
            paneer.risk_level = "CRITICAL"
        await run_risk_engine(session, "balanced")

    elif target_step in (4, 5, 6):
        # Steps 4, 5, 6: AI observation, decision, action
        await execute_agent_workflow(session, trigger="Demonstration: Severe Paneer Surge")

    elif target_step == 7:
        # Step 7: Monitoring stage
        from app.services.activity_service import log_agent_event
        await log_agent_event(
            session=session,
            stage="MONITOR",
            title="Post-Action Inflow Stabilization",
            description="Incoming paneer order velocity decelerated by 65%. Available stock preserved at 2.1 kg.",
            status="MONITORING",
        )

    elif target_step == 8:
        # Step 8: Restock (+8.0 kg Paneer)
        if paneer:
            paneer.physical_baseline_stock = 10.1
            paneer.estimated_stock = 10.1
            paneer.consumption_rate_per_hour = 0.9
            paneer.estimated_runout_minutes = calculate_runout_minutes(10.1, 0.9)
            paneer.risk_level = "NORMAL"
            paneer.last_count_at = f"{time_str} (Delivery Check)"

            session.add(InventoryTransaction(
                id=f"tx-restock-{int(time.time() * 1000)}",
                timestamp=time_str,
                ingredient_id="ing-paneer",
                ingredient_name="Paneer (Cottage Cheese)",
                type="PURCHASE",
                delta=8.0,
                unit="kg",
                balance_after=10.1,
                note="Emergency stock replenishment verified by Manager Rajesh K.",
            ))

            session.add(AppNotification(
                id=f"notif-restock-{int(time.time() * 1000)}",
                title="Stock Replenished: Paneer +8.0 kg",
                message="Kitchen received dairy delivery. Total estimated stock now 10.1 kg.",
                type="SUCCESS",
                timestamp=time_str,
                read=False,
                action_link="/inventory",
            ))

    elif target_step == 9:
        # Step 9: Re-evaluate risk engine -> clears CRITICAL
        await run_risk_engine(session, "balanced")

    elif target_step == 10:
        # Step 10: AI ADAPTATION: Restores dishes to Available!
        await execute_agent_workflow(session, trigger="Demonstration: Stock Recovery & Menu Restoration")

    # Update demo state record
    step_info = DEMO_STEPS[target_step - 1] if target_step <= len(DEMO_STEPS) else DEMO_STEPS[0]
    if demo:
        demo.current_step = target_step
        demo.step_title = f"Step {target_step}: {step_info['title']}"
        demo.step_description = step_info["description"]
        demo.is_simulating = False

    updated_state = await get_operational_state(session)
    return {
        "success": True,
        "step": target_step,
        "state": updated_state,
    }


@router.post("/demo/reset")
@router.post("/reset")
async def reset_demo_state(session: AsyncSession = Depends(get_db)):
    """Reset database state to the pristine initial Spice Garden demo state."""
    # Delete all records from all tables
    for model in [
        OrderItem, Order, InventoryTransaction, OperationalRisk,
        AgentEvent, AgentDecision, AgentRun, AppNotification,
        InventoryItem, MenuItem, Ingredient, DemoState, AgentSettings
    ]:
        await session.execute(delete(model))
    await session.commit()

    # Re-seed initial data
    await seed_initial_data(session)

    updated_state = await get_operational_state(session)
    return {
        "success": True,
        "state": updated_state,
    }


@router.get("/runs")
async def get_agent_runs(session: AsyncSession = Depends(get_db)):
    """Retrieve history of agent execution runs."""
    result = await session.execute(select(AgentRun).order_by(desc(AgentRun.id)).limit(20))
    runs = result.scalars().all()
    return [
        {
            "id": r.id,
            "timestamp": r.timestamp,
            "trigger": r.trigger,
            "goal": r.goal,
            "status": r.status,
            "confidence": r.confidence,
            "activeRisksCount": r.active_risks_count,
            "actionTaken": r.action_taken,
            "durationMs": r.duration_ms,
            "summary": r.summary,
        }
        for r in runs
    ]


@router.get("/activity")
async def get_agent_activity(session: AsyncSession = Depends(get_db)):
    """Retrieve agent events activity timeline."""
    result = await session.execute(select(AgentEvent).order_by(desc(AgentEvent.id)).limit(50))
    events = list(result.scalars().all())
    events.reverse()
    return [
        {
            "id": e.id,
            "timestamp": e.timestamp,
            "stage": e.stage,
            "title": e.title,
            "description": e.description,
            "action": e.action,
            "actionTarget": e.action_target,
            "result": e.result,
            "status": e.status,
        }
        for e in events
    ]


@router.get("/status")
async def get_agent_status(session: AsyncSession = Depends(get_db)):
    """Get active agent runtime status and configuration."""
    set_res = await session.execute(select(AgentSettings).where(AgentSettings.id == 1))
    settings = set_res.scalar_one_or_none()
    return {
        "agentEnabled": settings.agent_enabled if settings else True,
        "operationalStatus": "Active Monitoring",
        "loop": ["OBSERVE", "ANALYZE", "DECIDE", "ACT", "MONITOR", "ADAPT"],
        "model": "Gemini 2.5 Flash / Deterministic Fallback",
    }


@router.get("/settings")
async def get_agent_settings_endpoint(session: AsyncSession = Depends(get_db)):
    """Get agent configuration and permission settings."""
    set_res = await session.execute(select(AgentSettings).where(AgentSettings.id == 1))
    settings = set_res.scalar_one_or_none()
    if not settings:
        return {}
    return {
        "agentEnabled": settings.agent_enabled,
        "monitoringFrequencyMinutes": settings.monitoring_frequency_minutes,
        "riskSensitivity": settings.risk_sensitivity,
        "permissions": settings.get_permissions(),
        "operatingHours": settings.operating_hours,
        "restaurantName": settings.restaurant_name,
        "currencySymbol": settings.currency_symbol,
    }


@router.patch("/settings")
async def update_agent_settings_endpoint(
    payload: dict,
    session: AsyncSession = Depends(get_db),
):
    """Update agent permissions and operating settings."""
    set_res = await session.execute(select(AgentSettings).where(AgentSettings.id == 1))
    settings = set_res.scalar_one_or_none()
    if not settings:
        settings = AgentSettings(id=1)
        session.add(settings)

    if "agentEnabled" in payload:
        settings.agent_enabled = bool(payload["agentEnabled"])
    if "monitoringFrequencyMinutes" in payload:
        settings.monitoring_frequency_minutes = int(payload["monitoringFrequencyMinutes"])
    if "riskSensitivity" in payload:
        settings.risk_sensitivity = str(payload["riskSensitivity"])
    if "permissions" in payload:
        existing = settings.get_permissions()
        existing.update(payload["permissions"])
        settings.set_permissions(existing)

    updated_state = await get_operational_state(session)
    return {
        "success": True,
        "settings": {
            "agentEnabled": settings.agent_enabled,
            "monitoringFrequencyMinutes": settings.monitoring_frequency_minutes,
            "riskSensitivity": settings.risk_sensitivity,
            "permissions": settings.get_permissions(),
        },
        "state": updated_state,
    }
