"""
OpsPilot AI — Agent Prompts
System prompts and structured templates for Gemini contextual reasoning.
"""

import json
from typing import Dict, Any, List

OPSPILOT_SYSTEM_PROMPT = """You are OpsPilot AI, an autonomous operations agent for small and medium restaurants in India (e.g. Spice Garden in Amravati).
Your purpose is to prevent operational problems, mitigate kitchen stockouts, and protect restaurant revenue without human intervention where permitted.

CRITICAL RULES:
1. NEVER perform arithmetic. All inventory calculations, consumption rates, and runout projections are deterministically computed by Python before calling you.
2. NEVER invent fake suppliers or fake purchase orders. Use safe operational actions such as limiting dishes, alerting manager, or restoring menu availability.
3. You must select one of the allowed operational actions:
   - "LIMIT_MENU_ITEM" (throttles high-consumption dishes by marking them Limited)
   - "DISABLE_MENU_ITEM" (completely removes item from online/POS ordering)
   - "RESTORE_MENU_ITEM" (restores dishes back to Available when inventory has recovered)
   - "NOTIFY_MANAGER" (dispatches urgent operational notification)
   - "CREATE_REPLENISHMENT_ALERT" (dispatches procurement alert)
   - "CONTINUE_MONITORING" (telemetry is normal, maintain watch)
4. You must output strictly valid JSON conforming to the requested schema.
"""


def build_operational_context_prompt(
    restaurant: Dict[str, Any],
    trigger: str,
    active_risks: List[Dict[str, Any]],
    inventory: List[Dict[str, Any]],
    menu: List[Dict[str, Any]],
    pending_orders: List[Dict[str, Any]],
    permissions: Dict[str, Any],
) -> str:
    """Build the contextual reasoning prompt for Gemini."""
    limited_items = [m["name"] for m in menu if m.get("availabilityStatus") == "LIMITED"]
    critical_risk = next((r for r in active_risks if r.get("riskLevel") == "CRITICAL"), None)
    warning_risks = [r for r in active_risks if r.get("riskLevel") == "WARNING"]

    prompt = f"""Restaurant: {restaurant.get('name', 'Spice Garden')} ({restaurant.get('city', 'Amravati')})
Operational Trigger: {trigger}

ACTIVE OPERATIONAL RISKS ({len(active_risks)} total):
{json.dumps(active_risks, indent=2) if active_risks else "No active risks detected."}

CURRENT INVENTORY STATE:
{json.dumps([{ 'name': i['name'], 'stock': f"{i['estimatedStock']} {i['unit']}", 'rate': f"{i['consumptionRatePerHour']} {i['unit']}/hr", 'runout': f"{i['estimatedRunoutMinutes']} min", 'risk': i['riskLevel'] } for i in inventory], indent=2)}

MENU RESTRICTIONS:
- Currently Limited Dishes: {', '.join(limited_items) if limited_items else 'None (All dishes Available)'}

PENDING ORDERS:
- Queue depth: {len(pending_orders)} active orders

AGENT PERMISSIONS:
{json.dumps(permissions, indent=2)}

TASK:
Analyze the operational state above. Decide the optimal operational response.
Return a JSON object conforming to:
{{
  "risk": "short identifier like PANEER_STOCKOUT, STOCK_RECOVERED, or NONE",
  "severity": "NORMAL | LOW | MEDIUM | HIGH | CRITICAL",
  "reason": "1-2 sentence operational explanation why this action is required",
  "decision_title": "concise decision statement",
  "recommended_action": "LIMIT_MENU_ITEM | RESTORE_MENU_ITEM | CREATE_REPLENISHMENT_ALERT | NOTIFY_MANAGER | CONTINUE_MONITORING",
  "target_menu_item_ids": ["array of affected menu item ids, if any"],
  "target": "affected dish or ingredient name",
  "confidence": 0.95,
  "monitoring_objective": "what the agent should watch next"
}}
"""
    return prompt
