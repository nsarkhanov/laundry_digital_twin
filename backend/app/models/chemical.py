"""
Chemical Pydantic models.
"""
from pydantic import BaseModel


class ChemicalCreate(BaseModel):
    """Schema for creating a chemical."""
    name: str
    type: str
    package_price: float
    package_amount: float
    usage_per_cycle: float
    unit: str = 'g'


class Chemical(BaseModel):
    """Schema for chemical response."""
    id: str
    name: str
    type: str
    package_price: float
    package_amount: float
    usage_per_cycle: float
    unit: str
    created_at: str
