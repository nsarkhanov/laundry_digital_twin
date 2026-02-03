"""
Washing machine routes - API endpoints for washing machine management.
"""
from fastapi import APIRouter, HTTPException

from ..models import WashingMachine, WashingMachineCreate
from ..repositories import WashingMachineRepository

router = APIRouter(prefix="/washing-machines", tags=["washing-machines"])


@router.post("", response_model=WashingMachine)
def create_washing_machine(data: WashingMachineCreate):
    """Create a new washing machine."""
    return WashingMachineRepository.create(data)


@router.get("", response_model=list[WashingMachine])
def get_washing_machines():
    """Get all washing machines."""
    return WashingMachineRepository.get_all()


@router.put("/{machine_id}", response_model=WashingMachine)
def update_washing_machine(machine_id: str, data: WashingMachineCreate):
    """Update an existing washing machine."""
    if not WashingMachineRepository.exists(machine_id):
        raise HTTPException(status_code=404, detail="Washing machine not found")
    return WashingMachineRepository.update(machine_id, data)


@router.delete("/{machine_id}")
def delete_washing_machine(machine_id: str):
    """Delete a washing machine."""
    if not WashingMachineRepository.delete(machine_id):
        raise HTTPException(status_code=404, detail="Washing machine not found")
    return {"message": "Washing machine deleted"}
