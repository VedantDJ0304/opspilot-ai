"""Demo state and operational incident models."""

from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class DemoState(Base):
    __tablename__ = "demo_state"

    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    current_step: Mapped[int] = mapped_column(default=6)
    total_steps: Mapped[int] = mapped_column(default=10)
    step_title: Mapped[str] = mapped_column(default="Step 6: Autonomous Action Executed")
    step_description: Mapped[str] = mapped_column(
        default="Paneer-heavy items marked Limited Availability. Agent is currently monitoring recovery."
    )
    is_simulating: Mapped[bool] = mapped_column(default=False)


class OperationalIncident(Base):
    __tablename__ = "operational_incident"

    id: Mapped[str] = mapped_column(primary_key=True)
    date: Mapped[str]
    ingredient_name: Mapped[str]
    cause: Mapped[str] = mapped_column(Text)
    action_taken: Mapped[str] = mapped_column(Text)
    outcome: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(default="RESOLVED")  # RESOLVED|ACTIVE
