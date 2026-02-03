#!/bin/bash

# Laundry Digital Twin - Management Script
# Usage: ./start.sh [setup|start|stop|status|restart|dev|clean]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
PID_FILE="$SCRIPT_DIR/.services.pid"

# Function to setup/install all dependencies
setup() {
    echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║     Laundry Digital Twin - Dependency Setup            ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Backend Setup
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}[1/2] Setting up Backend (Python)...${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    cd "$BACKEND_DIR"
    
    # Check if Python3 is installed
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}✗ Python3 is not installed. Please install Python 3.8+ first.${NC}"
        exit 1
    fi
    
    # Create virtual environment if it doesn't exist
    if [ ! -d ".venv" ]; then
        echo -e "${BLUE}  → Creating Python virtual environment...${NC}"
        python3 -m venv .venv
        if [ $? -ne 0 ]; then
            echo -e "${RED}✗ Failed to create virtual environment${NC}"
            exit 1
        fi
        echo -e "${GREEN}  ✓ Virtual environment created${NC}"
    else
        echo -e "${GREEN}  ✓ Virtual environment already exists${NC}"
    fi
    
    # Activate and install dependencies
    echo -e "${BLUE}  → Installing Python dependencies...${NC}"
    source .venv/bin/activate
    pip install --upgrade pip -q
    pip install -r requirements.txt -q
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Failed to install Python dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}  ✓ Backend dependencies installed${NC}"
    deactivate
    
    echo ""
    
    # Frontend Setup
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}[2/2] Setting up Frontend (Node.js)...${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    cd "$FRONTEND_DIR"
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo -e "${RED}✗ Node.js is not installed. Please install Node.js 18+ first.${NC}"
        exit 1
    fi
    
    # Check if yarn is installed
    if ! command -v yarn &> /dev/null; then
        echo -e "${YELLOW}  → Yarn not found, installing globally...${NC}"
        npm install -g yarn
    fi
    
    # Install frontend dependencies
    echo -e "${BLUE}  → Installing Node.js dependencies (this may take a moment)...${NC}"
    yarn install --silent
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}  ✓ Frontend dependencies installed${NC}"
    
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ Setup complete! All dependencies installed.        ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "  ${YELLOW}./start.sh start${NC}   - Start both services"
    echo -e "  ${YELLOW}./start.sh dev${NC}     - Setup + Start (one command)"
    echo ""
}

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
    setup)
        setup
        ;;
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
    dev)
        # Combined: setup + start
        echo -e "${CYAN}Running full development setup...${NC}"
        setup
        echo ""
        start
        ;;
    *)
        echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
        echo -e "${CYAN}║     Laundry Digital Twin - Management Script           ║${NC}"
        echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${BLUE}Usage:${NC} $0 {command}"
        echo ""
        echo -e "${YELLOW}Commands:${NC}"
        echo -e "  ${GREEN}setup${NC}    - Install all dependencies (backend + frontend)"
        echo -e "  ${GREEN}start${NC}    - Start both services"
        echo -e "  ${GREEN}stop${NC}     - Stop all services"
        echo -e "  ${GREEN}status${NC}   - Check service status"
        echo -e "  ${GREEN}restart${NC}  - Restart all services"
        echo -e "  ${GREEN}clean${NC}    - Remove database file"
        echo -e "  ${GREEN}dev${NC}      - Setup + Start (recommended for first run)"
        echo ""
        echo -e "${BLUE}Examples:${NC}"
        echo -e "  ${YELLOW}./start.sh dev${NC}      # First time setup and start"
        echo -e "  ${YELLOW}./start.sh start${NC}    # Start after setup"
        echo -e "  ${YELLOW}./start.sh stop${NC}     # Stop all services"
        echo ""
        ;;
esac
