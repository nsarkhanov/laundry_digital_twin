"""
Routes package - API endpoints.
"""
from fastapi import APIRouter

from .locations import router as locations_router
from .washing_machines import router as washing_machines_router
from .drying_machines import router as drying_machines_router
from .ironing_machines import router as ironing_machines_router
from .chemicals import router as chemicals_router
from .configurations import router as configurations_router
from .cost import router as cost_router


def create_api_router() -> APIRouter:
    """Create and configure the main API router with all sub-routers."""
    api_router = APIRouter(prefix="/api")
    
    # Health check endpoint
    @api_router.get("/health")
    def health_check():
        """Health check endpoint for Docker healthcheck."""
        return {"status": "healthy", "service": "laundry-backend"}
    
    # Include all entity routers
    api_router.include_router(locations_router)
    api_router.include_router(washing_machines_router)
    api_router.include_router(drying_machines_router)
    api_router.include_router(ironing_machines_router)
    api_router.include_router(chemicals_router)
    api_router.include_router(configurations_router)
    api_router.include_router(cost_router)
    
    return api_router
