"""
Ironing machine routes - API endpoints for ironing machine management.
"""
from fastapi import APIRouter, HTTPException

from ..models import IroningMachine, IroningMachineCreate
from ..repositories import IroningMachineRepository

router = APIRouter(prefix="/ironing-machines", tags=["ironing-machines"])


@router.post("", response_model=IroningMachine)
def create_ironing_machine(data: IroningMachineCreate):
    """Create a new ironing machine."""
    return IroningMachineRepository.create(data)


@router.get("", response_model=list[IroningMachine])
def get_ironing_machines():
    """Get all ironing machines."""
    return IroningMachineRepository.get_all()


@router.put("/{machine_id}", response_model=IroningMachine)
def update_ironing_machine(machine_id: str, data: IroningMachineCreate):
    """Update an existing ironing machine."""
    if not IroningMachineRepository.exists(machine_id):
        raise HTTPException(status_code=404, detail="Ironing machine not found")
    return IroningMachineRepository.update(machine_id, data)


@router.delete("/{machine_id}")
def delete_ironing_machine(machine_id: str):
    """Delete an ironing machine."""
    if not IroningMachineRepository.delete(machine_id):
        raise HTTPException(status_code=404, detail="Ironing machine not found")
    return {"message": "Ironing machine deleted"}
