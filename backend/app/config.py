"""
Application configuration module.
Centralized settings management using environment variables.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')


class Settings:
    """Application settings loaded from environment variables."""
    
    # Database
    DB_PATH: Path = ROOT_DIR / 'laundry.db'
    
    # CORS
    ALLOWED_ORIGINS: list[str] = os.getenv(
        "ALLOWED_ORIGINS", 
        "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")
    
    # App settings
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    APP_TITLE: str = "Laundry Digital Twin API"


settings = Settings()
