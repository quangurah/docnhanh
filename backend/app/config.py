from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://user:password@localhost/docnhanh"
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # JWT
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # AI
    openai_api_key: Optional[str] = None
    ai_model: str = "gpt-4"
    
    # File Storage
    upload_dir: str = "uploads"
    max_file_size_mb: int = 10
    
    # CORS
    allowed_origins: list = ["*"]
    
    # Rate Limiting
    rate_limit_per_minute: int = 100
    
    class Config:
        env_file = ".env"


settings = Settings()
