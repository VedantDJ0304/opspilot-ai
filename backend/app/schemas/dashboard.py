"""
OpsPilot AI — Full Operational State Schema
Mirrors the TypeScript OperationalState interface exactly.
This is the shape returned by GET /api/state.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel

from app.schemas.inventory import IngredientSchema, InventoryItemSchema, InventoryTransactionSchema
from app.schemas.menu import MenuItemSchema
from app.schemas.order import OrderSchema
from app.schemas.agent import AgentEventSchema, AgentDecisionSchema, AgentSettingsSchema, DemoStepStateSchema
from app.schemas.risk import OperationalRiskSchema, AppNotificationSchema, OperationalIncidentSchema


class RestaurantInfoSchema(BaseModel):
    name: str
    tagline: str
    location: str
    manager: str
    status: str


class DashboardMetricsSchema(BaseModel):
    todayOrdersCount: int
    pendingOrdersCount: int
    activeRisksCount: int
    agentActionsTodayCount: int
    criticalShortageIngredient: Optional[str] = None
    criticalShortageTimeMinutes: Optional[int] = None


class OperationalStateSchema(BaseModel):
    """The complete operational state returned to the React frontend."""
    restaurant: RestaurantInfoSchema
    ingredients: List[IngredientSchema]
    inventory: List[InventoryItemSchema]
    inventoryTransactions: List[InventoryTransactionSchema]
    menuItems: List[MenuItemSchema]
    orders: List[OrderSchema]
    risks: List[OperationalRiskSchema]
    agentEvents: List[AgentEventSchema]
    latestDecision: Optional[AgentDecisionSchema] = None
    decisionHistory: List[AgentDecisionSchema] = []
    notifications: List[AppNotificationSchema]
    settings: AgentSettingsSchema
    demoState: DemoStepStateSchema
    incidents: List[OperationalIncidentSchema]
    metrics: DashboardMetricsSchema
