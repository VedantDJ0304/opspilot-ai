"""
OpsPilot AI — Agent Memory
Simple persistent agent memory backed by SQLite/PostgreSQL.
Stores episodic operational memories and retrieves historical decisions.
"""

import json
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.agent import AgentMemory, AgentDecision


async def save_memory(
    session: AsyncSession,
    key: str,
    content: Dict[str, Any],
    memory_type: str = "operational_context",
) -> AgentMemory:
    """Save or update an operational episodic memory item."""
    time_str = datetime.now().strftime("%I:%M %p")
    result = await session.execute(select(AgentMemory).where(AgentMemory.key == key))
    memory = result.scalar_one_or_none()

    if memory:
        memory.content_json = json.dumps(content)
        memory.timestamp = time_str
    else:
        memory = AgentMemory(
            id=f"mem-{int(datetime.now().timestamp() * 1000)}",
            key=key,
            memory_type=memory_type,
            content_json=json.dumps(content),
            timestamp=time_str,
        )
        session.add(memory)

    return memory


async def get_memory(session: AsyncSession, key: str) -> Optional[Dict[str, Any]]:
    """Retrieve an episodic memory item by key."""
    result = await session.execute(select(AgentMemory).where(AgentMemory.key == key))
    memory = result.scalar_one_or_none()
    if memory:
        return memory.get_content()
    return None


async def get_recent_decisions_memory(session: AsyncSession, limit: int = 5) -> List[Dict[str, Any]]:
    """Retrieve recent decision memory items for contextual grounding."""
    result = await session.execute(
        select(AgentDecision).order_by(desc(AgentDecision.id)).limit(limit)
    )
    decisions = result.scalars().all()
    return [
        {
            "id": d.id,
            "timestamp": d.timestamp,
            "goal": d.goal,
            "decision": d.decision,
            "action": d.action,
            "result": d.result,
        }
        for d in decisions
    ]
