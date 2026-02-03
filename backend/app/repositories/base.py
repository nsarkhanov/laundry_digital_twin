"""
Base repository with common CRUD operations.
"""
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from ..database import get_db


class BaseRepository:
    """
    Base repository providing common CRUD operations.
    Subclasses should set table_name and implement any custom queries.
    """
    table_name: str = ""
    
    @classmethod
    def _now(cls) -> str:
        """Get current UTC timestamp as ISO string."""
        return datetime.now(timezone.utc).isoformat()
    
    @classmethod
    def _generate_id(cls) -> str:
        """Generate a new UUID."""
        return str(uuid.uuid4())
    
    @classmethod
    def get_all(cls) -> List[Dict[str, Any]]:
        """Get all records from the table."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(f"SELECT * FROM {cls.table_name}")
            return [dict(row) for row in cursor.fetchall()]
    
    @classmethod
    def get_by_id(cls, record_id: str) -> Optional[Dict[str, Any]]:
        """Get a single record by ID."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                f"SELECT * FROM {cls.table_name} WHERE id = ?",
                (record_id,)
            )
            row = cursor.fetchone()
            return dict(row) if row else None
    
    @classmethod
    def delete(cls, record_id: str) -> bool:
        """Delete a record by ID. Returns True if deleted."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                f"DELETE FROM {cls.table_name} WHERE id = ?",
                (record_id,)
            )
            conn.commit()
            return cursor.rowcount > 0
    
    @classmethod
    def exists(cls, record_id: str) -> bool:
        """Check if a record exists."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                f"SELECT 1 FROM {cls.table_name} WHERE id = ?",
                (record_id,)
            )
            return cursor.fetchone() is not None
