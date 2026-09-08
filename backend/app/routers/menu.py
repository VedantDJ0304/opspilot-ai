"""
OpsPilot AI — Menu Router
Handles menu listing, creation, and availability adjustments.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.menu import MenuItem, RecipeIngredient
from app.schemas.menu import MenuUpdateRequest
from app.schemas.inventory import RecipeIngredientSchema
from app.routers.state import get_operational_state

router = APIRouter(prefix="/api/menu", tags=["Menu"])


@router.get("")
async def get_menu(session: AsyncSession = Depends(get_db)):
    """Retrieve all menu items with recipe mappings."""
    menu_res = await session.execute(select(MenuItem))
    menu_items = menu_res.scalars().all()

    recipe_res = await session.execute(select(RecipeIngredient))
    recipes = recipe_res.scalars().all()
    recipes_by_menu = {}
    for r in recipes:
        recipes_by_menu.setdefault(r.menu_item_id, []).append(
            {"ingredientId": r.ingredient_id, "amount": r.amount, "unit": r.unit}
        )

    return [
        {
            "id": m.id,
            "name": m.name,
            "category": m.category,
            "price": m.price,
            "availabilityStatus": m.availability_status,
            "available": m.availability_status == "AVAILABLE",
            "limitedReason": m.limited_reason,
            "prepTimeMinutes": m.prep_time_minutes,
            "recipe": recipes_by_menu.get(m.id, []),
        }
        for m in menu_items
    ]


@router.post("")
async def create_menu_item(
    payload: dict,
    session: AsyncSession = Depends(get_db),
):
    """Create a new menu item."""
    name = payload.get("name")
    if not name:
        raise HTTPException(status_code=400, detail="Menu item name is required")

    item_id = payload.get("id") or f"menu-{name.lower().replace(' ', '-')}"
    category = payload.get("category", "Main Course")
    price = float(payload.get("price", 150.0))
    prep_time = int(payload.get("prepTimeMinutes", payload.get("prep_time_minutes", 15)))

    item = MenuItem(
        id=item_id,
        name=name,
        category=category,
        price=price,
        availability_status="AVAILABLE",
        limited_reason=None,
        prep_time_minutes=prep_time,
    )
    session.add(item)
    await session.commit()

    return {
        "success": True,
        "menuItem": {
            "id": item.id,
            "name": item.name,
            "price": item.price,
            "availabilityStatus": item.availability_status,
        },
    }


@router.patch("/{item_id}")
async def update_menu_item(
    item_id: str,
    payload: MenuUpdateRequest,
    session: AsyncSession = Depends(get_db),
):
    """Update menu item availability, price, or limited reason."""
    result = await session.execute(select(MenuItem).where(MenuItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    if payload.availabilityStatus is not None:
        item.availability_status = payload.availabilityStatus
    if payload.price is not None:
        item.price = payload.price
    if payload.limitedReason is not None:
        item.limited_reason = payload.limitedReason if payload.limitedReason != "" else None

    updated_state = await get_operational_state(session)
    return {
        "success": True,
        "menuItem": {
            "id": item.id,
            "name": item.name,
            "price": item.price,
            "availabilityStatus": item.availability_status,
            "limitedReason": item.limited_reason,
        },
        "state": updated_state,
    }
