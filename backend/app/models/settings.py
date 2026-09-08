"""Agent settings model — single-row configuration table."""

import json
from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class AgentSettings(Base):
    __tablename__ = "agent_settings"

    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    agent_enabled: Mapped[bool] = mapped_column(default=True)
    monitoring_frequency_minutes: Mapped[int] = mapped_column(default=1)
    risk_sensitivity: Mapped[str] = mapped_column(default="balanced")  # conservative|balanced|aggressive
    permissions_json: Mapped[str] = mapped_column(
        Text,
        default='{"notifyManager":true,"limitMenuItems":true,"disableMenuItems":false,"restoreMenuItems":true,"replenishmentAlerts":true}',
    )
    operating_hours: Mapped[str] = mapped_column(default="11:00 AM - 11:30 PM")
    restaurant_name: Mapped[str] = mapped_column(default="Spice Garden")
    currency_symbol: Mapped[str] = mapped_column(default="₹")

    def get_permissions(self) -> dict:
        return json.loads(self.permissions_json)

    def set_permissions(self, perms: dict) -> None:
        self.permissions_json = json.dumps(perms)
