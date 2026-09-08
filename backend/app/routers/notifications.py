"""
OpsPilot AI — Notifications Router
Handles marking in-app operational notifications as read.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.core.database import get_db
from app.models.notification import AppNotification

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.post("/mark-read")
async def mark_all_read(session: AsyncSession = Depends(get_db)):
    """Mark all active notifications as read."""
    await session.execute(
        update(AppNotification).values(read=True)
    )
    return {"success": True}
