"""Menu item and recipe ingredient models."""

import json
from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class MenuItem(Base):
    __tablename__ = "menu_item"

    id: Mapped[str] = mapped_column(primary_key=True)  # e.g. 'menu-pbm'
    name: Mapped[str]
    category: Mapped[str]   # Main Course|Starters|Breads|Rice & Biryani|Thalis
    price: Mapped[float]
    availability_status: Mapped[str] = mapped_column(default="AVAILABLE")  # AVAILABLE|LIMITED|DISABLED
    limited_reason: Mapped[str] = mapped_column(nullable=True)
    prep_time_minutes: Mapped[int]


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredient"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    menu_item_id: Mapped[str] = mapped_column(ForeignKey("menu_item.id"))
    ingredient_id: Mapped[str] = mapped_column(ForeignKey("ingredient.id"))
    amount: Mapped[float]   # per serving in display unit
    unit: Mapped[str]
