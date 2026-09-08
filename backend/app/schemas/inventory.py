"""
OpsPilot AI — Pydantic Schemas for Inventory
Mirrors the TypeScript interfaces from src/types.ts exactly so the React
frontend receives the same JSON shape it already expects.
"""

from typing import Optional
from pydantic import BaseModel


class IngredientSchema(BaseModel):
    id: str
    name: str
    unit: str
    displayUnit: str
    minThreshold: float
    normalRatePerHour: float
    costPerUnit: float

    model_config = {"from_attributes": True}


class RecipeIngredientSchema(BaseModel):
    ingredientId: str
    amount: float
    unit: str

    model_config = {"from_attributes": True}


class InventoryItemSchema(BaseModel):
    ingredientId: str
    name: str
    unit: str
    displayUnit: str
    physicalBaselineStock: float
    physicalBaselineTime: str
    estimatedStock: float
    consumptionRatePerHour: float
    normalRatePerHour: float
    pendingDemandUnits: int
    estimatedRunoutMinutes: int
    riskLevel: str
    lastCountAt: str

    model_config = {"from_attributes": True}


class InventoryTransactionSchema(BaseModel):
    id: str
    timestamp: str
    ingredientId: str
    ingredientName: str
    type: str
    delta: float
    unit: str
    balanceAfter: float
    referenceId: Optional[str] = None
    note: str

    model_config = {"from_attributes": True}


class InventoryAdjustRequest(BaseModel):
    ingredientId: str
    delta: Optional[float] = None
    newPhysicalStock: Optional[float] = None
    type: Optional[str] = "MANUAL_ADJUSTMENT"
    note: Optional[str] = "Stock update by Manager Rajesh K."
