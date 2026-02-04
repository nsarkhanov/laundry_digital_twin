# Backend Calculation Code - For Finance Team

This folder contains the backend cost calculation implementation code extracted from the Laundry Digital Twin project.

## Files Included

### 1. `cost_models.py`
Contains the data models (schemas) for:
- **CostCalculationRequest**: All input parameters needed for cost calculations
- **CostBreakdown**: The complete output structure with all calculated costs and metrics

### 2. `cost_calculator.py`
Contains the **CostCalculatorService** class which implements all the calculation logic:
- Main `calculate()` method that orchestrates all calculations
- Helper methods for retrieving machine and chemical data
- Seasonal multiplier logic
- All cost calculation formulas

## Main Documentation

Please refer to `../FINANCE_CALCULATION_GUIDE.md` for comprehensive documentation including:
- Detailed explanation of all formulas
- Input/output parameters
- Example calculations
- Business logic explanations

## How the Code Works

1. **Input**: The API receives a `CostCalculationRequest` with all configuration parameters
2. **Processing**: The `CostCalculatorService.calculate()` method:
   - Retrieves machine specifications from the database
   - Applies load percentages to calculate effective capacities
   - Calculates consumption (water, electricity) based on cycles
   - Applies seasonal and tariff multipliers
   - Computes chemical costs based on usage rates
   - Calculates labor hours and costs
   - Computes transport costs (fixed or calculated)
   - Derives per-kg and per-cycle metrics
3. **Output**: Returns a `CostBreakdown` object with all calculated metrics

## API Endpoint

**Endpoint**: `POST /calculate-cost`

The calculation service is exposed via a FastAPI endpoint that accepts JSON requests and returns JSON responses.

## Note

These files use Python with:
- **FastAPI** for the web framework
- **Pydantic** for data validation and schemas
- **SQLite** database for storing machine and chemical specifications

## Questions?

For detailed formula explanations and examples, refer to the Finance Calculation Guide document.
