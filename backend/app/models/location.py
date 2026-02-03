"""
Location Pydantic models.
"""
from pydantic import BaseModel


class LocationCreate(BaseModel):
    """Schema for creating a new location."""
    name: str


class Location(BaseModel):
    """Schema for location response."""
    id: str
    name: str
    created_at: str
