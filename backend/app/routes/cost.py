"""
Cost calculation routes - API endpoint for cost calculations.
"""
from fastapi import APIRouter

from ..models import CostCalculationRequest, CostBreakdown
from ..services import CostCalculatorService

router = APIRouter(prefix="/calculate-cost", tags=["cost-calculation"])


@router.post("", response_model=CostBreakdown)
def calculate_cost(data: CostCalculationRequest):
    """Calculate comprehensive cost breakdown based on configuration."""
    return CostCalculatorService.calculate(data)
