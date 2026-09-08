"""
OpsPilot AI — Agent Decisions
Pydantic decision models, output validation, and deterministic fallback reasoning.
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field

OperationalActionType = Literal[
    "LIMIT_MENU_ITEM",
    "DISABLE_MENU_ITEM",
    "RESTORE_MENU_ITEM",
    "NOTIFY_MANAGER",
    "CREATE_REPLENISHMENT_ALERT",
    "ADJUST_MONITORING",
    "CONTINUE_MONITORING",
]


class AgentDecisionOutput(BaseModel):
    """Structured decision output produced by Gemini or deterministic fallback."""
    risk: str = Field(description="Identifier or category of the operational risk, e.g. PANEER_STOCKOUT or NONE")
    severity: Literal["NORMAL", "LOW", "MEDIUM", "HIGH", "CRITICAL"] = Field(description="Operational severity level")
    reason: str = Field(description="Concise operational rationale for the decision (1-2 sentences)")
    decision_title: str = Field(description="Concise title summarizing the operational decision")
    recommended_action: OperationalActionType = Field(description="Action chosen from available autonomous operations")
    target_menu_item_ids: List[str] = Field(default_factory=list, description="Target menu item IDs affected by this action")
    target: str = Field(default="", description="Human-readable target name(s)")
    confidence: float = Field(default=0.92, ge=0.0, le=1.0, description="Agent confidence score")
    monitoring_objective: str = Field(default="Monitor order velocity and inventory runout curve", description="Post-action monitoring directive")


def evaluate_deterministic_decision(
    active_risks: List[dict],
    inventory: List[dict],
    menu_items: List[dict],
    permissions: dict,
    is_recovered: bool = False,
) -> AgentDecisionOutput:
    """
    Deterministic fallback decision logic.
    Ensures the system never crashes when Gemini is unavailable, rate-limited, or unconfigured.
    """
    limited_items = [m for m in menu_items if m.get("availabilityStatus") == "LIMITED"]

    # 1. Check for Recovery & Adaptation
    if is_recovered or (
        limited_items and not any(r.get("riskLevel") in ("CRITICAL", "WARNING") for r in active_risks)
    ):
        target_ids = [m["id"] for m in limited_items]
        target_names = ", ".join(m["name"] for m in limited_items)
        can_restore = permissions.get("restoreMenuItems", True)
        
        return AgentDecisionOutput(
            risk="STOCK_RECOVERED",
            severity="NORMAL",
            decision_title="Restore full menu availability following inventory recovery",
            reason="Inventory stock has replenished to safe operating levels. Restricting menu items is no longer required.",
            recommended_action="RESTORE_MENU_ITEM" if can_restore else "NOTIFY_MANAGER",
            target_menu_item_ids=target_ids,
            target=target_names or "All Restricted Items",
            confidence=0.98,
            monitoring_objective="Observe new order velocity under full menu capacity",
        )

    # 2. Check for Critical Risk
    critical_risk = next((r for r in active_risks if r.get("riskLevel") == "CRITICAL"), None)
    if critical_risk:
        ing_id = critical_risk.get("ingredientId", "")
        ing_name = critical_risk.get("ingredientName", "Ingredient")
        runout = critical_risk.get("runoutMinutes", 45)
        stock = critical_risk.get("currentStock", 0.0)
        unit = critical_risk.get("unit", "kg")
        rate = critical_risk.get("consumptionRate", 0.0)
        norm = critical_risk.get("normalRate", 0.8) or 0.8
        ratio = round(rate / norm, 1)

        # Map affected dishes
        target_items = []
        if "paneer" in ing_id.lower() or "paneer" in ing_name.lower():
            target_items = [m for m in menu_items if "paneer" in m.get("name", "").lower()]
        if not target_items:
            target_items = [m for m in menu_items if m.get("category") == "Main Course"][:2]

        target_ids = [m["id"] for m in target_items]
        target_names = ", ".join(m["name"] for m in target_items)
        can_limit = permissions.get("limitMenuItems", True)

        return AgentDecisionOutput(
            risk=f"{ing_name.upper().split(' ')[0]}_STOCKOUT",
            severity="CRITICAL",
            decision_title=f"Temporarily limit {ing_name.split(' ')[0]}-heavy dishes to prevent total kitchen stockout",
            reason=f"Current consumption rate ({rate} {unit}/hr) is {ratio}× normal baseline. Stock ({stock} {unit}) will exhaust in ~{runout} minutes. Limiting dishes protects kitchen capacity.",
            recommended_action="LIMIT_MENU_ITEM" if can_limit else "NOTIFY_MANAGER",
            target_menu_item_ids=target_ids,
            target=target_names,
            confidence=0.95,
            monitoring_objective=f"Verify order velocity deceleration on {ing_name}",
        )

    # 3. Check for Warning Risk
    warning_risk = next((r for r in active_risks if r.get("riskLevel") == "WARNING"), None)
    if warning_risk:
        ing_name = warning_risk.get("ingredientName", "Ingredient")
        return AgentDecisionOutput(
            risk=f"{ing_name.upper().split(' ')[0]}_ELEVATED_CONSUMPTION",
            severity="HIGH",
            decision_title=f"Alert kitchen procurement for elevated consumption on {ing_name}",
            reason=f"Elevated consumption detected on {ing_name}. Proactively queuing replenishment notification to avert escalation.",
            recommended_action="CREATE_REPLENISHMENT_ALERT",
            target_menu_item_ids=[],
            target=ing_name,
            confidence=0.90,
            monitoring_objective=f"Track arrival of replenishment for {ing_name}",
        )

    # 4. Normal Baseline
    return AgentDecisionOutput(
        risk="NONE",
        severity="NORMAL",
        decision_title="Maintain operational watch; all telemetry within tolerance thresholds",
        reason="All tracked ingredient runout projections exceed safe thresholds. Order inflow matches baseline rush distributions.",
        recommended_action="CONTINUE_MONITORING",
        target_menu_item_ids=[],
        target="Kitchen Operations",
        confidence=0.99,
        monitoring_objective="Continuous routine polling of POS orders and kitchen stocks",
    )
