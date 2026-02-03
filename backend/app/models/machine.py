"""
Machine Pydantic models (Washing, Drying, Ironing).
"""
from pydantic import BaseModel


# ============ Washing Machine ============

class WashingMachineCreate(BaseModel):
    """Schema for creating a washing machine."""
    model: str
    capacity_kg: float
    water_consumption_l: float
    energy_consumption_kwh: float
    cycle_duration_min: int


class WashingMachine(BaseModel):
    """Schema for washing machine response."""
    id: str
    model: str
    capacity_kg: float
    water_consumption_l: float
    energy_consumption_kwh: float
    cycle_duration_min: int
    created_at: str


# ============ Drying Machine ============

class DryingMachineCreate(BaseModel):
    """Schema for creating a drying machine."""
    model: str
    capacity_kg: float = 10.0
    energy_consumption_kwh_per_cycle: float
    cycle_duration_min: int = 45


class DryingMachine(BaseModel):
    """Schema for drying machine response."""
    id: str
    model: str
    capacity_kg: float
    energy_consumption_kwh_per_cycle: float
    cycle_duration_min: int
    created_at: str


# ============ Ironing Machine ============

class IroningMachineCreate(BaseModel):
    """Schema for creating an ironing machine."""
    model: str
    ironing_labor_hours: float
    energy_consumption_kwh_per_hour: float


class IroningMachine(BaseModel):
    """Schema for ironing machine response."""
    id: str
    model: str
    ironing_labor_hours: float
    energy_consumption_kwh_per_hour: float
    created_at: str
