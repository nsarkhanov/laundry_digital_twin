# Laundry Digital Twin 🧺

A comprehensive digital twin application for managing and simulating laundry facility operations. This dashboard provides real-time insights into operational costs, resource consumption, and efficiency metrics.

![Laundry Digital Twin Dashboard](laundry_digital_twin_dashboard_final.png)

## 🌟 Features

-   **Dashboard Overview**: Real-time visualization of key metrics including cost per kg, monthly estimates, and resource breakdown.
-   **Smart Configuration**: 
    -   **Tariffs**: Customize electricity, water, and labor rates.
    -   **Environment**: Adjust for seasonal variations and tariff modes (Standard/High/Low).
    -   **Operations**: Set operational volume by weight (kg) and period (Day/Week/Month).
-   **Machine Management**: 
    -   **Washing & Drying**: Configure capacity, energy, and cycle specifications.
    -   **Ironing**: Define ironing operations based on total labor hours to accurately model manual workload and costs.
-   **Chemical Inventory**: Manage varied chemical types (detergents, softeners) with precise usage tracking.
-   **Interactive Layout**: Customizable widgets for focused monitoring of specific facility parameters.

## 🛠️ Tech Stack

-   **Frontend**: React, Tailwind CSS, Lucide React (Icons), Recharts (Data Visualization).
-   **Backend**: FastAPI (Python), SQLite, Pydantic for data validation.
-   **Infrastructure**: Docker-ready (optional), Shell scripts for easy local dev.

## 🚀 Getting Started

### Quick Start
The easiest way to run the application is using the start script:

```bash
./start.sh
```
This will install dependencies (if needed) and launch both backend (port 8000) and frontend (port 3000) services.

### Manual Setup

1.  **Backend Setup**:
    ```bash
    cd backend
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    uvicorn server:app --host 0.0.0.0 --port 8000 --reload
    ```

2.  **Frontend Setup**:
    ```bash
    cd frontend
    npm install
    npm start
    ```

3.  **Access**: Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📸 Configuration

Use the **Modify Settings** button on the dashboard to access the configuration panel. Here you can:
- Add or remove machines.
- Update utility costs (Electricity, Water).
- Set labor rates and shift hours.
