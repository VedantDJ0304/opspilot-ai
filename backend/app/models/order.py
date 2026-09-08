"""Order and order item models."""

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class Order(Base):
    __tablename__ = "order"

    id: Mapped[str] = mapped_column(primary_key=True)
    order_number: Mapped[int]
    subtotal: Mapped[float]
    tax: Mapped[float]
    total: Mapped[float]
    status: Mapped[str] = mapped_column(default="Pending")  # Pending|Preparing|Ready|Completed|Cancelled
    created_at: Mapped[str]
    ingredient_impact_summary: Mapped[str] = mapped_column(default="")
    table_or_channel: Mapped[str] = mapped_column(default="Dine-In Table 1")


class OrderItem(Base):
    __tablename__ = "order_item"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    order_id: Mapped[str] = mapped_column(ForeignKey("order.id"))
    menu_item_id: Mapped[str]
    menu_item_name: Mapped[str]
    quantity: Mapped[int]
    unit_price: Mapped[float]
    total: Mapped[float]
