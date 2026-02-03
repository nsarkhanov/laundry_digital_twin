"""
Main FastAPI application module.
Entry point for the Laundry Digital Twin API.
"""
import logging

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from .config import settings
from .database import init_db
from .routes import create_api_router


def create_app() -> FastAPI:
    """
    Application factory - creates and configures the FastAPI app.
    """
    # Initialize database
    init_db()
    
    # Create FastAPI app
    app = FastAPI(title=settings.APP_TITLE)
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_credentials=True,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include API routes
    api_router = create_api_router()
    
    # Add health check at root
    @api_router.get("/")
    def root():
        return {"message": "Laundry Digital Twin API"}
    
    app.include_router(api_router)
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    return app


# Create the application instance
app = create_app()
