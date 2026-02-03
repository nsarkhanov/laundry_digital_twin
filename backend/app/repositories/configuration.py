"""
Configuration repository - data access for configurations table.
"""
from typing import Dict, Any, Optional, List

from .base import BaseRepository
from ..database import get_db
from ..models import ConfigurationCreate


class ConfigurationRepository(BaseRepository):
    """Repository for configuration CRUD operations."""
    table_name = "configurations"
    
    @classmethod
    def get_by_name(cls, name: str) -> Optional[Dict[str, Any]]:
        """Get a configuration by name."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM configurations WHERE name = ?",
                (name,)
            )
            row = cursor.fetchone()
            return dict(row) if row else None
    
    @classmethod
    def get_latest(cls) -> Optional[Dict[str, Any]]:
        """Get the most recently updated configuration."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM configurations ORDER BY updated_at DESC LIMIT 1"
            )
            row = cursor.fetchone()
            if row:
                config = dict(row)
                # Parse chemical_ids from comma-separated string
                chemical_ids_str = config.get('chemical_ids', '')
                config['chemical_ids'] = (
                    [cid for cid in chemical_ids_str.split(',') if cid]
                    if chemical_ids_str else []
                )
                # Convert transport_enabled from int to bool
                config['transport_enabled'] = bool(config.get('transport_enabled', 0))
                return config
            return None
    
    @classmethod
    def save(cls, data: ConfigurationCreate) -> Dict[str, Any]:
        """
        Save a configuration. Updates existing if name matches, creates new otherwise.
        """
        now = cls._now()
        chemical_ids_str = ','.join(data.chemical_ids) if data.chemical_ids else ''
        
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Check if config with this name exists
            existing = cls.get_by_name(data.name)
            
            if existing:
                config_id = existing['id']
                cursor.execute(
                    """UPDATE configurations SET
                    currency = ?, electricity_rate = ?, water_rate = ?, labor_rate = ?, 
                    season = ?, tariff_mode = ?, electricity_tariff_mode = ?, electricity_tariff_price = ?,
                    water_tariff_mode = ?, water_tariff_price = ?,
                    location_id = ?, washing_machine_id = ?, 
                    drying_machine_id = ?, ironing_machine_id = ?, cycles_per_month = ?,
                    operational_volume = ?, operational_period = ?,
                    washing_load_percentage = ?, drying_load_percentage = ?, ironing_labor_hours = ?, 
                    chemical_ids = ?, transport_enabled = ?, transport_mode = ?, 
                    transport_fixed_cost = ?, transport_distance_km = ?, transport_time_hours = ?,
                    transport_labor_rate = ?, transport_fuel_rate = ?, updated_at = ?
                    WHERE id = ?""",
                    (data.currency, data.electricity_rate, data.water_rate, data.labor_rate,
                     data.season, data.tariff_mode, data.electricity_tariff_mode, data.electricity_tariff_price,
                     data.water_tariff_mode, data.water_tariff_price,
                     data.location_id, data.washing_machine_id,
                     data.drying_machine_id, data.ironing_machine_id, data.cycles_per_month,
                     data.operational_volume, data.operational_period,
                     data.washing_load_percentage, data.drying_load_percentage, data.ironing_labor_hours,
                     chemical_ids_str, 1 if data.transport_enabled else 0, data.transport_mode,
                     data.transport_fixed_cost, data.transport_distance_km, data.transport_time_hours,
                     data.transport_labor_rate, data.transport_fuel_rate, now, config_id)
                )
            else:
                config_id = cls._generate_id()
                cursor.execute(
                    """INSERT INTO configurations 
                    (id, name, currency, electricity_rate, water_rate, labor_rate, season, tariff_mode,
                     electricity_tariff_mode, electricity_tariff_price, water_tariff_mode, water_tariff_price,
                     location_id, washing_machine_id, drying_machine_id, ironing_machine_id, cycles_per_month, 
                     operational_volume, operational_period,
                     washing_load_percentage, drying_load_percentage, ironing_labor_hours, chemical_ids,
                     transport_enabled, transport_mode, transport_fixed_cost, transport_distance_km, 
                     transport_time_hours, transport_labor_rate, transport_fuel_rate, created_at, updated_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (config_id, data.name, data.currency, data.electricity_rate, data.water_rate, data.labor_rate,
                     data.season, data.tariff_mode, data.electricity_tariff_mode, data.electricity_tariff_price,
                     data.water_tariff_mode, data.water_tariff_price,
                     data.location_id, data.washing_machine_id, data.drying_machine_id,
                     data.ironing_machine_id, data.cycles_per_month, 
                     data.operational_volume, data.operational_period,
                     data.washing_load_percentage, data.drying_load_percentage, data.ironing_labor_hours,
                     chemical_ids_str, 1 if data.transport_enabled else 0, data.transport_mode,
                     data.transport_fixed_cost, data.transport_distance_km, data.transport_time_hours,
                     data.transport_labor_rate, data.transport_fuel_rate, now, now)
                )
            
            conn.commit()
        
        # Return the saved config
        return cls.get_latest()
    
    @classmethod
    def get_all_formatted(cls) -> List[Dict[str, Any]]:
        """Get all configurations with formatted chemical_ids."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM configurations")
            configs = []
            for row in cursor.fetchall():
                config = dict(row)
                chemical_ids_str = config.get('chemical_ids', '')
                config['chemical_ids'] = (
                    [cid for cid in chemical_ids_str.split(',') if cid]
                    if chemical_ids_str else []
                )
                config['transport_enabled'] = bool(config.get('transport_enabled', 0))
                configs.append(config)
            return configs
