"""
Backend API Tests for Laundry Digital Twin
Run with: pytest test_server.py -v
"""
import pytest
import sys
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from fastapi.testclient import TestClient
from server import app

client = TestClient(app)


class TestHealthCheck:
    """Test basic API health."""
    
    def test_root_endpoint(self):
        response = client.get("/api/")
        assert response.status_code == 200
        assert response.json() == {"message": "Laundry Digital Twin API"}


class TestLocations:
    """Test location CRUD operations."""
    
    def test_create_location(self):
        response = client.post("/api/locations", json={"name": "Test Location"})
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test Location"
        assert "id" in data
        # Cleanup
        client.delete(f"/api/locations/{data['id']}")
    
    def test_get_locations(self):
        response = client.get("/api/locations")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_duplicate_location_fails(self):
        # Create first
        res1 = client.post("/api/locations", json={"name": "Duplicate Test"})
        assert res1.status_code == 200
        loc_id = res1.json()["id"]
        
        # Try duplicate
        res2 = client.post("/api/locations", json={"name": "Duplicate Test"})
        assert res2.status_code == 400
        
        # Cleanup
        client.delete(f"/api/locations/{loc_id}")


class TestWashingMachines:
    """Test washing machine CRUD operations."""
    
    def test_create_washing_machine(self):
        machine = {
            "model": "Test Washer",
            "capacity_kg": 8.0,
            "water_consumption_l": 50.0,
            "energy_consumption_kwh": 1.5,
            "cycle_duration_min": 60
        }
        response = client.post("/api/washing-machines", json=machine)
        assert response.status_code == 200
        data = response.json()
        assert data["model"] == "Test Washer"
        # Cleanup
        client.delete(f"/api/washing-machines/{data['id']}")
    
    def test_get_washing_machines(self):
        response = client.get("/api/washing-machines")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestCostCalculation:
    """Test cost calculation endpoint."""
    
    def test_calculate_cost(self):
        payload = {
            "currency": "EUR",
            "electricity_rate": 0.25,
            "water_rate": 3.5,
            "labor_rate": 12.0,
            "season": "summer",
            "tariff_mode": "standard",
            "cycles_per_month": 200,
            "washing_load_percentage": 80.0,
            "drying_load_percentage": 80.0,
            "ironing_labor_hours": 10.0
        }
        response = client.post("/api/calculate-cost", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "cost_per_kg" in data
        assert "total_monthly_cost" in data
        assert data["total_monthly_cost"] > 0


class TestConfigurations:
    """Test configuration CRUD operations."""
    
    def test_save_configuration(self):
        config = {
            "name": "Test Config",
            "currency": "EUR",
            "electricity_rate": 0.25,
            "water_rate": 3.5,
            "labor_rate": 12.0,
            "season": "summer",
            "tariff_mode": "standard",
            "cycles_per_month": 200
        }
        response = client.post("/api/configurations", json=config)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
    
    def test_get_latest_configuration(self):
        response = client.get("/api/configurations/latest")
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
