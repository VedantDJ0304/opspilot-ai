"""Ingredient master data model."""

from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class Ingredient(Base):
    __tablename__ = "ingredient"

    id: Mapped[str] = mapped_column(primary_key=True)  # e.g. 'ing-paneer'
    name: Mapped[str]
    unit: Mapped[str]          # kg | g | L | ml | units
    display_unit: Mapped[str]
    min_threshold: Mapped[float]       # minimum safe stock level
    normal_rate_per_hour: Mapped[float]  # baseline consumption per hour
    cost_per_unit: Mapped[float]       # INR per unit
