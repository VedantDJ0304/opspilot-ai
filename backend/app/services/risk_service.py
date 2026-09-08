"""
OpsPilot AI — Risk Service
Facade around the deterministic risk engine.
"""

from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.risk import OperationalRisk
from app.models.settings import AgentSettings
from app.risk_engine.engine import run_risk_engine


async def evaluate_operational_risks(session: AsyncSession) -> List[OperationalRisk]:
    """Run deterministic risk evaluation and return all active risks."""
    settings_result = await session.execute(select(AgentSettings).where(AgentSettings.id == 1))
    settings = settings_result.scalar_one_or_none()
    sensitivity = settings.risk_sensitivity if settings else "balanced"

    return await run_risk_engine(session, sensitivity)


async def get_active_risks(session: AsyncSession) -> List[OperationalRisk]:
    """Query currently active operational risks."""
    result = await session.execute(
        select(OperationalRisk).where(OperationalRisk.status == "ACTIVE")
    )
    return list(result.scalars().all())
