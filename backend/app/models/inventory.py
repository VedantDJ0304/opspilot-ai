"""Inventory item and transaction models."""

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class InventoryItem(Base):
    __tablename__ = "inventory_item"

    ingredient_id: Mapped[str] = mapped_column(
        ForeignKey("ingredient.id"), primary_key=True
    )
    name: Mapped[str]
    unit: Mapped[str]
    display_unit: Mapped[str]
    physical_baseline_stock: Mapped[float]
    physical_baseline_time: Mapped[str]
    estimated_stock: Mapped[float]
    consumption_rate_per_hour: Mapped[float]
    normal_rate_per_hour: Mapped[float]
    pending_demand_units: Mapped[int] = mapped_column(default=0)
    estimated_runout_minutes: Mapped[int]
    risk_level: Mapped[str] = mapped_column(default="NORMAL")  # NORMAL|LOW|WARNING|CRITICAL
    last_count_at: Mapped[str]


class InventoryTransaction(Base):
    __tablename__ = "inventory_transaction"

    id: Mapped[str] = mapped_column(primary_key=True)
    timestamp: Mapped[str]
    ingredient_id: Mapped[str] = mapped_column(ForeignKey("ingredient.id"))
    ingredient_name: Mapped[str]
    type: Mapped[str]   # INITIAL|ORDER_CONSUMPTION|PURCHASE|WASTAGE|MANUAL_ADJUSTMENT|CORRECTION
    delta: Mapped[float]
    unit: Mapped[str]
    balance_after: Mapped[float]
    reference_id: Mapped[str] = mapped_column(nullable=True)
    note: Mapped[str]
