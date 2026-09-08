"""Operational risk model."""

from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class OperationalRisk(Base):
    __tablename__ = "operational_risk"

    id: Mapped[str] = mapped_column(primary_key=True)
    ingredient_id: Mapped[str]
    ingredient_name: Mapped[str]
    risk_level: Mapped[str]    # NORMAL|LOW|WARNING|CRITICAL
    detected_at: Mapped[str]
    current_stock: Mapped[float]
    unit: Mapped[str]
    runout_minutes: Mapped[int]
    consumption_rate: Mapped[float]
    normal_rate: Mapped[float]
    pending_orders_count: Mapped[int]
    message: Mapped[str]
    status: Mapped[str] = mapped_column(default="ACTIVE")   # ACTIVE|RESOLVED
