"""
Cost calculator service - business logic for cost calculations.
"""
from typing import Dict, Any, Optional, List

from ..models import CostCalculationRequest, CostBreakdown
from ..database import get_db


class CostCalculatorService:
    """
    Service for calculating laundry operation costs.
    Contains all business logic for cost calculations.
    """
    
    @classmethod
    def calculate(cls, data: CostCalculationRequest) -> CostBreakdown:
        """
        Calculate comprehensive cost breakdown based on configuration.
        """
        # Get machine data from database
        washing_machine = cls._get_washing_machine(data.washing_machine_id)
        drying_machine = cls._get_drying_machine(data.drying_machine_id)
        ironing_machine = cls._get_ironing_machine(data.ironing_machine_id)
        chemicals = cls._get_chemicals(data.chemical_ids)
        
        # Apply season multiplier (affects both utilities)
        season_multiplier = cls._get_season_multiplier(data.season)
        
        # Apply custom tariff price multipliers for electricity and water
        electricity_tariff_multiplier = data.electricity_tariff_price or 1.0
        water_tariff_multiplier = data.water_tariff_price or 1.0
        
        # Calculate monthly totals
        cycles = data.cycles_per_month
        
        # Washing calculations using actual machine specs
        monthly_water_m3 = 0.0
        monthly_washing_kwh = 0.0
        total_kg_processed = 0.0
        
        if washing_machine:
            water_per_cycle_m3 = washing_machine['water_consumption_l'] / 1000
            energy_per_cycle_kwh = washing_machine['energy_consumption_kwh']
            effective_capacity = washing_machine['capacity_kg'] * (data.washing_load_percentage / 100)
            
            monthly_water_m3 = water_per_cycle_m3 * cycles
            monthly_washing_kwh = energy_per_cycle_kwh * cycles
            total_kg_processed = effective_capacity * cycles
        
        # Drying calculations
        monthly_drying_kwh = 0.0
        if drying_machine:
            energy_per_drying_cycle = drying_machine['energy_consumption_kwh_per_cycle']
            # Calculate drying cycles based on volume
            effective_drying_capacity = drying_machine['capacity_kg'] * (data.drying_load_percentage / 100)
            if effective_drying_capacity > 0:
                drying_cycles = total_kg_processed / effective_drying_capacity
            else:
                drying_cycles = 0
            monthly_drying_kwh = energy_per_drying_cycle * drying_cycles
        
        # Ironing calculations
        monthly_ironing_kwh = 0.0
        ironing_hours = data.ironing_labor_hours
        if ironing_machine:
            energy_per_hour = ironing_machine['energy_consumption_kwh_per_hour']
            monthly_ironing_kwh = energy_per_hour * ironing_hours
        
        # Total electricity
        monthly_electricity_kwh = monthly_washing_kwh + monthly_drying_kwh + monthly_ironing_kwh
        
        # Apply multipliers to costs
        monthly_water_cost = (
            monthly_water_m3 * data.water_rate * 
            season_multiplier * water_tariff_multiplier
        )
        monthly_electricity_cost = (
            monthly_electricity_kwh * data.electricity_rate * 
            season_multiplier * electricity_tariff_multiplier
        )
        
        # Chemical costs
        monthly_chemical_cost = 0.0
        for chem in chemicals:
            cost_per_cycle = (chem['package_price'] / chem['package_amount']) * chem['usage_per_cycle']
            monthly_chemical_cost += cost_per_cycle * cycles
        
        # Labor costs (washing + ironing)
        washing_labor_hours = (
            (cycles * washing_machine['cycle_duration_min'] / 60) 
            if washing_machine else 0
        )
        monthly_labor_hours = washing_labor_hours + ironing_hours
        monthly_labor_cost = monthly_labor_hours * data.labor_rate
        
        # Transport costs
        monthly_transport_cost = 0.0
        if data.transport_enabled:
            if data.transport_mode == "fixed":
                monthly_transport_cost = data.transport_fixed_cost
            else:  # calculated
                fuel_cost = data.transport_distance_km * data.transport_fuel_rate
                labor_cost = data.transport_time_hours * data.transport_labor_rate
                monthly_transport_cost = fuel_cost + labor_cost
        
        # Totals
        total_monthly_cost = (
            monthly_electricity_cost + 
            monthly_water_cost + 
            monthly_chemical_cost + 
            monthly_labor_cost + 
            monthly_transport_cost
        )
        
        # Per-unit calculations
        cost_per_kg = total_monthly_cost / total_kg_processed if total_kg_processed > 0 else 0
        electricity_cost_per_kg = monthly_electricity_cost / total_kg_processed if total_kg_processed > 0 else 0
        water_cost_per_kg = monthly_water_cost / total_kg_processed if total_kg_processed > 0 else 0
        chemical_cost_per_kg = monthly_chemical_cost / total_kg_processed if total_kg_processed > 0 else 0
        labor_cost_per_kg = monthly_labor_cost / total_kg_processed if total_kg_processed > 0 else 0
        transport_cost_per_kg = monthly_transport_cost / total_kg_processed if total_kg_processed > 0 else 0
        cost_per_cycle = total_monthly_cost / cycles if cycles > 0 else 0
        
        return CostBreakdown(
            cost_per_kg=round(cost_per_kg, 4),
            electricity_cost_per_kg=round(electricity_cost_per_kg, 4),
            water_cost_per_kg=round(water_cost_per_kg, 4),
            chemical_cost_per_kg=round(chemical_cost_per_kg, 4),
            labor_cost_per_kg=round(labor_cost_per_kg, 4),
            transport_cost_per_kg=round(transport_cost_per_kg, 4),
            monthly_electricity_kwh=round(monthly_electricity_kwh, 2),
            monthly_electricity_cost=round(monthly_electricity_cost, 2),
            monthly_water_m3=round(monthly_water_m3, 2),
            monthly_water_cost=round(monthly_water_cost, 2),
            monthly_chemical_cost=round(monthly_chemical_cost, 2),
            monthly_labor_hours=round(monthly_labor_hours, 2),
            monthly_labor_cost=round(monthly_labor_cost, 2),
            monthly_ironing_hours=round(ironing_hours, 2),
            monthly_transport_cost=round(monthly_transport_cost, 2),
            total_monthly_cost=round(total_monthly_cost, 2),
            total_kg_processed=round(total_kg_processed, 2),
            cost_per_cycle=round(cost_per_cycle, 2),
        )
    
    @staticmethod
    def _get_season_multiplier(season: str) -> float:
        """Get cost multiplier based on season."""
        if season == "winter":
            return 1.15  # 15% higher in winter
        elif season == "summer":
            return 0.95  # 5% lower in summer
        return 1.0
    
    @staticmethod
    def _get_washing_machine(machine_id: Optional[str]) -> Optional[Dict[str, Any]]:
        """Get washing machine by ID."""
        if not machine_id:
            return None
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM washing_machines WHERE id = ?", (machine_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
    
    @staticmethod
    def _get_drying_machine(machine_id: Optional[str]) -> Optional[Dict[str, Any]]:
        """Get drying machine by ID."""
        if not machine_id:
            return None
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM drying_machines WHERE id = ?", (machine_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
    
    @staticmethod
    def _get_ironing_machine(machine_id: Optional[str]) -> Optional[Dict[str, Any]]:
        """Get ironing machine by ID."""
        if not machine_id:
            return None
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM ironing_machines WHERE id = ?", (machine_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
    
    @staticmethod
    def _get_chemicals(chemical_ids: List[str]) -> List[Dict[str, Any]]:
        """Get chemicals by IDs."""
        if not chemical_ids:
            return []
        with get_db() as conn:
            cursor = conn.cursor()
            placeholders = ','.join('?' * len(chemical_ids))
            cursor.execute(
                f"SELECT * FROM chemicals WHERE id IN ({placeholders})",
                chemical_ids
            )
            return [dict(row) for row in cursor.fetchall()]
