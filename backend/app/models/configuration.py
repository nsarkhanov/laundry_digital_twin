"""
Configuration Pydantic models.
"""
from typing import List, Optional
from pydantic import BaseModel


class ConfigurationCreate(BaseModel):
    """Schema for creating/updating a configuration."""
    name: str = "Default"
    currency: str = "EUR"
    electricity_rate: float
    water_rate: float
    labor_rate: float
    season: str
    tariff_mode: str  # Legacy field, kept for backwards compatibility
    electricity_tariff_mode: str = "standard"
    electricity_tariff_price: float = 1.0
    water_tariff_mode: str = "standard"
    water_tariff_price: float = 1.0
    location_id: Optional[str] = None
    washing_machine_id: Optional[str] = None
    drying_machine_id: Optional[str] = None
    ironing_machine_id: Optional[str] = None
    cycles_per_month: int
    operational_volume: float = 1000.0
    operational_period: str = "month"
    washing_load_percentage: float = 80.0
    drying_load_percentage: float = 80.0
    ironing_labor_hours: float = 10.0
    chemical_ids: List[str] = []
    # Transport settings
    transport_enabled: bool = False
    transport_mode: str = "fixed"  # "fixed" or "calculated"
    transport_fixed_cost: float = 0.0
    transport_distance_km: float = 0.0
    transport_time_hours: float = 0.0
    transport_labor_rate: float = 0.0
    transport_fuel_rate: float = 0.0


class Configuration(BaseModel):
    """Schema for configuration response."""
    id: str
    name: str
    currency: str
    electricity_rate: float
    water_rate: float
    labor_rate: float
    season: str
    tariff_mode: str
    electricity_tariff_mode: str = "standard"
    electricity_tariff_price: float = 1.0
    water_tariff_mode: str = "standard"
    water_tariff_price: float = 1.0
    location_id: Optional[str]
    washing_machine_id: Optional[str]
    drying_machine_id: Optional[str]
    ironing_machine_id: Optional[str]
    cycles_per_month: int
    operational_volume: float = 1000.0
    operational_period: str = "month"
    washing_load_percentage: float
    drying_load_percentage: float
    ironing_labor_hours: float
    chemical_ids: List[str] = []
    # Transport settings
    transport_enabled: bool = False
    transport_mode: str = "fixed"
    transport_fixed_cost: float = 0.0
    transport_distance_km: float = 0.0
    transport_time_hours: float = 0.0
    transport_labor_rate: float = 0.0
    transport_fuel_rate: float = 0.0
    created_at: str
    updated_at: str
