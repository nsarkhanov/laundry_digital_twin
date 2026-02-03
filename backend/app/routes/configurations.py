"""
Configuration routes - API endpoints for configuration management.
"""
from fastapi import APIRouter, HTTPException

from ..models import Configuration, ConfigurationCreate
from ..repositories import ConfigurationRepository

router = APIRouter(prefix="/configurations", tags=["configurations"])


@router.post("", response_model=Configuration)
def save_configuration(data: ConfigurationCreate):
    """
    Save a configuration.
    Updates existing if name matches, creates new otherwise.
    """
    return ConfigurationRepository.save(data)


@router.get("", response_model=list[Configuration])
def get_configurations():
    """Get all configurations."""
    return ConfigurationRepository.get_all_formatted()


@router.get("/latest", response_model=Configuration)
def get_latest_configuration():
    """Get the most recently updated configuration."""
    config = ConfigurationRepository.get_latest()
    if not config:
        raise HTTPException(status_code=404, detail="No configuration found")
    return config


@router.delete("/{config_id}")
def delete_configuration(config_id: str):
    """Delete a configuration."""
    if not ConfigurationRepository.delete(config_id):
        raise HTTPException(status_code=404, detail="Configuration not found")
    return {"message": "Configuration deleted"}
