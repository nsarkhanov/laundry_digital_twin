"""
Database connection and initialization module.
Handles SQLite database setup and connection management.
"""
import sqlite3
from contextlib import contextmanager
from typing import Generator

from .config import settings


@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    """
    Context manager for database connections.
    Ensures proper cleanup and enables row factory for dict-like access.
    """
    conn = sqlite3.connect(settings.DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def init_db() -> None:
    """
    Initialize the database with all required tables.
    Creates tables if they don't exist.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Locations table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS locations (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        ''')
        
        # Washing machines table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS washing_machines (
                id TEXT PRIMARY KEY,
                model TEXT NOT NULL,
                capacity_kg REAL NOT NULL,
                water_consumption_l REAL NOT NULL,
                energy_consumption_kwh REAL NOT NULL,
                cycle_duration_min INTEGER NOT NULL,
                created_at TEXT NOT NULL
            )
        ''')
        
        # Drying machines table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS drying_machines (
                id TEXT PRIMARY KEY,
                model TEXT NOT NULL,
                capacity_kg REAL NOT NULL DEFAULT 10.0,
                energy_consumption_kwh_per_cycle REAL NOT NULL,
                cycle_duration_min INTEGER NOT NULL DEFAULT 45,
                created_at TEXT NOT NULL
            )
        ''')
        
        # Ironing machines table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ironing_machines (
                id TEXT PRIMARY KEY,
                model TEXT NOT NULL,
                ironing_labor_hours REAL NOT NULL DEFAULT 10.0,
                energy_consumption_kwh_per_hour REAL NOT NULL,
                created_at TEXT NOT NULL
            )
        ''')
        
        # Chemicals table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chemicals (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                package_price REAL NOT NULL,
                package_amount REAL NOT NULL,
                usage_per_cycle REAL NOT NULL,
                unit TEXT NOT NULL DEFAULT 'g',
                created_at TEXT NOT NULL
            )
        ''')
        
        # Configurations table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS configurations (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                currency TEXT NOT NULL DEFAULT 'EUR',
                electricity_rate REAL NOT NULL,
                water_rate REAL NOT NULL,
                labor_rate REAL NOT NULL,
                season TEXT NOT NULL,
                tariff_mode TEXT NOT NULL,
                location_id TEXT,
                washing_machine_id TEXT,
                drying_machine_id TEXT,
                ironing_machine_id TEXT,
                cycles_per_month INTEGER NOT NULL,
                operational_volume REAL DEFAULT 1000.0,
                operational_period TEXT DEFAULT 'month',
                washing_load_percentage REAL DEFAULT 80.0,
                drying_load_percentage REAL DEFAULT 80.0,
                ironing_labor_hours REAL DEFAULT 10.0,
                chemical_ids TEXT DEFAULT '',
                transport_enabled INTEGER DEFAULT 0,
                transport_mode TEXT DEFAULT 'fixed',
                transport_fixed_cost REAL DEFAULT 0.0,
                transport_distance_km REAL DEFAULT 0.0,
                transport_time_hours REAL DEFAULT 0.0,
                transport_labor_rate REAL DEFAULT 0.0,
                transport_fuel_rate REAL DEFAULT 0.0,
                electricity_tariff_mode TEXT DEFAULT 'standard',
                electricity_tariff_price REAL DEFAULT 1.0,
                water_tariff_mode TEXT DEFAULT 'standard',
                water_tariff_price REAL DEFAULT 1.0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        ''')
        
        conn.commit()
