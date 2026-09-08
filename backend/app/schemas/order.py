"""Pydantic schemas for orders."""

from typing import Optional, List
from pydantic import BaseModel


class OrderItemSchema(BaseModel):
    menuItemId: str
    menuItemName: str
    quantity: int
    unitPrice: float
    total: float

    model_config = {"from_attributes": True}


class OrderSchema(BaseModel):
    id: str
    orderNumber: int
    items: List[OrderItemSchema]
    subtotal: float
    tax: float
    total: float
    status: str
    createdAt: str
    ingredientImpactSummary: str
    tableOrChannel: Optional[str] = None

    model_config = {"from_attributes": True}


class CreateOrderRequest(BaseModel):
    items: List[OrderItemSchema]
    tableOrChannel: Optional[str] = "Dine-In Table 1"


class UpdateOrderStatusRequest(BaseModel):
    status: str
