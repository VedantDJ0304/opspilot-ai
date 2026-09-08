"""Pydantic schemas for menu and recipe data."""

from typing import Optional, List
from pydantic import BaseModel
from app.schemas.inventory import RecipeIngredientSchema


class MenuItemSchema(BaseModel):
    id: str
    name: str
    category: str
    price: float
    availabilityStatus: str
    limitedReason: Optional[str] = None
    recipe: List[RecipeIngredientSchema] = []
    prepTimeMinutes: int

    model_config = {"from_attributes": True}


class MenuUpdateRequest(BaseModel):
    availabilityStatus: Optional[str] = None
    price: Optional[float] = None
    limitedReason: Optional[str] = None
