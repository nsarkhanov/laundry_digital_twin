"""
Location repository - data access for locations table.
"""
from typing import Dict, Any, Optional

from .base import BaseRepository
from ..database import get_db
from ..models import LocationCreate


class LocationRepository(BaseRepository):
    """Repository for location CRUD operations."""
    table_name = "locations"
    
    @classmethod
    def create(cls, data: LocationCreate) -> Optional[Dict[str, Any]]:
        """Create a new location. Returns None if duplicate name exists."""
        # Check for duplicate
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1 FROM locations WHERE name = ?", (data.name,))
            if cursor.fetchone():
                return None  # Duplicate exists
        
        location_id = cls._generate_id()
        now = cls._now()
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO locations (id, name, created_at) 
                VALUES (?, ?, ?)""",
                (location_id, data.name, now)
            )
            conn.commit()
        
        return {"id": location_id, "name": data.name, "created_at": now}
    
    @classmethod
    def update(cls, location_id: str, data: LocationCreate) -> Dict[str, Any]:
        """Update an existing location."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE locations SET name = ? WHERE id = ?",
                (data.name, location_id)
            )
            conn.commit()
        
        return cls.get_by_id(location_id)
