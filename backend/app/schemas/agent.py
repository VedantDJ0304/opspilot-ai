"""Pydantic schemas for agent events, decisions, settings, and demo."""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class AgentEventSchema(BaseModel):
    id: str
    timestamp: str
    stage: str
    title: str
    description: str
    inputData: Optional[Dict[str, Any]] = None
    decision: Optional[str] = None
    action: Optional[str] = None
    actionTarget: Optional[str] = None
    result: Optional[str] = None
    status: str

    model_config = {"from_attributes": True}


class AgentDecisionContextSchema(BaseModel):
    ingredientName: str
    stock: float
    unit: str
    consumptionRate: float
    normalRate: float
    pendingOrders: int
    runoutMinutes: int


class AgentDecisionSchema(BaseModel):
    id: str
    timestamp: str
    goal: str
    trigger: str
    context: AgentDecisionContextSchema
    availableAlternatives: List[str]
    decision: str
    reason: str
    action: str
    actionParams: Dict[str, Any]
    result: str
    status: str

    model_config = {"from_attributes": True}


class AgentSettingsPermissionsSchema(BaseModel):
    notifyManager: bool
    limitMenuItems: bool
    disableMenuItems: bool
    restoreMenuItems: bool
    replenishmentAlerts: bool


class AgentSettingsSchema(BaseModel):
    agentEnabled: bool
    monitoringFrequencyMinutes: int
    riskSensitivity: str
    permissions: AgentSettingsPermissionsSchema
    operatingHours: str
    restaurantName: str
    currencySymbol: str

    model_config = {"from_attributes": True}


class DemoStepStateSchema(BaseModel):
    currentStep: int
    totalSteps: int
    stepTitle: str
    stepDescription: str
    isSimulating: bool

    model_config = {"from_attributes": True}


class AgentRunRequest(BaseModel):
    trigger: Optional[str] = "Manager requested operational analysis"


class DemoStepRequest(BaseModel):
    step: Optional[int] = None
