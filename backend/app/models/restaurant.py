"""Restaurant model."""

from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class Restaurant(Base):
    __tablename__ = "restaurant"

    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    name: Mapped[str] = mapped_column(default="Spice Garden")
    tagline: Mapped[str] = mapped_column(default="Autonomous AI Operations for Restaurants")
    location: Mapped[str] = mapped_column(default="Sector 14, Nashik, Maharashtra")
    manager: Mapped[str] = mapped_column(default="Rajesh Kulkarni")
    status: Mapped[str] = mapped_column(default="Operational")  # Operational | Paused
