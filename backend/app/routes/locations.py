"""
Location routes - API endpoints for location management.
"""
from fastapi import APIRouter, HTTPException

from ..models import Location, LocationCreate
from ..repositories import LocationRepository

router = APIRouter(prefix="/locations", tags=["locations"])


@router.post("", response_model=Location)
def create_location(data: LocationCreate):
    """Create a new location."""
    location = LocationRepository.create(data)
    if location is None:
        raise HTTPException(status_code=400, detail="Location with this name already exists")
    return location


@router.get("", response_model=list[Location])
def get_locations():
    """Get all locations."""
    return LocationRepository.get_all()


@router.put("/{location_id}", response_model=Location)
def update_location(location_id: str, data: LocationCreate):
    """Update an existing location."""
    if not LocationRepository.exists(location_id):
        raise HTTPException(status_code=404, detail="Location not found")
    return LocationRepository.update(location_id, data)


@router.delete("/{location_id}")
def delete_location(location_id: str):
    """Delete a location."""
    if not LocationRepository.delete(location_id):
        raise HTTPException(status_code=404, detail="Location not found")
    return {"message": "Location deleted"}
