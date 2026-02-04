# Laundry Digital Twin - Cost Calculation Guide (Finance Documentation)

## Overview
This document explains the backend cost calculation logic for the Laundry Digital Twin application. It details how the system calculates operational costs for laundry processes including electricity, water, chemicals, labor, and transport.

---

## 1. Input Parameters

### 1.1 Basic Configuration
- **Currency**: The currency used for all cost calculations (e.g., EUR, USD)
- **Electricity Rate**: Cost per kWh (kilowatt-hour)
- **Water Rate**: Cost per m³ (cubic meter)
- **Labor Rate**: Cost per hour of labor
- **Season**: Current season (affects utility costs via multipliers)
- **Cycles Per Month**: Number of washing cycles performed monthly

### 1.2 Machine Load Percentages
- **Washing Load Percentage**: Capacity utilization for washing machines (default: 80%)
- **Drying Load Percentage**: Capacity utilization for drying machines (default: 80%)
- **Ironing Labor Hours**: Hours spent on ironing operations per month

### 1.3 Tariff Multipliers
- **Electricity Tariff Mode**: "standard" or "custom"
- **Electricity Tariff Price**: Multiplier for electricity costs (1.0 = standard)
- **Water Tariff Mode**: "standard" or "custom"
- **Water Tariff Price**: Multiplier for water costs (1.0 = standard)

### 1.4 Transport Settings
- **Transport Enabled**: Whether transport costs should be included
- **Transport Mode**: "fixed" or "calculated"
  - **Fixed Mode**: Uses a fixed monthly transport cost
  - **Calculated Mode**: Calculates based on distance, time, fuel, and labor
- **Transport Fixed Cost**: Fixed monthly cost (if mode is "fixed")
- **Transport Distance (km)**: Distance traveled per month
- **Transport Time (hours)**: Hours spent on transport per month
- **Transport Labor Rate**: Labor cost per hour for transport
- **Transport Fuel Rate**: Fuel cost per kilometer

### 1.5 Equipment IDs
- **Washing Machine ID**: Selected washing machine from database
- **Drying Machine ID**: Selected drying machine from database
- **Ironing Machine ID**: Selected ironing machine from database
- **Chemical IDs**: List of selected chemical products

---

## 2. Seasonal Multipliers

The system applies seasonal adjustments to utility costs:

| Season | Multiplier | Effect |
|--------|-----------|--------|
| Winter | 1.0 | No variation (currently disabled) |
| Summer | 1.0 | No variation (currently disabled) |
| Spring/Fall | 1.0 | Standard costs |

> [!NOTE]
> **Current Configuration**: Seasonal multipliers are currently set to 1.0 (no variation) for all seasons. This is intentional to allow for accurate baseline testing. Once real-world seasonal utility data is collected, these multipliers can be updated in the `cost_calculator.py` file (lines 150 and 152) to reflect actual seasonal cost variations.

**Formula**: `Final Utility Cost = Base Cost × Season Multiplier × Tariff Multiplier`

---

## 3. Calculation Process

### 3.1 Washing Machine Calculations

**Step 1: Calculate per-cycle consumption**
```
Water per cycle (m³) = Machine water consumption (L) ÷ 1000
Energy per cycle (kWh) = Machine energy consumption (kWh)
Effective capacity (kg) = Machine capacity × (Load percentage ÷ 100)
```

**Step 2: Calculate monthly totals**
```
Monthly water (m³) = Water per cycle × Cycles per month
Monthly washing energy (kWh) = Energy per cycle × Cycles per month
Total kg processed = Effective capacity × Cycles per month
```

**Step 3: Calculate washing labor hours**
```
Washing labor hours = (Cycles × Machine cycle duration in minutes) ÷ 60
```

---

### 3.2 Drying Machine Calculations

**Step 1: Calculate effective drying capacity**
```
Effective drying capacity (kg) = Dryer capacity × (Drying load % ÷ 100)
```

**Step 2: Calculate required drying cycles**
```
Drying cycles = Total kg processed ÷ Effective drying capacity
```

**Step 3: Calculate monthly drying energy**
```
Monthly drying energy (kWh) = Dryer energy per cycle × Drying cycles
```

---

### 3.3 Ironing Machine Calculations

**Formula**:
```
Monthly ironing energy (kWh) = Machine energy per hour × Ironing labor hours
```

---

### 3.4 Total Electricity Calculation

**Formula**:
```
Total monthly electricity (kWh) = Washing energy + Drying energy + Ironing energy

Monthly electricity cost = Total monthly electricity × Electricity rate × Season multiplier × Electricity tariff multiplier
```

---

### 3.5 Water Cost Calculation

**Formula**:
```
Monthly water cost = Monthly water (m³) × Water rate × Season multiplier × Water tariff multiplier
```

---

### 3.6 Chemical Cost Calculation

For each chemical product:
```
Cost per cycle = (Package price ÷ Package amount) × Usage per cycle
```

Total monthly chemical cost:
```
Monthly chemical cost = Σ(Cost per cycle for each chemical × Cycles per month)
```

---

### 3.7 Labor Cost Calculation

**Labor hours are calculated based on actual manual work, NOT machine running time.**

#### Manual Labor Components:

**Washing Process (per cycle)**:
- Loading washing machine: 2.5 minutes
- Unloading washing machine (transfer to dryer): 2.5 minutes
- **Total per washing cycle**: 5 minutes

**Drying Process (per drying cycle)**:
- Loading drying machine: 2.5 minutes
- Unloading drying machine (finished laundry): 2.5 minutes
- **Total per drying cycle**: 5 minutes

**Ironing Work**:
- User-specified hours of actual ironing labor

#### Formulas:

```
Washing labor hours = (Washing cycles × 5 minutes) ÷ 60

Drying cycles = Total kg processed ÷ Effective drying capacity
Drying labor hours = (Drying cycles × 5 minutes) ÷ 60

Total monthly labor hours = Washing labor hours + Drying labor hours + Ironing hours
Monthly labor cost = Total monthly labor hours × Labor rate
```

> [!IMPORTANT]
> **Key Difference**: The machine cycle duration (e.g., 90 minutes for washing) is stored for statistical purposes but is NOT used for labor cost calculation. Labor costs are based only on the time workers spend actively loading/unloading machines and ironing.

---

### 3.8 Transport Cost Calculation

**Case 1: Fixed Mode**
```
Monthly transport cost = Transport fixed cost
```

**Case 2: Calculated Mode**
```
Fuel cost = Transport distance (km) × Transport fuel rate (cost/km)
Labor cost = Transport time (hours) × Transport labor rate (cost/hour)
Monthly transport cost = Fuel cost + Labor cost
```

---

## 4. Final Cost Calculations

### 4.1 Total Monthly Cost

**Formula**:
```
Total monthly cost = 
    Monthly electricity cost +
    Monthly water cost +
    Monthly chemical cost +
    Monthly labor cost +
    Monthly transport cost
```

---

### 4.2 Per-Kilogram Costs

All per-kg costs are calculated by dividing the monthly cost by total kg processed:

```
Cost per kg = Total monthly cost ÷ Total kg processed
Electricity cost per kg = Monthly electricity cost ÷ Total kg processed
Water cost per kg = Monthly water cost ÷ Total kg processed
Chemical cost per kg = Monthly chemical cost ÷ Total kg processed
Labor cost per kg = Monthly labor cost ÷ Total kg processed
Transport cost per kg = Monthly transport cost ÷ Total kg processed
```

---

### 4.3 Cost Per Cycle

**Formula**:
```
Cost per cycle = Total monthly cost ÷ Cycles per month
```

---

## 5. Output Data Structure

The system returns the following cost breakdown:

### 5.1 Per-Unit Costs
- `cost_per_kg`: Total cost per kilogram
- `electricity_cost_per_kg`: Electricity cost per kilogram
- `water_cost_per_kg`: Water cost per kilogram
- `chemical_cost_per_kg`: Chemical cost per kilogram
- `labor_cost_per_kg`: Labor cost per kilogram
- `transport_cost_per_kg`: Transport cost per kilogram

### 5.2 Monthly Consumption Metrics
- `monthly_electricity_kwh`: Total electricity consumed (kWh)
- `monthly_water_m3`: Total water consumed (m³)
- `monthly_labor_hours`: Total labor hours
- `monthly_ironing_hours`: Ironing hours specifically

### 5.3 Monthly Cost Breakdown
- `monthly_electricity_cost`: Total electricity cost
- `monthly_water_cost`: Total water cost
- `monthly_chemical_cost`: Total chemical cost
- `monthly_labor_cost`: Total labor cost
- `monthly_transport_cost`: Total transport cost
- `total_monthly_cost`: Sum of all monthly costs

### 5.4 Other Metrics
- `total_kg_processed`: Total kilograms processed monthly
- `cost_per_cycle`: Cost per washing cycle

---

## 6. Precision and Rounding

All monetary values and metrics are rounded for consistency:
- Costs: **2 decimal places**
- Per-kg costs: **4 decimal places**
- Consumption metrics: **2 decimal places**

---

## 7. Data Sources

### 7.1 Machine Specifications (from Database)
**Washing Machines**:
- Water consumption per cycle (liters)
- Energy consumption per cycle (kWh)
- Capacity (kg)
- Cycle duration (minutes)

**Drying Machines**:
- Energy consumption per cycle (kWh)
- Capacity (kg)

**Ironing Machines**:
- Energy consumption per hour (kWh/hour)

### 7.2 Chemical Products (from Database)
- Package price
- Package amount
- Usage per cycle

---

## 8. Example Calculation

### Inputs:
- Cycles per month: **100**
- Washing machine: 8kg capacity, 100L water, 2kWh energy, 90min cycle
- Washing load: **80%** (effective: 6.4kg)
- Electricity rate: **€0.15/kWh**
- Water rate: **€2.50/m³**
- Labor rate: **€15/hour**
- Season: **Winter** (multiplier: 1.15)
- Electricity tariff: **1.0** (standard)
- Water tariff: **1.0** (standard)

### Calculations:

**Water**:
- Per cycle: 100L = 0.1 m³
- Monthly: 0.1 × 100 = **10 m³**
- Cost: 10 × €2.50 × 1.15 × 1.0 = **€28.75**

**Electricity (washing only for simplicity)**:
- Per cycle: 2 kWh
- Monthly: 2 × 100 = **200 kWh**
- Cost: 200 × €0.15 × 1.15 × 1.0 = **€34.50**

**Labor (washing + drying only for simplicity)**:
- Washing labor: (5 min × 100 cycles) / 60 = **8.33 hours**
- Drying labor: (5 min × 100 cycles) / 60 = **8.33 hours**
- Total labor: 8.33 + 8.33 = **16.67 hours**
- Cost: 16.67 × €15 = **€250**

**Total kg processed**:
- 6.4 kg × 100 cycles = **640 kg**

**Cost per kg** (utilities + labor):
- (€28.75 + €34.50 + €250) ÷ 640 = **€0.49/kg**

---

## 9. API Endpoint

**Endpoint**: `POST /calculate-cost`

**Request Body**: JSON with all input parameters (see Section 1)

**Response**: JSON object with complete cost breakdown (see Section 5)

---

## 10. Notes for Finance Team

1. **All costs are calculated on a monthly basis** and then normalized to per-kg or per-cycle metrics.

2. **Seasonal multipliers affect both electricity and water costs**, reflecting real-world utility pricing variations.

3. **Tariff multipliers allow for custom pricing scenarios** beyond standard rates (e.g., peak/off-peak pricing, bulk discounts).

4. **Transport costs can be either fixed or calculated**, providing flexibility for different operational models.

5. **Load percentages account for real-world capacity utilization**, as machines are rarely filled to 100% capacity.

6. **All calculations use actual machine specifications** stored in the database, ensuring accuracy and allowing for easy equipment comparisons.

7. **Chemical costs are calculated per cycle** based on actual usage rates and package economics.

8. **Labor costs include both operational labor** (washing cycles) and **specialty labor** (ironing).

---

## Contact

For questions about the calculation logic, please contact the development team.
