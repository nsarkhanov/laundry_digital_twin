"""
Chemical repository - data access for chemicals table.
"""
from typing import Dict, Any, List

from .base import BaseRepository
from ..database import get_db
from ..models import ChemicalCreate


class ChemicalRepository(BaseRepository):
    """Repository for chemical CRUD operations."""
    table_name = "chemicals"
    
    @classmethod
    def create(cls, data: ChemicalCreate) -> Dict[str, Any]:
        """Create a new chemical."""
        chemical_id = cls._generate_id()
        now = cls._now()
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO chemicals 
                (id, name, type, package_price, package_amount, usage_per_cycle, unit, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (chemical_id, data.name, data.type, data.package_price,
                 data.package_amount, data.usage_per_cycle, data.unit, now)
            )
            conn.commit()
        
        return {
            "id": chemical_id,
            "name": data.name,
            "type": data.type,
            "package_price": data.package_price,
            "package_amount": data.package_amount,
            "usage_per_cycle": data.usage_per_cycle,
            "unit": data.unit,
            "created_at": now
        }
    
    @classmethod
    def update(cls, chemical_id: str, data: ChemicalCreate) -> Dict[str, Any]:
        """Update an existing chemical."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """UPDATE chemicals SET 
                name = ?, type = ?, package_price = ?, package_amount = ?, 
                usage_per_cycle = ?, unit = ? 
                WHERE id = ?""",
                (data.name, data.type, data.package_price, data.package_amount,
                 data.usage_per_cycle, data.unit, chemical_id)
            )
            conn.commit()
        
        return cls.get_by_id(chemical_id)
    
    @classmethod
    def get_by_ids(cls, chemical_ids: List[str]) -> List[Dict[str, Any]]:
        """Get multiple chemicals by their IDs."""
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
