from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import sqlite3
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from contextlib import contextmanager

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# SQLite Database Setup
DB_PATH = ROOT_DIR / 'laundry.db'

def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Locations table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS locations (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL
        )
    ''')
    
    # Washing Machines table
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
    
    # Ironing Machines table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ironing_machines (
            id TEXT PRIMARY KEY,
            model TEXT NOT NULL,
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
            package_weight_g REAL NOT NULL,
            usage_per_cycle_g REAL NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')
    
    # Configurations table (saves user settings)
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
            ironing_machine_id TEXT,
            cycles_per_month INTEGER NOT NULL,
            batch_weight_kg REAL NOT NULL,
            ironing_percentage REAL NOT NULL,
            ironing_time_per_kg_min REAL NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database
init_db()

# Create the main app
app = FastAPI(title="Laundry Digital Twin API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class LocationCreate(BaseModel):
    name: str

class Location(BaseModel):
    id: str
    name: str
    created_at: str

class WashingMachineCreate(BaseModel):
    model: str
    capacity_kg: float
    water_consumption_l: float
    energy_consumption_kwh: float
    cycle_duration_min: int

class WashingMachine(BaseModel):
    id: str
    model: str
    capacity_kg: float
    water_consumption_l: float
    energy_consumption_kwh: float
    cycle_duration_min: int
    created_at: str

class IroningMachineCreate(BaseModel):
    model: str
    energy_consumption_kwh_per_hour: float

class IroningMachine(BaseModel):
    id: str
    model: str
    energy_consumption_kwh_per_hour: float
    created_at: str

class ChemicalCreate(BaseModel):
    name: str
    type: str  # 'washing_powder' or 'stain_remover'
    package_price: float
    package_weight_g: float
    usage_per_cycle_g: float

class Chemical(BaseModel):
    id: str
    name: str
    type: str
    package_price: float
    package_weight_g: float
    usage_per_cycle_g: float
    created_at: str

class ConfigurationCreate(BaseModel):
    name: str = "Default"
    currency: str = "EUR"
    electricity_rate: float
    water_rate: float
    labor_rate: float
    season: str
    tariff_mode: str
    location_id: Optional[str] = None
    washing_machine_id: Optional[str] = None
    ironing_machine_id: Optional[str] = None
    cycles_per_month: int
    batch_weight_kg: float
    ironing_percentage: float
    ironing_time_per_kg_min: float = 5.0

class Configuration(BaseModel):
    id: str
    name: str
    currency: str
    electricity_rate: float
    water_rate: float
    labor_rate: float
    season: str
    tariff_mode: str
    location_id: Optional[str]
    washing_machine_id: Optional[str]
    ironing_machine_id: Optional[str]
    cycles_per_month: int
    batch_weight_kg: float
    ironing_percentage: float
    ironing_time_per_kg_min: float
    created_at: str
    updated_at: str

class CostCalculationRequest(BaseModel):
    currency: str = "EUR"
    electricity_rate: float
    water_rate: float
    labor_rate: float
    season: str
    tariff_mode: str
    cycles_per_month: int
    batch_weight_kg: float
    ironing_percentage: float
    ironing_time_per_kg_min: float = 5.0
    washing_machine_id: Optional[str] = None
    ironing_machine_id: Optional[str] = None
    chemical_ids: List[str] = []

class CostBreakdown(BaseModel):
    cost_per_kg: float
    electricity_cost_per_kg: float
    water_cost_per_kg: float
    chemical_cost_per_kg: float
    labor_cost_per_kg: float
    monthly_electricity_kwh: float
    monthly_electricity_cost: float
    monthly_water_m3: float
    monthly_water_cost: float
    monthly_chemical_cost: float
    monthly_labor_hours: float
    monthly_labor_cost: float
    total_monthly_cost: float
    total_kg_processed: float
    cost_per_cycle: float

# API Routes

@api_router.get("/")
async def root():
    return {"message": "Laundry Digital Twin API"}

# Location Routes
@api_router.post("/locations", response_model=Location)
async def create_location(data: LocationCreate):
    conn = get_db()
    cursor = conn.cursor()
    location_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    
    try:
        cursor.execute(
            "INSERT INTO locations (id, name, created_at) VALUES (?, ?, ?)",
            (location_id, data.name, created_at)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Location already exists")
    
    conn.close()
    return Location(id=location_id, name=data.name, created_at=created_at)

@api_router.get("/locations", response_model=List[Location])
async def get_locations():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM locations ORDER BY name")
    rows = cursor.fetchall()
    conn.close()
    return [Location(**dict(row)) for row in rows]

@api_router.delete("/locations/{location_id}")
async def delete_location(location_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM locations WHERE id = ?", (location_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}

# Washing Machine Routes
@api_router.post("/washing-machines", response_model=WashingMachine)
async def create_washing_machine(data: WashingMachineCreate):
    conn = get_db()
    cursor = conn.cursor()
    machine_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    
    cursor.execute(
        """INSERT INTO washing_machines 
        (id, model, capacity_kg, water_consumption_l, energy_consumption_kwh, cycle_duration_min, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (machine_id, data.model, data.capacity_kg, data.water_consumption_l, 
         data.energy_consumption_kwh, data.cycle_duration_min, created_at)
    )
    conn.commit()
    conn.close()
    
    return WashingMachine(
        id=machine_id, model=data.model, capacity_kg=data.capacity_kg,
        water_consumption_l=data.water_consumption_l, energy_consumption_kwh=data.energy_consumption_kwh,
        cycle_duration_min=data.cycle_duration_min, created_at=created_at
    )

@api_router.get("/washing-machines", response_model=List[WashingMachine])
async def get_washing_machines():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM washing_machines ORDER BY model")
    rows = cursor.fetchall()
    conn.close()
    return [WashingMachine(**dict(row)) for row in rows]

@api_router.delete("/washing-machines/{machine_id}")
async def delete_washing_machine(machine_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM washing_machines WHERE id = ?", (machine_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}

# Ironing Machine Routes
@api_router.post("/ironing-machines", response_model=IroningMachine)
async def create_ironing_machine(data: IroningMachineCreate):
    conn = get_db()
    cursor = conn.cursor()
    machine_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    
    cursor.execute(
        """INSERT INTO ironing_machines 
        (id, model, energy_consumption_kwh_per_hour, created_at) 
        VALUES (?, ?, ?, ?)""",
        (machine_id, data.model, data.energy_consumption_kwh_per_hour, created_at)
    )
    conn.commit()
    conn.close()
    
    return IroningMachine(
        id=machine_id, model=data.model,
        energy_consumption_kwh_per_hour=data.energy_consumption_kwh_per_hour, created_at=created_at
    )

@api_router.get("/ironing-machines", response_model=List[IroningMachine])
async def get_ironing_machines():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ironing_machines ORDER BY model")
    rows = cursor.fetchall()
    conn.close()
    return [IroningMachine(**dict(row)) for row in rows]

@api_router.delete("/ironing-machines/{machine_id}")
async def delete_ironing_machine(machine_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM ironing_machines WHERE id = ?", (machine_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}

# Chemical Routes
@api_router.post("/chemicals", response_model=Chemical)
async def create_chemical(data: ChemicalCreate):
    conn = get_db()
    cursor = conn.cursor()
    chemical_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    
    cursor.execute(
        """INSERT INTO chemicals 
        (id, name, type, package_price, package_weight_g, usage_per_cycle_g, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (chemical_id, data.name, data.type, data.package_price, 
         data.package_weight_g, data.usage_per_cycle_g, created_at)
    )
    conn.commit()
    conn.close()
    
    return Chemical(
        id=chemical_id, name=data.name, type=data.type,
        package_price=data.package_price, package_weight_g=data.package_weight_g,
        usage_per_cycle_g=data.usage_per_cycle_g, created_at=created_at
    )

@api_router.get("/chemicals", response_model=List[Chemical])
async def get_chemicals():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM chemicals ORDER BY name")
    rows = cursor.fetchall()
    conn.close()
    return [Chemical(**dict(row)) for row in rows]

@api_router.delete("/chemicals/{chemical_id}")
async def delete_chemical(chemical_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM chemicals WHERE id = ?", (chemical_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}

# Configuration Routes
@api_router.post("/configurations", response_model=Configuration)
async def save_configuration(data: ConfigurationCreate):
    conn = get_db()
    cursor = conn.cursor()
    config_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    cursor.execute(
        """INSERT INTO configurations 
        (id, name, currency, electricity_rate, water_rate, labor_rate, season, tariff_mode,
         location_id, washing_machine_id, ironing_machine_id, cycles_per_month, batch_weight_kg,
         ironing_percentage, ironing_time_per_kg_min, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (config_id, data.name, data.currency, data.electricity_rate, data.water_rate, data.labor_rate,
         data.season, data.tariff_mode, data.location_id, data.washing_machine_id, data.ironing_machine_id,
         data.cycles_per_month, data.batch_weight_kg, data.ironing_percentage, 
         data.ironing_time_per_kg_min, now, now)
    )
    conn.commit()
    conn.close()
    
    return Configuration(
        id=config_id, name=data.name, currency=data.currency,
        electricity_rate=data.electricity_rate, water_rate=data.water_rate, labor_rate=data.labor_rate,
        season=data.season, tariff_mode=data.tariff_mode, location_id=data.location_id,
        washing_machine_id=data.washing_machine_id, ironing_machine_id=data.ironing_machine_id,
        cycles_per_month=data.cycles_per_month, batch_weight_kg=data.batch_weight_kg,
        ironing_percentage=data.ironing_percentage, ironing_time_per_kg_min=data.ironing_time_per_kg_min,
        created_at=now, updated_at=now
    )

@api_router.get("/configurations", response_model=List[Configuration])
async def get_configurations():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM configurations ORDER BY updated_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [Configuration(**dict(row)) for row in rows]

@api_router.get("/configurations/latest", response_model=Optional[Configuration])
async def get_latest_configuration():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM configurations ORDER BY updated_at DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    if row:
        return Configuration(**dict(row))
    return None

@api_router.delete("/configurations/{config_id}")
async def delete_configuration(config_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM configurations WHERE id = ?", (config_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}

# Cost Calculation Route
@api_router.post("/calculate-cost", response_model=CostBreakdown)
async def calculate_cost(data: CostCalculationRequest):
    conn = get_db()
    cursor = conn.cursor()
    
    # Get washing machine details
    washing_machine = None
    if data.washing_machine_id:
        cursor.execute("SELECT * FROM washing_machines WHERE id = ?", (data.washing_machine_id,))
        row = cursor.fetchone()
        if row:
            washing_machine = dict(row)
    
    # Get ironing machine details
    ironing_machine = None
    if data.ironing_machine_id:
        cursor.execute("SELECT * FROM ironing_machines WHERE id = ?", (data.ironing_machine_id,))
        row = cursor.fetchone()
        if row:
            ironing_machine = dict(row)
    
    # Get chemicals
    chemicals = []
    for chem_id in data.chemical_ids:
        cursor.execute("SELECT * FROM chemicals WHERE id = ?", (chem_id,))
        row = cursor.fetchone()
        if row:
            chemicals.append(dict(row))
    
    conn.close()
    
    # Apply season and tariff mode multipliers
    tariff_multiplier = 1.0
    if data.season == "winter":
        tariff_multiplier *= 1.15  # 15% higher in winter
    elif data.season == "summer":
        tariff_multiplier *= 0.95  # 5% lower in summer
    
    if data.tariff_mode == "high":
        tariff_multiplier *= 1.25  # 25% higher in peak hours
    elif data.tariff_mode == "low":
        tariff_multiplier *= 0.75  # 25% lower in off-peak
    
    # Calculate monthly totals
    cycles = data.cycles_per_month
    batch_kg = data.batch_weight_kg
    total_kg = cycles * batch_kg
    
    # Default values if no machine selected
    water_per_cycle = 50  # liters
    energy_per_cycle = 1.5  # kWh
    
    if washing_machine:
        water_per_cycle = washing_machine['water_consumption_l']
        energy_per_cycle = washing_machine['energy_consumption_kwh']
    
    # Washing costs
    monthly_water_l = water_per_cycle * cycles
    monthly_water_m3 = monthly_water_l / 1000
    monthly_water_cost = monthly_water_m3 * data.water_rate * tariff_multiplier
    
    monthly_washing_kwh = energy_per_cycle * cycles
    
    # Ironing costs
    ironing_percentage = data.ironing_percentage / 100
    kg_to_iron = total_kg * ironing_percentage
    ironing_time_hours = (kg_to_iron * data.ironing_time_per_kg_min) / 60
    
    ironing_kwh_per_hour = 2.0  # default
    if ironing_machine:
        ironing_kwh_per_hour = ironing_machine['energy_consumption_kwh_per_hour']
    
    monthly_ironing_kwh = ironing_time_hours * ironing_kwh_per_hour
    
    # Total electricity
    monthly_electricity_kwh = monthly_washing_kwh + monthly_ironing_kwh
    monthly_electricity_cost = monthly_electricity_kwh * data.electricity_rate * tariff_multiplier
    
    # Chemical costs
    monthly_chemical_cost = 0.0
    for chem in chemicals:
        cost_per_g = chem['package_price'] / chem['package_weight_g']
        monthly_chemical_cost += cost_per_g * chem['usage_per_cycle_g'] * cycles
    
    # Labor costs (estimate: 15 min per cycle for washing + ironing time)
    washing_labor_hours = (cycles * 15) / 60  # 15 min per cycle
    total_labor_hours = washing_labor_hours + ironing_time_hours
    monthly_labor_cost = total_labor_hours * data.labor_rate
    
    # Total costs
    total_monthly_cost = monthly_electricity_cost + monthly_water_cost + monthly_chemical_cost + monthly_labor_cost
    
    # Cost per kg
    cost_per_kg = total_monthly_cost / total_kg if total_kg > 0 else 0
    electricity_cost_per_kg = monthly_electricity_cost / total_kg if total_kg > 0 else 0
    water_cost_per_kg = monthly_water_cost / total_kg if total_kg > 0 else 0
    chemical_cost_per_kg = monthly_chemical_cost / total_kg if total_kg > 0 else 0
    labor_cost_per_kg = monthly_labor_cost / total_kg if total_kg > 0 else 0
    
    cost_per_cycle = total_monthly_cost / cycles if cycles > 0 else 0
    
    return CostBreakdown(
        cost_per_kg=round(cost_per_kg, 4),
        electricity_cost_per_kg=round(electricity_cost_per_kg, 4),
        water_cost_per_kg=round(water_cost_per_kg, 4),
        chemical_cost_per_kg=round(chemical_cost_per_kg, 4),
        labor_cost_per_kg=round(labor_cost_per_kg, 4),
        monthly_electricity_kwh=round(monthly_electricity_kwh, 2),
        monthly_electricity_cost=round(monthly_electricity_cost, 2),
        monthly_water_m3=round(monthly_water_m3, 2),
        monthly_water_cost=round(monthly_water_cost, 2),
        monthly_chemical_cost=round(monthly_chemical_cost, 2),
        monthly_labor_hours=round(total_labor_hours, 2),
        monthly_labor_cost=round(monthly_labor_cost, 2),
        total_monthly_cost=round(total_monthly_cost, 2),
        total_kg_processed=round(total_kg, 2),
        cost_per_cycle=round(cost_per_cycle, 2)
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
