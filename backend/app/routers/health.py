"""
OpsPilot AI — Health Router
"""

from datetime import datetime, timezone
from fastapi import APIRouter
from app.core.config import get_settings

router = APIRouter(tags=["Health"])


@router.get("/api/health")
async def health():
    """Health check endpoint."""
    settings = get_settings()
    return {
        "status": "ok",
        "product": "OpsPilot AI",
        "version": "1.0.0",
        "agent_enabled": settings.agent_enabled,
        "has_gemini_key": settings.has_gemini_key,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
