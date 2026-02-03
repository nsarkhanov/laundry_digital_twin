"""
Laundry Digital Twin API - Main Entry Point

This file provides backwards compatibility with the original server.py.
All code has been refactored into the app/ package for clean architecture.

Usage:
    uvicorn server:app --reload

The application is now organized as:
    app/
    ├── config.py          # Settings and environment variables
    ├── database.py        # Database connection and initialization
    ├── models/            # Pydantic schemas (request/response models)
    ├── repositories/      # Data access layer
    ├── services/          # Business logic layer
    └── routes/            # API endpoints
"""

# Import the app from the new package structure
from app.main import app

# Re-export for backwards compatibility
__all__ = ["app"]
