"""
OpsPilot AI — Recipe Service
Calculates exact ingredient consumption for an order.
Direct Python port of server/calculations.ts:calculateOrderIngredientsConsumption.
"""

from dataclasses import dataclass
from typing import List, Sequence, Dict

from app.models.menu import MenuItem, RecipeIngredient
from app.models.ingredient import Ingredient


@dataclass
class IngredientConsumptionImpact:
    ingredient_id: str
    ingredient_name: str
    consumed_amount: float   # in base unit (kg or L)
    unit: str
    formatted_text: str


def calculate_order_consumption(
    order_items: List[dict],   # [{"menu_item_id": str, "quantity": int}]
    menu_items: Sequence[MenuItem],
    recipes: Sequence[RecipeIngredient],
    ingredients: Sequence[Ingredient],
) -> tuple[List[IngredientConsumptionImpact], str]:
    """
    Calculate ingredient consumption for an order.

    Returns:
        (impacts, summary_text)
    """
    menu_map: Dict[str, MenuItem] = {m.id: m for m in menu_items}
    ingredient_map: Dict[str, Ingredient] = {i.id: i for i in ingredients}

    # Build recipe lookup: menu_item_id → list of RecipeIngredient
    recipe_map: Dict[str, List[RecipeIngredient]] = {}
    for r in recipes:
        recipe_map.setdefault(r.menu_item_id, []).append(r)

    # Accumulate consumption per ingredient
    consumption: Dict[str, float] = {}
    for item in order_items:
        menu_item_id = item["menu_item_id"]
        quantity = item["quantity"]
        recipe_items = recipe_map.get(menu_item_id, [])
        for ri in recipe_items:
            consumption[ri.ingredient_id] = (
                consumption.get(ri.ingredient_id, 0.0) + ri.amount * quantity
            )

    impacts: List[IngredientConsumptionImpact] = []
    text_parts: List[str] = []

    for ingredient_id, amount in consumption.items():
        ingredient = ingredient_map.get(ingredient_id)
        name = ingredient.name.split(" ")[0] if ingredient else ingredient_id
        unit = ingredient.unit if ingredient else "kg"

        # Format with smart unit display
        if unit == "kg" and amount < 1.0:
            formatted = f"{name} -{round(amount * 1000)}g"
        elif unit == "L" and amount < 1.0:
            formatted = f"{name} -{round(amount * 1000)}ml"
        else:
            formatted = f"{name} -{amount:.2f}{unit}"

        text_parts.append(formatted)
        impacts.append(IngredientConsumptionImpact(
            ingredient_id=ingredient_id,
            ingredient_name=ingredient.name if ingredient else ingredient_id,
            consumed_amount=round(amount * 1000) / 1000,
            unit=unit,
            formatted_text=formatted,
        ))

    summary = ", ".join(text_parts) if text_parts else "No tracked ingredient impact"
    return impacts, summary
