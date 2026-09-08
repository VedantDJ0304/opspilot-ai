"""
OpsPilot AI — Activity Service
Manages logging and retrieval of Agent Events, Decisions, Runs, and Notifications.
"""

import time
import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.agent import AgentEvent, AgentDecision, AgentRun
from app.models.notification import AppNotification


async def log_agent_event(
    session: AsyncSession,
    stage: str,
    title: str,
    description: str,
    input_data: Optional[Dict[str, Any]] = None,
    decision: Optional[str] = None,
    action: Optional[str] = None,
    action_target: Optional[str] = None,
    result: Optional[str] = None,
    status: str = "COMPLETED",
) -> AgentEvent:
    """Record a single step in the agentic loop (OBSERVE, ANALYZE, DECIDE, ACT, MONITOR, ADAPT)."""
    time_str = datetime.now().strftime("%I:%M %p")
    event = AgentEvent(
        id=f"evt-{stage.lower()[:3]}-{int(time.time() * 1000)}",
        timestamp=time_str,
        stage=stage,
        title=title,
        description=description,
        input_data_json=json.dumps(input_data) if input_data else None,
        decision=decision,
        action=action,
        action_target=action_target,
        result=result,
        status=status,
    )
    session.add(event)
    return event


async def record_agent_decision(
    session: AsyncSession,
    goal: str,
    trigger: str,
    context: Dict[str, Any],
    available_alternatives: List[str],
    decision: str,
    reason: str,
    action: str,
    action_params: Dict[str, Any],
    result: str = "",
    status: str = "Executed",
) -> AgentDecision:
    """Record a structured decision formulated by the agent."""
    time_str = datetime.now().strftime("%I:%M %p")
    dec = AgentDecision(
        id=f"dec-{int(time.time() * 1000)}",
        timestamp=time_str,
        goal=goal,
        trigger=trigger,
        context_json=json.dumps(context),
        alternatives_json=json.dumps(available_alternatives),
        decision=decision,
        reason=reason,
        action=action,
        action_params_json=json.dumps(action_params),
        result=result,
        status=status,
    )
    session.add(dec)
    return dec


async def record_agent_run(
    session: AsyncSession,
    trigger: str,
    goal: str,
    action_taken: str,
    summary: str,
    confidence: float = 0.92,
    active_risks_count: int = 0,
    duration_ms: int = 0,
) -> AgentRun:
    """Record a high-level agent execution run."""
    time_str = datetime.now().strftime("%I:%M %p")
    run = AgentRun(
        id=f"run-{int(time.time() * 1000)}",
        timestamp=time_str,
        trigger=trigger,
        goal=goal,
        status="COMPLETED",
        confidence=confidence,
        active_risks_count=active_risks_count,
        action_taken=action_taken,
        duration_ms=duration_ms,
        summary=summary,
    )
    session.add(run)
    return run


async def add_notification(
    session: AsyncSession,
    title: str,
    message: str,
    notif_type: str = "INFO",
    action_link: Optional[str] = None,
) -> AppNotification:
    """Dispatch an in-app operational notification."""
    time_str = datetime.now().strftime("%I:%M %p")
    notif = AppNotification(
        id=f"notif-{int(time.time() * 1000)}",
        title=title,
        message=message,
        type=notif_type,
        timestamp=time_str,
        read=False,
        action_link=action_link,
    )
    session.add(notif)
    return notif


async def get_recent_agent_events(session: AsyncSession, limit: int = 50) -> List[AgentEvent]:
    """Retrieve recent agent events in chronological order."""
    result = await session.execute(
        select(AgentEvent).order_by(desc(AgentEvent.id)).limit(limit)
    )
    events = list(result.scalars().all())
    events.reverse()  # Chronological
    return events


async def get_recent_agent_runs(session: AsyncSession, limit: int = 20) -> List[AgentRun]:
    """Retrieve recent agent execution runs."""
    result = await session.execute(
        select(AgentRun).order_by(desc(AgentRun.id)).limit(limit)
    )
    return list(result.scalars().all())
