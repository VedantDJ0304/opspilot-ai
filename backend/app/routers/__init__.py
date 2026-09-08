"""
OpsPilot AI — Routers Package
"""

from app.routers import (
    health,
    state,
    orders,
    inventory,
    menu,
    recipes,
    agent,
    settings,
    notifications,
)

__all__ = [
    "health",
    "state",
    "orders",
    "inventory",
    "menu",
    "recipes",
    "agent",
    "settings",
    "notifications",
]
