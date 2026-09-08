"""Pydantic schemas for restaurant."""

from pydantic import BaseModel
from typing import Optional


class RestaurantInfoSchema(BaseModel):
    name: str
    tagline: str
    location: str
    manager: str
    status: str

    model_config = {"from_attributes": True}


class RestaurantResponse(BaseModel):
    id: int
    name: str
    city: str
    agent_enabled: bool

    model_config = {"from_attributes": True}
