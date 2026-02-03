"""
Drying machine repository - data access for drying_machines table.
"""
from typing import Dict, Any

from .base import BaseRepository
from ..database import get_db
from ..models import DryingMachineCreate


class DryingMachineRepository(BaseRepository):
    """Repository for drying machine CRUD operations."""
    table_name = "drying_machines"
    
    @classmethod
    def create(cls, data: DryingMachineCreate) -> Dict[str, Any]:
        """Create a new drying machine."""
        machine_id = cls._generate_id()
        now = cls._now()
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO drying_machines 
                (id, model, capacity_kg, energy_consumption_kwh_per_cycle, 
                cycle_duration_min, created_at) 
                VALUES (?, ?, ?, ?, ?, ?)""",
                (machine_id, data.model, data.capacity_kg,
                 data.energy_consumption_kwh_per_cycle, data.cycle_duration_min, now)
            )
            conn.commit()
        
        return {
            "id": machine_id,
            "model": data.model,
            "capacity_kg": data.capacity_kg,
            "energy_consumption_kwh_per_cycle": data.energy_consumption_kwh_per_cycle,
            "cycle_duration_min": data.cycle_duration_min,
            "created_at": now
        }
    
    @classmethod
    def update(cls, machine_id: str, data: DryingMachineCreate) -> Dict[str, Any]:
        """Update an existing drying machine."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """UPDATE drying_machines SET 
                model = ?, capacity_kg = ?, energy_consumption_kwh_per_cycle = ?, 
                cycle_duration_min = ? 
                WHERE id = ?""",
                (data.model, data.capacity_kg, data.energy_consumption_kwh_per_cycle,
                 data.cycle_duration_min, machine_id)
            )
            conn.commit()
        
        return cls.get_by_id(machine_id)
