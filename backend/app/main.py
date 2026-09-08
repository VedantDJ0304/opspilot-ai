"""
OpsPilot AI — FastAPI Application
Autonomous AI Operations for Restaurants
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import init_db
from app.core.logging import get_logger
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

logger = get_logger("opspilot")
app_settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for database initialization and cleanup."""
    logger.info("Starting OpsPilot AI Backend...")
    try:
        await init_db()
        logger.info("Database initialized and demo state verified.")
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")
        raise e
    yield
    logger.info("Shutting down OpsPilot AI Backend...")


app = FastAPI(
    title="OpsPilot AI API",
    description="Autonomous AI Operations for Restaurants",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ── CORS Setup ───────────────────────────────────────────────────────────────
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if app_settings.frontend_url and app_settings.frontend_url not in origins:
    origins.append(app_settings.frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permissive for local dev & demo reliability
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Router Registration ───────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(state.router)
app.include_router(orders.router)
app.include_router(inventory.router)
app.include_router(menu.router)
app.include_router(recipes.router)
app.include_router(agent.router)
app.include_router(settings.router)
app.include_router(notifications.router)


@app.get("/")
async def root():
    return {
        "service": "OpsPilot AI",
        "tagline": "Autonomous AI Operations for Restaurants",
        "status": "running",
        "docs": "/docs",
        "openapi": "/openapi.json",
        "health": "/api/health",
        "state": "/api/state",
    }