"""
OpsPilot AI — Settings Router
Provides general and agent settings management.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.settings import AgentSettings
from app.routers.state import get_operational_state

router = APIRouter(prefix="/api/settings", tags=["Settings"])


@router.get("")
async def get_settings(session: AsyncSession = Depends(get_db)):
    """Retrieve operational settings."""
    res = await session.execute(select(AgentSettings).where(AgentSettings.id == 1))
    settings = res.scalar_one_or_none()
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


@router.patch("")
async def update_settings(payload: dict, session: AsyncSession = Depends(get_db)):
    """Update settings."""
    res = await session.execute(select(AgentSettings).where(AgentSettings.id == 1))
    settings = res.scalar_one_or_none()
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
            "operatingHours": settings.operating_hours,
            "restaurantName": settings.restaurant_name,
            "currencySymbol": settings.currency_symbol,
        },
        "state": updated_state,
    }
