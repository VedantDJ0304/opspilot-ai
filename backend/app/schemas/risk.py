"""Pydantic schemas for operational risks and notifications."""

from typing import Optional
from pydantic import BaseModel


class OperationalRiskSchema(BaseModel):
    id: str
    ingredientId: str
    ingredientName: str
    riskLevel: str
    detectedAt: str
    currentStock: float
    unit: str
    runoutMinutes: int
    consumptionRate: float
    normalRate: float
    pendingOrdersCount: int
    message: str
    status: str

    model_config = {"from_attributes": True}


class AppNotificationSchema(BaseModel):
    id: str
    title: str
    message: str
    type: str
    timestamp: str
    read: bool
    actionLink: Optional[str] = None

    model_config = {"from_attributes": True}


class OperationalIncidentSchema(BaseModel):
    id: str
    date: str
    ingredientName: str
    cause: str
    actionTaken: str
    outcome: str
    status: str

    model_config = {"from_attributes": True}
