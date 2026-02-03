"""
Ironing machine repository - data access for ironing_machines table.
"""
from typing import Dict, Any

from .base import BaseRepository
from ..database import get_db
from ..models import IroningMachineCreate


class IroningMachineRepository(BaseRepository):
    """Repository for ironing machine CRUD operations."""
    table_name = "ironing_machines"
    
    @classmethod
    def create(cls, data: IroningMachineCreate) -> Dict[str, Any]:
        """Create a new ironing machine."""
        machine_id = cls._generate_id()
        now = cls._now()
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO ironing_machines 
                (id, model, ironing_labor_hours, energy_consumption_kwh_per_hour, created_at) 
                VALUES (?, ?, ?, ?, ?)""",
                (machine_id, data.model, data.ironing_labor_hours,
                 data.energy_consumption_kwh_per_hour, now)
            )
            conn.commit()
        
        return {
            "id": machine_id,
            "model": data.model,
            "ironing_labor_hours": data.ironing_labor_hours,
            "energy_consumption_kwh_per_hour": data.energy_consumption_kwh_per_hour,
            "created_at": now
        }
    
    @classmethod
    def update(cls, machine_id: str, data: IroningMachineCreate) -> Dict[str, Any]:
        """Update an existing ironing machine."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """UPDATE ironing_machines SET 
                model = ?, ironing_labor_hours = ?, energy_consumption_kwh_per_hour = ? 
                WHERE id = ?""",
                (data.model, data.ironing_labor_hours,
                 data.energy_consumption_kwh_per_hour, machine_id)
            )
            conn.commit()
        
        return cls.get_by_id(machine_id)
