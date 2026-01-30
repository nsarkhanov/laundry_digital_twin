#!/bin/bash

# Laundry Digital Twin - Startup Script
# This script starts the backend server first, then the frontend

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "${BLUE}Stopping backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo -e "${BLUE}Stopping frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Laundry Digital Twin - Startup${NC}"
echo -e "${BLUE}========================================${NC}"

# Start Backend
echo -e "\n${YELLOW}[1/2] Starting Backend Server...${NC}"

if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}Error: Backend directory not found at $BACKEND_DIR${NC}"
    exit 1
fi

cd "$BACKEND_DIR"

# Check if virtual environment exists and activate it
if [ -d ".venv" ]; then
    echo -e "${BLUE}Activating virtual environment...${NC}"
    source .venv/bin/activate
else
    echo -e "${YELLOW}Warning: No virtual environment found. Using system Python.${NC}"
fi

# Start the backend server with uvicorn in the background
echo -e "${BLUE}Starting FastAPI server with uvicorn...${NC}"
uvicorn server:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait for the backend to start
echo -e "${BLUE}Waiting for backend to initialize...${NC}"
sleep 5

# Check if backend is running by testing the API
if curl -s http://localhost:8000/api/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend started successfully (PID: $BACKEND_PID)${NC}"
    echo -e "${GREEN}  Backend URL: http://localhost:8000${NC}"
else
    # Check if process is still running even if curl failed
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend process started (PID: $BACKEND_PID)${NC}"
        echo -e "${YELLOW}  Note: API health check pending, server may still be initializing${NC}"
        echo -e "${GREEN}  Backend URL: http://localhost:8000${NC}"
    else
        echo -e "${RED}✗ Backend failed to start${NC}"
        echo -e "${YELLOW}Attempting to show error...${NC}"
        # Try to run once more to see the error
        uvicorn server:app --host 0.0.0.0 --port 8000 2>&1 | head -20
        exit 1
    fi
fi

# Start Frontend
echo -e "\n${YELLOW}[2/2] Starting Frontend Server...${NC}"

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}Error: Frontend directory not found at $FRONTEND_DIR${NC}"
    cleanup
    exit 1
fi

cd "$FRONTEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    yarn install
fi

# Start the frontend server
echo -e "${BLUE}Starting React development server...${NC}"
yarn start &
FRONTEND_PID=$!

# Wait a moment for the frontend to start
sleep 5

# Check if frontend is running
if ps -p $FRONTEND_PID > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend started successfully (PID: $FRONTEND_PID)${NC}"
    echo -e "${GREEN}  Frontend URL: http://localhost:3000${NC}"
else
    echo -e "${RED}✗ Frontend failed to start${NC}"
    cleanup
    exit 1
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}   All services are running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${BLUE}Backend:  http://localhost:8000${NC}"
echo -e "${BLUE}Frontend: http://localhost:3000${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Wait for both processes
wait
