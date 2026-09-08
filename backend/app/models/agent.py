"""Agent event, decision, run, and memory models."""

import json
from sqlalchemy import Text, String, Float, Integer
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


class AgentRun(Base):
    __tablename__ = "agent_run"

    id: Mapped[str] = mapped_column(primary_key=True)
    timestamp: Mapped[str]
    trigger: Mapped[str] = mapped_column(Text)
    goal: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(default="COMPLETED")
    confidence: Mapped[float] = mapped_column(Float, default=0.92)
    active_risks_count: Mapped[int] = mapped_column(Integer, default=0)
    action_taken: Mapped[str] = mapped_column(default="CONTINUE_MONITORING")
    duration_ms: Mapped[int] = mapped_column(Integer, default=0)
    summary: Mapped[str] = mapped_column(Text, default="")


class AgentMemory(Base):
    __tablename__ = "agent_memory"

    id: Mapped[str] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(String(150), index=True)
    memory_type: Mapped[str] = mapped_column(String(50), default="operational_context")
    content_json: Mapped[str] = mapped_column(Text, default="{}")
    timestamp: Mapped[str]

    def get_content(self) -> dict:
        if self.content_json:
            return json.loads(self.content_json)
        return {}

    def set_content(self, data: dict) -> None:
        self.content_json = json.dumps(data)
