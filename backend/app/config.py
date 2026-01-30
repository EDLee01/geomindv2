"""
GeoMind Backend Configuration
All configuration is read from environment variables.
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Claude API Configuration (Zeabur AI Gateway)
    CLAUDE_API_KEY: str = ""
    CLAUDE_BASE_URL: str = "https://ai.zeabur.com/v1"
    CLAUDE_MODEL: str = "claude-3-5-sonnet"

    # Qdrant Configuration
    QDRANT_URL: str = "https://fd40a02c-5ba1-4d9c-b81a-78e5efef10a5.us-west-1-0.aws.cloud.qdrant.io:6333"
    QDRANT_API_KEY: str = ""
    QDRANT_COLLECTION: str = "geomind_papers"

    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://geomind.zeabur.app",
        "https://*.zeabur.app"
    ]

    # File Upload Configuration
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: List[str] = [".xlsx", ".xls", ".csv"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
