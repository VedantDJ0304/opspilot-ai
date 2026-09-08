"""
OpsPilot AI — Recipes Router
Provides recipe mappings and ingredient compositions for menu items.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.menu import MenuItem, RecipeIngredient
from app.models.ingredient import Ingredient

router = APIRouter(prefix="/api/recipes", tags=["Recipes"])


@router.get("")
async def get_all_recipes(session: AsyncSession = Depends(get_db)):
    """Retrieve recipe mappings across all menu items."""
    recipes_res = await session.execute(select(RecipeIngredient))
    recipes = recipes_res.scalars().all()

    menu_res = await session.execute(select(MenuItem))
    menu_map = {m.id: m.name for m in menu_res.scalars().all()}

    ing_res = await session.execute(select(Ingredient))
    ing_map = {i.id: i.name for i in ing_res.scalars().all()}

    grouped = {}
    for r in recipes:
        grouped.setdefault(r.menu_item_id, {
            "menuItemId": r.menu_item_id,
            "menuItemName": menu_map.get(r.menu_item_id, r.menu_item_id),
            "ingredients": [],
        })["ingredients"].append({
            "ingredientId": r.ingredient_id,
            "ingredientName": ing_map.get(r.ingredient_id, r.ingredient_id),
            "amount": r.amount,
            "unit": r.unit,
        })

    return list(grouped.values())


@router.get("/{menu_item_id}")
async def get_recipe_by_menu_item(menu_item_id: str, session: AsyncSession = Depends(get_db)):
    """Retrieve recipe ingredients for a single menu item."""
    menu_res = await session.execute(select(MenuItem).where(MenuItem.id == menu_item_id))
    menu_item = menu_res.scalar_one_or_none()
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    recipes_res = await session.execute(
        select(RecipeIngredient).where(RecipeIngredient.menu_item_id == menu_item_id)
    )
    recipes = recipes_res.scalars().all()

    ing_res = await session.execute(select(Ingredient))
    ing_map = {i.id: i.name for i in ing_res.scalars().all()}

    return {
        "menuItemId": menu_item.id,
        "menuItemName": menu_item.name,
        "ingredients": [
            {
                "ingredientId": r.ingredient_id,
                "ingredientName": ing_map.get(r.ingredient_id, r.ingredient_id),
                "amount": r.amount,
                "unit": r.unit,
            }
            for r in recipes
        ],
    }
