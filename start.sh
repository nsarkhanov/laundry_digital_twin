#!/bin/bash

# Laundry Digital Twin - Management Script
# Usage: ./start.sh [start|stop|status|restart]

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
PID_FILE="$SCRIPT_DIR/.services.pid"

# Function to show status
status() {
    echo -e "${BLUE}Checking services status...${NC}"
    local backend_running=false
    local frontend_running=false

    # Check for backend (Process or Port 8000)
    if ps aux | grep -v grep | grep -E "uvicorn.*server:app" > /dev/null || lsof -i :8000 > /dev/null; then
        echo -e "${GREEN}✓ Backend is running${NC}"
        backend_running=true
    else
        echo -e "${RED}✗ Backend is NOT running${NC}"
    fi

    # Check for frontend (Process or Port 3000)
    if ps aux | grep -v grep | grep -E "craco.*start|yarn.*start" > /dev/null || lsof -i :3000 > /dev/null; then
        echo -e "${GREEN}✓ Frontend is running${NC}"
        frontend_running=true
    else
        echo -e "${RED}✗ Frontend is NOT running${NC}"
    fi

    if [ "$backend_running" = true ] && [ "$frontend_running" = true ]; then
        return 0
    else
        return 1
    fi
}

# Function to stop services
stop() {
    echo -e "${YELLOW}Stopping all services...${NC}"
    
    # Kill by stored PIDs if exists
    if [ -f "$PID_FILE" ]; then
        while read pid; do
            if ps -p $pid > /dev/null; then
                echo -e "${BLUE}Stopping process $pid...${NC}"
                kill -9 $pid 2>/dev/null
            fi
        done < "$PID_FILE"
        rm "$PID_FILE"
    fi

    # Backup cleanup - kill by name to be sure
    pkill -f "uvicorn server:app" 2>/dev/null
    pkill -f "craco start" 2>/dev/null
    pkill -f "yarn start" 2>/dev/null
    
    echo -e "${GREEN}All services stopped successfully.${NC}"
}

# Function to start services
start() {
    # Check if already running
    if status > /dev/null 2>&1; then
        echo -e "${YELLOW}Services are already running. Use './start.sh restart' if needed.${NC}"
        return
    fi

    echo -e "${BLUE}Starting Laundry Digital Twin services...${NC}"

    # Start Backend
    echo -e "${YELLOW}[1/2] Starting Backend Server...${NC}"
    cd "$BACKEND_DIR"
    if [ -d ".venv" ]; then
        source .venv/bin/activate
    fi
    uvicorn server:app --host 0.0.0.0 --port 8000 --reload > /dev/null 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$PID_FILE"

    # Start Frontend
    echo -e "${YELLOW}[2/2] Starting Frontend Server...${NC}"
    cd "$FRONTEND_DIR"
    yarn start > /dev/null 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID >> "$PID_FILE"

    echo -e "${GREEN}Services started in background.${NC}"
    echo -e "${BLUE}Backend:  http://localhost:8000${NC}"
    echo -e "${BLUE}Frontend: http://localhost:3000${NC}"
    echo -e "${YELLOW}Use './start.sh status' to check health or './start.sh stop' to shutdown.${NC}"
}

# Function to clean database
clean() {
    echo -e "${YELLOW}Cleaning database...${NC}"
    
    # Check if services are running
    if pgrep -f "uvicorn server:app" > /dev/null; then
        echo -e "${RED}Warning: Backend is still running. Stopping it first...${NC}"
        stop
    fi

    local db_file="$BACKEND_DIR/laundry.db"
    
    if [ -f "$db_file" ]; then
        echo -e "${BLUE}Removing $db_file...${NC}"
        rm "$db_file"
        # Also remove SQLite temp files if they exist
        rm "$db_file-shm" 2>/dev/null
        rm "$db_file-wal" 2>/dev/null
        echo -e "${GREEN}✓ Database cleaned.${NC}"
    else
        echo -e "${YELLOW}No database file found to clean.${NC}"
    fi
}

# Handle arguments
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    status)
        status
        ;;
    restart)
        stop
        sleep 2
        start
        ;;
    clean)
        clean
        ;;
    *)
        echo -e "${BLUE}Usage: $0 {start|stop|status|restart|clean}${NC}"
        echo -e "Starting services in interactive mode (current behavior)..."
        
        # Interactive mode logic (Cleanup on Ctrl+C)
        cleanup() {
            echo -e "\n${YELLOW}Shutting down...${NC}"
            stop
            exit 0
        }
        trap cleanup SIGINT SIGTERM
        
        # Start processes and wait
        start
        echo -e "${YELLOW}Running in interactive mode. Press Ctrl+C to stop.${NC}"
        # Tail logs or wait
        wait
        ;;
esac
