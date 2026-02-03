"""
Drying machine routes - API endpoints for drying machine management.
"""
from fastapi import APIRouter, HTTPException

from ..models import DryingMachine, DryingMachineCreate
from ..repositories import DryingMachineRepository

router = APIRouter(prefix="/drying-machines", tags=["drying-machines"])


@router.post("", response_model=DryingMachine)
def create_drying_machine(data: DryingMachineCreate):
    """Create a new drying machine."""
    return DryingMachineRepository.create(data)


@router.get("", response_model=list[DryingMachine])
def get_drying_machines():
    """Get all drying machines."""
    return DryingMachineRepository.get_all()


@router.put("/{machine_id}", response_model=DryingMachine)
def update_drying_machine(machine_id: str, data: DryingMachineCreate):
    """Update an existing drying machine."""
    if not DryingMachineRepository.exists(machine_id):
        raise HTTPException(status_code=404, detail="Drying machine not found")
    return DryingMachineRepository.update(machine_id, data)


@router.delete("/{machine_id}")
def delete_drying_machine(machine_id: str):
    """Delete a drying machine."""
    if not DryingMachineRepository.delete(machine_id):
        raise HTTPException(status_code=404, detail="Drying machine not found")
    return {"message": "Drying machine deleted"}
