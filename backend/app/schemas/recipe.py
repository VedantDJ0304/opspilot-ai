"""Pydantic schemas for recipe and ingredient mappings."""

from pydantic import BaseModel
from typing import List


class RecipeIngredientItem(BaseModel):
    ingredient_id: str
    amount: float
    unit: str

    model_config = {"from_attributes": True}


class RecipeResponse(BaseModel):
    menu_item_id: str
    menu_item_name: str
    ingredients: List[RecipeIngredientItem]

    model_config = {"from_attributes": True}
