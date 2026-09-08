"""App notification model."""

from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class AppNotification(Base):
    __tablename__ = "app_notification"

    id: Mapped[str] = mapped_column(primary_key=True)
    title: Mapped[str]
    message: Mapped[str]
    type: Mapped[str]      # CRITICAL|WARNING|INFO|SUCCESS
    timestamp: Mapped[str]
    read: Mapped[bool] = mapped_column(default=False)
    action_link: Mapped[str] = mapped_column(nullable=True)
