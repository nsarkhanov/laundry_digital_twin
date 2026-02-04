"""
Cost calculation Pydantic models.
"""
from typing import List, Optional
from pydantic import BaseModel


class CostCalculationRequest(BaseModel):
    """Schema for cost calculation request."""
    currency: str = "EUR"
    electricity_rate: float
    water_rate: float
    labor_rate: float
    season: str
    tariff_mode: str  # Legacy field
    electricity_tariff_mode: str = "standard"
    electricity_tariff_price: float = 1.0
    water_tariff_mode: str = "standard"
    water_tariff_price: float = 1.0
    cycles_per_month: int
    washing_load_percentage: float = 80.0
    drying_load_percentage: float = 80.0
    ironing_labor_hours: float = 10.0
    washing_machine_id: Optional[str] = None
    drying_machine_id: Optional[str] = None
    ironing_machine_id: Optional[str] = None
    chemical_ids: List[str] = []
    # Operational volume (kg per month) - used as total weight
    operational_volume: float = 0.0
    # Transport settings
    transport_enabled: bool = False
    transport_mode: str = "fixed"
    transport_fixed_cost: float = 0.0
    transport_distance_km: float = 0.0
    transport_time_hours: float = 0.0
    transport_labor_rate: float = 0.0
    transport_fuel_rate: float = 0.0


class CostBreakdown(BaseModel):
    """Schema for cost breakdown response."""
    cost_per_kg: float
    electricity_cost_per_kg: float
    water_cost_per_kg: float
    chemical_cost_per_kg: float
    labor_cost_per_kg: float
    transport_cost_per_kg: float = 0.0
    monthly_electricity_kwh: float
    monthly_electricity_cost: float
    monthly_water_m3: float
    monthly_water_cost: float
    monthly_chemical_cost: float
    monthly_labor_hours: float
    monthly_labor_cost: float
    monthly_ironing_hours: float
    monthly_transport_cost: float = 0.0
    total_monthly_cost: float
    total_kg_processed: float
    cost_per_cycle: float
