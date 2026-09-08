"""
OpsPilot AI — LangGraph Agent State
Defines the shared state passed between all nodes in the operational agent workflow:
OBSERVE -> ANALYZE -> DECIDE -> ACT -> MONITOR -> ADAPT
"""

from typing import TypedDict, List, Dict, Any, Optional


class AgentState(TypedDict, total=False):
    restaurant_id: str
    run_id: str
    timestamp: str
    trigger: str
    goal: str
    
    # 1. OBSERVE
    observations: Dict[str, Any]
    active_risks: List[Dict[str, Any]]
    
    # 2. ANALYZE
    analysis: Dict[str, Any]
    
    # 3. DECIDE
    decision: Dict[str, Any]
    selected_action: str
    confidence: float
    
    # 4. ACT
    action_result: Dict[str, Any]
    
    # 5. MONITOR
    monitoring_result: Dict[str, Any]
    
    # 6. ADAPT
    adaptation: Dict[str, Any]
    is_recovered: bool
    
    # History & Execution
    messages: List[Dict[str, Any]]
    status: str
    error: Optional[str]
