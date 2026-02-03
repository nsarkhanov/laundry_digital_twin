"""
Washing machine repository - data access for washing_machines table.
"""
from typing import Dict, Any

from .base import BaseRepository
from ..database import get_db
from ..models import WashingMachineCreate


class WashingMachineRepository(BaseRepository):
    """Repository for washing machine CRUD operations."""
    table_name = "washing_machines"
    
    @classmethod
    def create(cls, data: WashingMachineCreate) -> Dict[str, Any]:
        """Create a new washing machine."""
        machine_id = cls._generate_id()
        now = cls._now()
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO washing_machines 
                (id, model, capacity_kg, water_consumption_l, energy_consumption_kwh, 
                cycle_duration_min, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (machine_id, data.model, data.capacity_kg, data.water_consumption_l,
                 data.energy_consumption_kwh, data.cycle_duration_min, now)
            )
            conn.commit()
        
        return {
            "id": machine_id,
            "model": data.model,
            "capacity_kg": data.capacity_kg,
            "water_consumption_l": data.water_consumption_l,
            "energy_consumption_kwh": data.energy_consumption_kwh,
            "cycle_duration_min": data.cycle_duration_min,
            "created_at": now
        }
    
    @classmethod
    def update(cls, machine_id: str, data: WashingMachineCreate) -> Dict[str, Any]:
        """Update an existing washing machine."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """UPDATE washing_machines SET 
                model = ?, capacity_kg = ?, water_consumption_l = ?, 
                energy_consumption_kwh = ?, cycle_duration_min = ? 
                WHERE id = ?""",
                (data.model, data.capacity_kg, data.water_consumption_l,
                 data.energy_consumption_kwh, data.cycle_duration_min, machine_id)
            )
            conn.commit()
        
        return cls.get_by_id(machine_id)
