"""
OpsPilot AI — LangGraph Workflow Nodes
Implements the 6-stage autonomous agentic lifecycle:
OBSERVE -> ANALYZE -> DECIDE -> ACT -> MONITOR -> ADAPT
"""

import time
import json
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.state import AgentState
from app.agent.decisions import AgentDecisionOutput, evaluate_deterministic_decision
from app.agent.prompts import OPSPILOT_SYSTEM_PROMPT, build_operational_context_prompt
from app.agent.tools import (
    get_restaurant_state,
    get_inventory,
    get_pending_orders,
    get_menu,
    detect_inventory_risks,
    update_menu_availability,
    create_operational_alert,
    record_agent_action,
    get_agent_settings,
)
from app.services.activity_service import (
    log_agent_event,
    record_agent_decision,
    record_agent_run,
    add_notification,
)
from app.core.config import get_settings
from app.core.logging import get_logger

import contextvars
from langchain_core.runnables import RunnableConfig

_session_context: contextvars.ContextVar[Optional[AsyncSession]] = contextvars.ContextVar("agent_session", default=None)


def set_current_session(session: AsyncSession):
    return _session_context.set(session)


def reset_current_session(token):
    _session_context.reset(token)


def _get_session(config: Optional[RunnableConfig] = None) -> AsyncSession:
    """Extract AsyncSession from contextvar or LangGraph runnable config."""
    sess = _session_context.get()
    if sess is not None:
        return sess
    if config:
        cfg = config.get("configurable", {}) if isinstance(config, dict) else getattr(config, "configurable", {}) or {}
        session = cfg.get("session")
        if session:
            return session
    raise ValueError("Database session missing from LangGraph configurable context")


# ── 1. OBSERVE NODE ───────────────────────────────────────────────────────────

async def observe_node(state: AgentState, config: Optional[RunnableConfig] = None) -> Dict[str, Any]:
    """
    OBSERVE: Gathers real-time signals from the restaurant operations layer.
    """
    session = _get_session(config)
    time_str = datetime.now().strftime("%I:%M %p")
    trigger = state.get("trigger", "Routine operational sweep")

    # Fetch operational data via tools
    restaurant = await get_restaurant_state(session)
    inventory = await get_inventory(session)
    pending_orders = await get_pending_orders(session)
    menu = await get_menu(session)
    active_risks = await detect_inventory_risks(session)

    # Check for recovery signal
    limited_items = [m for m in menu if m.get("availabilityStatus") == "LIMITED"]
    paneer_inv = next((i for i in inventory if "paneer" in i.get("ingredientId", "").lower()), None)
    is_recovered = bool(
        limited_items
        and paneer_inv
        and paneer_inv.get("estimatedStock", 0.0) >= 6.0
        and paneer_inv.get("riskLevel") == "NORMAL"
    )

    critical_risk = next((r for r in active_risks if r.get("riskLevel") == "CRITICAL"), None)

    if critical_risk:
        summary = (
            f"Critical surge detected on {critical_risk['ingredientName']}. "
            f"Current stock: {critical_risk['currentStock']} {critical_risk['unit']}, "
            f"consuming at {critical_risk['consumptionRate']} {critical_risk['unit']}/hr. "
            f"Estimated runout: {critical_risk['runoutMinutes']} minutes."
        )
        title = f"Inventory Risk Alert Observed: {critical_risk['ingredientName']}"
    elif is_recovered:
        summary = (
            f"Stock recovery observed: Paneer stock restored to {paneer_inv.get('estimatedStock')} kg. "
            f"{len(limited_items)} menu items currently restricted while risk conditions have cleared."
        )
        title = "Recovery Signals Observed"
    else:
        summary = (
            f"Operational signals normal across {len(inventory)} ingredients. "
            f"{len(pending_orders)} orders in preparation queue."
        )
        title = "Operational Baseline Signals Observed"

    # Log OBSERVE event
    await log_agent_event(
        session=session,
        stage="OBSERVE",
        title=title,
        description=summary,
        input_data={
            "activeRisksCount": len(active_risks),
            "criticalIngredient": critical_risk["ingredientName"] if critical_risk else None,
            "pendingOrdersCount": len(pending_orders),
            "trigger": trigger,
        },
        status="COMPLETED",
    )

    return {
        "observations": {
            "summary": summary,
            "restaurant": restaurant,
            "inventory": inventory,
            "pending_orders": pending_orders,
            "menu": menu,
            "limited_items": limited_items,
        },
        "active_risks": active_risks,
        "is_recovered": is_recovered,
        "timestamp": time_str,
    }


# ── 2. ANALYZE NODE ───────────────────────────────────────────────────────────

async def analyze_node(state: AgentState, config: Optional[RunnableConfig] = None) -> Dict[str, Any]:
    """
    ANALYZE: Synthesizes operational signals and evaluates risk curves.
    """
    session = _get_session(config)
    obs = state.get("observations", {})
    active_risks = state.get("active_risks", [])
    is_recovered = state.get("is_recovered", False)
    critical_risk = next((r for r in active_risks if r.get("riskLevel") == "CRITICAL"), None)

    if is_recovered:
        title = "Recovery & Capacity Threshold Assessment"
        analysis_text = (
            "Paneer stock has been replenished to safe operating levels (>= 6.0kg). "
            "Risk metrics returned to NORMAL. Restrictions are no longer necessary."
        )
    elif critical_risk:
        norm = critical_risk.get("normalRate", 0.8) or 0.8
        ratio = round(critical_risk.get("consumptionRate", 0.0) / norm, 1)
        title = f"High-Risk Stock Depletion Analysis: {critical_risk['ingredientName']}"
        analysis_text = (
            f"Current consumption rate ({critical_risk['consumptionRate']} {critical_risk['unit']}/hr) "
            f"is {ratio}× baseline rate. Available stock ({critical_risk['currentStock']} {critical_risk['unit']}) "
            f"will exhaust in approximately {critical_risk['runoutMinutes']} minutes."
        )
    else:
        title = "Operational Telemetry Stability Check"
        analysis_text = "All tracked ingredient runout projections exceed safe thresholds. No operational interventions required."

    await log_agent_event(
        session=session,
        stage="ANALYZE",
        title=title,
        description=analysis_text,
        input_data={
            "riskLevel": critical_risk["riskLevel"] if critical_risk else "NORMAL",
            "runoutMinutes": critical_risk["runoutMinutes"] if critical_risk else 999,
        },
        status="COMPLETED",
    )

    return {
        "analysis": {
            "title": title,
            "summary": analysis_text,
            "has_critical_risk": bool(critical_risk),
            "critical_risk": critical_risk,
        }
    }


# ── 3. DECIDE NODE ───────────────────────────────────────────────────────────

async def decide_node(state: AgentState, config: Optional[RunnableConfig] = None) -> Dict[str, Any]:
    """
    DECIDE: Formulates an optimal operational action.
    Uses Gemini API for contextual reasoning if configured, with deterministic fallback.
    """
    session = _get_session(config)
    settings = await get_agent_settings(session)
    permissions = settings.get("permissions", {})
    obs = state.get("observations", {})
    active_risks = state.get("active_risks", [])
    is_recovered = state.get("is_recovered", False)
    trigger = state.get("trigger", "Operations analysis")

    decision_output: Optional[AgentDecisionOutput] = None
    app_settings = get_settings()

    # Try Gemini if API key is active
    if app_settings.has_gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=app_settings.gemini_api_key)
            prompt = build_operational_context_prompt(
                restaurant=obs.get("restaurant", {}),
                trigger=trigger,
                active_risks=active_risks,
                inventory=obs.get("inventory", []),
                menu=obs.get("menu", []),
                pending_orders=obs.get("pending_orders", []),
                permissions=permissions,
            )

            # 4-second timeout to prevent lag
            def _call_gemini():
                return client.models.generate_content(
                    model=app_settings.gemini_model,
                    contents=prompt,
                    config={
                        "system_instruction": OPSPILOT_SYSTEM_PROMPT,
                        "response_mime_type": "application/json",
                    },
                )

            loop = asyncio.get_running_loop()
            gemini_res = await asyncio.wait_for(
                loop.run_in_executor(None, _call_gemini),
                timeout=4.0,
            )

            if gemini_res and gemini_res.text:
                parsed = json.loads(gemini_res.text)
                decision_output = AgentDecisionOutput(**parsed)
                logger.info(f"Gemini reasoning succeeded: {decision_output.decision_title}")
        except Exception as e:
            logger.warning(f"Gemini call skipped/failed ({e}); using deterministic fallback engine.")

    # Fallback if Gemini not available or failed
    if decision_output is None:
        decision_output = evaluate_deterministic_decision(
            active_risks=active_risks,
            inventory=obs.get("inventory", []),
            menu_items=obs.get("menu", []),
            permissions=permissions,
            is_recovered=is_recovered,
        )

    # Record decision in database
    critical_risk = next((r for r in active_risks if r.get("riskLevel") == "CRITICAL"), None)
    context_data = {
        "ingredientName": critical_risk["ingredientName"] if critical_risk else "Paneer",
        "stock": critical_risk["currentStock"] if critical_risk else 10.0,
        "unit": critical_risk["unit"] if critical_risk else "kg",
        "consumptionRate": critical_risk["consumptionRate"] if critical_risk else 0.8,
        "normalRate": critical_risk["normalRate"] if critical_risk else 0.8,
        "pendingOrders": len(obs.get("pending_orders", [])),
        "runoutMinutes": critical_risk["runoutMinutes"] if critical_risk else 999,
    }

    alternatives = [
        "Limit paneer-heavy dishes (Targeted mitigation)",
        "Disable all paneer menu items immediately (Aggressive disruption)",
        "Notify kitchen manager for emergency procurement",
        "Continue monitoring without operational intervention",
    ]

    dec_record = await record_agent_decision(
        session=session,
        goal="Restore normal menu capacity" if is_recovered else "Prevent operational disruptions and kitchen stockouts",
        trigger=trigger,
        context=context_data,
        available_alternatives=alternatives,
        decision=decision_output.decision_title,
        reason=decision_output.reason,
        action=decision_output.recommended_action,
        action_params={"target_menu_item_ids": decision_output.target_menu_item_ids},
        status="Executed" if decision_output.recommended_action != "CONTINUE_MONITORING" else "Monitoring",
    )

    # Log DECIDE event
    await log_agent_event(
        session=session,
        stage="ADAPT" if is_recovered else "DECIDE",
        title=f"Decision: {decision_output.decision_title}",
        description=decision_output.reason,
        decision=decision_output.decision_title,
        action=decision_output.recommended_action,
        action_target=decision_output.target,
        status="COMPLETED",
    )

    return {
        "decision": decision_output.model_dump(),
        "selected_action": decision_output.recommended_action,
        "confidence": decision_output.confidence,
        "goal": dec_record.goal,
    }


# ── 4. ACT NODE ───────────────────────────────────────────────────────────────

async def act_node(state: AgentState, config: Optional[RunnableConfig] = None) -> Dict[str, Any]:
    """
    ACT: Executes the selected action via validated tools.
    Modifies database state safely.
    """
    session = _get_session(config)
    decision = state.get("decision", {})
    action = state.get("selected_action", "CONTINUE_MONITORING")
    target_ids = decision.get("target_menu_item_ids", [])
    target_name = decision.get("target", "Target Items")
    reason = decision.get("reason", "")
    time_str = datetime.now().strftime("%I:%M %p")

    executed_actions = []
    action_result_desc = ""

    if action == "LIMIT_MENU_ITEM":
        if not target_ids:
            target_ids = ["menu-pbm", "menu-pt", "menu-pb"]
        updated_names = await update_menu_availability(
            session=session,
            menu_item_ids=target_ids,
            status="LIMITED",
            reason="OpsPilot Autonomous Guard: Limited to conserve inventory during peak rush.",
        )
        names_str = ", ".join(updated_names) or target_name
        executed_actions.append(f"Marked {len(target_ids)} items as Limited ({names_str})")
        action_result_desc = f"Menu item availability updated to Limited for {names_str}."

        await log_agent_event(
            session=session,
            stage="ACT",
            title="Autonomous Action: Limited High-Demand Dishes",
            description=f"Automatically updated availability of {names_str} to 'Limited' to preserve inventory.",
            action="LIMIT_MENU_ITEM",
            action_target=names_str,
            result="Menu availability state updated across POS and online channels.",
            status="COMPLETED",
        )

        await add_notification(
            session=session,
            title="OpsPilot Guard Activated: Menu Items Limited",
            message=f"Limited availability set for {names_str} to protect paneer reserve.",
            notif_type="WARNING",
            action_link="/menu",
        )

    elif action == "RESTORE_MENU_ITEM":
        if not target_ids:
            # Restore all limited dishes
            menu = await get_menu(session)
            target_ids = [m["id"] for m in menu if m.get("availabilityStatus") == "LIMITED"]

        updated_names = await update_menu_availability(
            session=session,
            menu_item_ids=target_ids,
            status="AVAILABLE",
            reason=None,
        )
        names_str = ", ".join(updated_names) or target_name
        executed_actions.append(f"Restored {len(target_ids)} items to Available ({names_str})")
        action_result_desc = f"Restored {names_str} to Available following stock recovery."

        await log_agent_event(
            session=session,
            stage="ACT",
            title="Autonomous Action: Restored Full Menu",
            description=f"Stock recovered. Restored {names_str} to Available.",
            action="RESTORE_MENU_ITEM",
            action_target=names_str,
            result="All menu restrictions cleared.",
            status="COMPLETED",
        )

        await add_notification(
            session=session,
            title="Inventory Recovered: Menu Restored",
            message=f"OpsPilot restored {names_str} to full availability.",
            notif_type="SUCCESS",
            action_link="/menu",
        )

    elif action in ("CREATE_REPLENISHMENT_ALERT", "NOTIFY_MANAGER"):
        executed_actions.append("Dispatched replenishment alert to kitchen manager")
        action_result_desc = "Procurement notification dispatched to kitchen dashboard."

        await add_notification(
            session=session,
            title="Kitchen Procurement Priority Alert",
            message=reason or "Elevated consumption requires restocking attention.",
            notif_type="CRITICAL",
            action_link="/inventory",
        )

    else:
        executed_actions.append("No active intervention required; telemetry nominal.")
        action_result_desc = "Maintained standard operational monitoring."

    return {
        "action_result": {
            "executed_actions": executed_actions,
            "description": action_result_desc,
            "timestamp": time_str,
        }
    }


# ── 5. MONITOR NODE ──────────────────────────────────────────────────────────

async def monitor_node(state: AgentState, config: Optional[RunnableConfig] = None) -> Dict[str, Any]:
    """
    MONITOR: Observes post-action operational telemetry to confirm stabilization.
    """
    session = _get_session(config)
    action = state.get("selected_action", "CONTINUE_MONITORING")
    is_recovered = state.get("is_recovered", False)
    time_str = datetime.now().strftime("%I:%M %p")

    if is_recovered:
        desc = "Observing new order intake and stock depletion rate under restored menu capacity."
    elif action == "LIMIT_MENU_ITEM":
        desc = "Agent is monitoring order velocity, paneer burn rate stabilization, and awaiting replenishment."
    else:
        desc = "Agent maintains ongoing monitoring of POS orders and inventory runout curve."

    await log_agent_event(
        session=session,
        stage="MONITOR",
        title="Active Operations Monitoring",
        description=desc,
        status="MONITORING",
    )

    return {
        "monitoring_result": {
            "status": "MONITORING",
            "description": desc,
            "timestamp": time_str,
        }
    }


# ── 6. ADAPT NODE ────────────────────────────────────────────────────────────

async def adapt_node(state: AgentState, config: Optional[RunnableConfig] = None) -> Dict[str, Any]:
    """
    ADAPT: Evaluates whether previous operational decisions need to be modified.
    Records the final execution run in AgentRun.
    """
    session = _get_session(config)
    is_recovered = state.get("is_recovered", False)
    action = state.get("selected_action", "CONTINUE_MONITORING")
    decision = state.get("decision", {})
    trigger = state.get("trigger", "Operations sweep")
    goal = state.get("goal", "Optimize restaurant operations")
    active_risks = state.get("active_risks", [])

    adaptation_desc = ""
    if is_recovered:
        adaptation_desc = "Agent adapted to stabilized stock by reversing throttling restrictions."
        await log_agent_event(
            session=session,
            stage="ADAPT",
            title="Autonomous Adaptation: Restored Full Menu",
            description="Operational conditions normalized. Throttling measures completely reversed.",
            action="RESTORE_MENU_ITEM",
            status="COMPLETED",
        )

    # Record complete run in AgentRun
    run_record = await record_agent_run(
        session=session,
        trigger=trigger,
        goal=goal,
        action_taken=action,
        summary=decision.get("reason", "Routine operational cycle executed."),
        confidence=state.get("confidence", 0.95),
        active_risks_count=len(active_risks),
    )

    return {
        "adaptation": {
            "adapted": is_recovered,
            "description": adaptation_desc or "Operating within nominal adaptation parameters.",
        },
        "status": "COMPLETED",
        "run_id": run_record.id,
    }
