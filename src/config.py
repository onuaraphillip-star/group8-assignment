"""Configuration settings for STRIPS-NG."""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings."""
    app_name: str = "STRIPS-NG"
    debug: bool = True
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174"]
    default_timeout: int = 30
    max_search_nodes: int = 10000
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
