"""
OpsPilot AI — LangGraph Autonomous Workflow
Compiles and executes the 6-stage operational state machine:
START -> observe -> analyze -> decide -> act -> monitor -> adapt -> END
"""

import time
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from langgraph.graph import StateGraph, START, END

from app.agent.state import AgentState
from app.agent.nodes import (
    observe_node,
    analyze_node,
    decide_node,
    act_node,
    monitor_node,
    adapt_node,
    set_current_session,
    reset_current_session,
)
from app.core.logging import get_logger

logger = get_logger(__name__)


def build_agent_graph():
    """Construct and compile the LangGraph operational state machine."""
    workflow = StateGraph(AgentState)

    # Add the 6 core operational lifecycle nodes
    workflow.add_node("observe", observe_node)
    workflow.add_node("analyze", analyze_node)
    workflow.add_node("decide", decide_node)
    workflow.add_node("act", act_node)
    workflow.add_node("monitor", monitor_node)
    workflow.add_node("adapt", adapt_node)

    # Define linear operational lifecycle flow
    workflow.add_edge(START, "observe")
    workflow.add_edge("observe", "analyze")
    workflow.add_edge("analyze", "decide")
    workflow.add_edge("decide", "act")
    workflow.add_edge("act", "monitor")
    workflow.add_edge("monitor", "adapt")
    workflow.add_edge("adapt", END)

    return workflow.compile()


# Singleton compiled graph
agent_app = build_agent_graph()


async def execute_agent_workflow(
    session: AsyncSession,
    trigger: str = "Routine operational sweep",
    goal: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Execute a complete LangGraph operational cycle.
    Passes the active SQLAlchemy AsyncSession securely into node configurations.
    """
    start_time = time.time()
    initial_state: AgentState = {
        "trigger": trigger,
        "goal": goal or "Optimize restaurant operations and prevent inventory stockouts",
        "status": "RUNNING",
    }

    config = {"configurable": {"session": session}}
    logger.info(f"Starting LangGraph Agent cycle: trigger='{trigger}'")

    token = set_current_session(session)
    try:
        final_state = await agent_app.ainvoke(initial_state, config=config)
    finally:
        reset_current_session(token)

    duration_ms = int((time.time() - start_time) * 1000)

    decision = final_state.get("decision", {})
    action_result = final_state.get("action_result", {})

    logger.info(
        f"Completed LangGraph Agent cycle in {duration_ms}ms: "
        f"decision='{decision.get('decision_title', 'None')}', "
        f"action='{final_state.get('selected_action', 'None')}'"
    )

    return {
        "observed": final_state.get("observations", {}).get("summary", ""),
        "analysis": final_state.get("analysis", {}).get("summary", ""),
        "decision": decision,
        "action": final_state.get("selected_action", ""),
        "actionResult": action_result,
        "monitoring": final_state.get("monitoring_result", {}),
        "adaptation": final_state.get("adaptation", {}),
        "confidence": final_state.get("confidence", 0.95),
        "runId": final_state.get("run_id", ""),
        "durationMs": duration_ms,
        "status": "COMPLETED",
    }
