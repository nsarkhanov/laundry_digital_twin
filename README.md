# Laundry Digital Twin 🧺

A comprehensive digital twin application for managing and simulating laundry facility operations. This dashboard provides real-time insights into operational costs, resource consumption, and efficiency metrics.

![Laundry Digital Twin Dashboard](laundry_digital_twin_dashboard_final.png)

## 🌟 Features

-   **Dashboard Overview**: Real-time visualization of key metrics including cost per kg, monthly estimates, and resource breakdown.
-   **Smart Configuration**: 
    -   **Tariffs**: Customize electricity, water, and labor rates.
    -   **Environment**: Adjust for seasonal variations and tariff modes (Standard/High/Low).
    -   **Operations**: Set operational volume by weight (kg) and period (Day/Week/Month).
-   **Machine Management**: Configure specs for Washing, Drying, and Ironing machines, including individual load percentages.
-   **Chemical Inventory**: Manage varied chemical types (detergents, softeners) with precise usage tracking.
-   **Interactive Layout**: Customizable widgets for focused monitoring of specific facility parameters.

## 🛠️ Tech Stack

-   **Frontend**: React, Tailwind CSS, Lucide React (Icons), Recharts (Data Visualization).
-   **Backend**: Python (FastAPI/Flask equivalent), Pydantic for data validation.
-   **State Management**: React Hooks (useState, useEffect, useCallback).

## 🚀 Getting Started

1.  **Backend Setup**:
    ```bash
    cd backend
    source .venv/bin/activate
    uvicorn server:app --host 0.0.0.0 --port 8000 --reload
    ```

2.  **Frontend Setup**:
    ```bash
    cd frontend
    npm install
    npm start
    ```

3.  **Access**: Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📸 Screenshots

The dashboard features a dark-themed, glassmorphism UI designed for clarity and ease of use.
