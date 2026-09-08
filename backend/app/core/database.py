"""
OpsPilot AI — Async Database Engine & Session Factory

Supports both SQLite (development) and PostgreSQL (production) via DATABASE_URL.
Uses SQLAlchemy 2.x async engine with aiosqlite / asyncpg drivers.
"""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import StaticPool

from app.core.config import get_settings

settings = get_settings()

# ── Engine factory ────────────────────────────────────────────────────────────

_connect_args: dict = {}
_pool_kwargs: dict = {}

if "sqlite" in settings.database_url:
    # SQLite requires check_same_thread=False and StaticPool for async usage
    _connect_args = {"check_same_thread": False}
    _pool_kwargs = {"poolclass": StaticPool}

engine = create_async_engine(
    settings.database_url,
    echo=False,
    connect_args=_connect_args,
    **_pool_kwargs,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


# ── Dependency ────────────────────────────────────────────────────────────────

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ── Table creation & seeding ─────────────────────────────────────────────────

async def init_db() -> None:
    """Create all tables and seed initial Spice Garden demo data if empty."""
    from app.models import base  # noqa: F401 – registers all models with Base
    from app.models.base import Base
    from app.seed.demo_data import seed_initial_data

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed only when database is empty
    async with AsyncSessionLocal() as session:
        await seed_initial_data(session)
