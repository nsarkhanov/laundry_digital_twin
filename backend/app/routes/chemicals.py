"""
Chemical routes - API endpoints for chemical management.
"""
from fastapi import APIRouter, HTTPException

from ..models import Chemical, ChemicalCreate
from ..repositories import ChemicalRepository

router = APIRouter(prefix="/chemicals", tags=["chemicals"])


@router.post("", response_model=Chemical)
def create_chemical(data: ChemicalCreate):
    """Create a new chemical."""
    return ChemicalRepository.create(data)


@router.get("", response_model=list[Chemical])
def get_chemicals():
    """Get all chemicals."""
    return ChemicalRepository.get_all()


@router.put("/{chemical_id}", response_model=Chemical)
def update_chemical(chemical_id: str, data: ChemicalCreate):
    """Update an existing chemical."""
    if not ChemicalRepository.exists(chemical_id):
        raise HTTPException(status_code=404, detail="Chemical not found")
    return ChemicalRepository.update(chemical_id, data)


@router.delete("/{chemical_id}")
def delete_chemical(chemical_id: str):
    """Delete a chemical."""
    if not ChemicalRepository.delete(chemical_id):
        raise HTTPException(status_code=404, detail="Chemical not found")
    return {"message": "Chemical deleted"}
