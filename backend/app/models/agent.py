"""Agent event and decision models."""

import json
from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class AgentEvent(Base):
    __tablename__ = "agent_event"

    id: Mapped[str] = mapped_column(primary_key=True)
    timestamp: Mapped[str]
    stage: Mapped[str]      # OBSERVE|ANALYZE|DECIDE|ACT|MONITOR|ADAPT
    title: Mapped[str]
    description: Mapped[str] = mapped_column(Text)
    input_data_json: Mapped[str] = mapped_column(Text, nullable=True)   # JSON blob
    decision: Mapped[str] = mapped_column(nullable=True)
    action: Mapped[str] = mapped_column(nullable=True)
    action_target: Mapped[str] = mapped_column(nullable=True)
    result: Mapped[str] = mapped_column(nullable=True)
    status: Mapped[str] = mapped_column(default="COMPLETED")  # COMPLETED|IN_PROGRESS|MONITORING

    def get_input_data(self) -> dict:
        if self.input_data_json:
            return json.loads(self.input_data_json)
        return {}

    def set_input_data(self, data: dict) -> None:
        self.input_data_json = json.dumps(data)


class AgentDecision(Base):
    __tablename__ = "agent_decision"

    id: Mapped[str] = mapped_column(primary_key=True)
    timestamp: Mapped[str]
    goal: Mapped[str] = mapped_column(Text)
    trigger: Mapped[str] = mapped_column(Text)
    context_json: Mapped[str] = mapped_column(Text)    # JSON blob
    alternatives_json: Mapped[str] = mapped_column(Text)  # JSON array
    decision: Mapped[str] = mapped_column(Text)
    reason: Mapped[str] = mapped_column(Text)
    action: Mapped[str]
    action_params_json: Mapped[str] = mapped_column(Text, default="{}")
    result: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(default="Monitoring")  # Monitoring|Resolved|Executed
