"""
OpsPilot AI — Application Configuration
Loads all settings from environment variables with sensible defaults.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Gemini AI
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    # Database
    database_url: str = "sqlite+aiosqlite:///./opspilot.db"

    # Server
    frontend_url: str = "http://localhost:5173"

    # Agent
    agent_enabled: bool = True
    agent_monitor_interval_seconds: int = 30

    @property
    def normalized_database_url(self) -> str:
        """Ensure SQLite uses aiosqlite for async SQLAlchemy."""
        url = self.database_url.strip()
        if url.startswith("sqlite:///") and not url.startswith("sqlite+aiosqlite:///"):
            return url.replace("sqlite:///", "sqlite+aiosqlite:///", 1)
        if url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    @property
    def has_gemini_key(self) -> bool:
        """Returns True if a real Gemini API key is configured."""
        key = self.gemini_api_key.strip()
        return bool(key) and key not in ("", "your_gemini_api_key_here", "MY_GEMINI_API_KEY")


@lru_cache
def get_settings() -> Settings:
    return Settings()
