# Laundry Digital Twin 🧺

A comprehensive digital twin application for managing and simulating laundry facility operations. This dashboard provides real-time insights into operational costs, resource consumption, and efficiency metrics with support for both development and production deployments.

![Laundry Digital Twin Dashboard](laundry_digital_twin_dashboard_final.png)

## 🌟 Features

### Dashboard & Analytics
- **Real-time Cost Monitoring**: Track total operational costs, cost per kg, and monthly estimates
- **Visual Analytics**: Interactive charts for cost breakdown and resource consumption
- **Impact Analysis**: Compare current operations against optimal scenarios
- **Multi-location Support**: Manage multiple facility locations

### Smart Configuration
- **Tariff Management**: 
  - Electricity rates (€/kWh)
  - Water rates (€/m³)
  - Labor rates (€/hour)
  - Seasonal variations with Standard/High/Low tariff modes
- **Operational Parameters**: 
  - Volume settings by weight (kg)
  - Period configurations (Day/Week/Month)
  - Transport costs with distance and time calculations

### Machine Management
- **Washing Machines**: Configure capacity, energy consumption, water usage, and cycle times
- **Drying Machines**: Set capacity, energy specs, and operational parameters
- **Ironing Operations**: Define manual workload based on total labor hours
- **Dynamic CRUD**: Add, edit, or remove machines on-the-fly

### Chemical Inventory
- Multiple chemical types (detergents, softeners, bleach, etc.)
- Usage tracking per kg of laundry
- Cost per unit management

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI, shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Create React App with Craco

### Backend
- **Framework**: FastAPI 0.110
- **Server**: Uvicorn
- **Database**: SQLite
- **Validation**: Pydantic 2.6+
- **Testing**: Pytest
- **Code Quality**: Black, isort, flake8

### DevOps
- **Containerization**: Docker with multi-stage builds
- **Web Server**: Nginx (Alpine) for production
- **Orchestration**: Docker Compose
- **Health Checks**: Automated container health monitoring

## 🚀 Getting Started

Choose your deployment method:

### Option 1: Quick Start (Development)

Use the automated start script for local development:

```bash
./start.sh
```

This will:
1. Check for required dependencies (Node.js, Python, yarn)
2. Install dependencies if needed
3. Start backend on port 8000
4. Start frontend on port 3000

**Access**: http://localhost:3000

To stop:
```bash
./start.sh stop
```

### Option 2: Manual Development Setup

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

**Backend API**: http://localhost:8000/docs

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install  # or npm install

# Start development server
yarn start  # or npm start
```

**Frontend App**: http://localhost:3000

### Option 3: Production Deployment (Docker)

For production environments, use Docker Compose:

```bash
# Navigate to production directory
cd prod

# Build and start services
docker compose up --build -d
```

**Access**: http://localhost

See the [Production Deployment](#-production-deployment-docker) section for detailed configuration.

## 🐳 Production Deployment (Docker)

### Prerequisites

- Docker Engine 20.10+
- Docker Compose v2.0+

### Quick Deploy

```bash
cd prod
docker compose up --build -d
```

### Services

| Service   | Port | Container Name     | Status Monitoring |
|-----------|------|--------------------|-------------------|
| Frontend  | 80   | laundry-frontend   | Healthcheck: `curl http://localhost:80/index.html` |
| Backend   | 8000 | laundry-backend    | Healthcheck: `curl http://localhost:8000/api/health` |

### Health Checks

Both services include automated health monitoring:

```bash
# Check service health
docker ps --filter "name=laundry"

# Expected output:
# laundry-frontend   Up X minutes (healthy)
# laundry-backend    Up X minutes (healthy)
```

### Access Points

- **Dashboard**: http://localhost
- **API Documentation**: http://localhost:8000/docs
- **API Health Check**: http://localhost:8000/api/health
- **API via Proxy**: http://localhost/api/*

### Docker Commands

```bash
# Start services (detached mode)
docker compose up -d

# Start with rebuild
docker compose up --build -d

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f backend
docker compose logs -f frontend

# Check service status
docker compose ps

# Stop services
docker compose down

# Stop and remove volumes
docker compose down -v

# Restart services
docker compose restart

# Scale services (if needed)
docker compose up -d --scale backend=2
```

### Data Persistence

SQLite database is persisted via Docker volumes. Data survives container restarts and rebuilds.

```bash
# Backup database
docker compose exec backend cp /app/laundry.db /app/data/backup_$(date +%Y%m%d).db

# Access database directly
docker compose exec backend sqlite3 /app/laundry.db

# Copy database from container to host
docker cp laundry-backend:/app/laundry.db ./laundry_backup.db
```

### Configuration

#### Environment Variables

Edit `prod/docker-compose.yml` to configure:

| Variable        | Default           | Description                    |
|-----------------|-------------------|--------------------------------|
| DATABASE_URL    | /app/laundry.db   | SQLite database path           |
| ALLOWED_ORIGINS | localhost:80,...  | CORS allowed origins           |

#### Port Configuration

Change exposed ports in `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"   # Change frontend port to 8080
  
  backend:
    ports:
      - "8001:8000" # Change backend port to 8001
```

After changing ports, update `ALLOWED_ORIGINS` accordingly.

### Architecture

```
┌──────────────────────────────────────────────┐
│          Browser (http://localhost)          │
└────────────────────┬─────────────────────────┘
                     │ HTTP
                     ▼
           ┌──────────────────┐
           │  Frontend :80    │
           │  Nginx + React   │
           │  - Static files  │
           │  - SPA routing   │
           │  - API proxy     │
           └────────┬─────────┘
                    │ /api/* → proxy_pass
                    │ http://backend:8000/api/
                    ▼
           ┌──────────────────┐
           │  Backend :8000   │
           │  FastAPI+Uvicorn │
           │  - REST API      │
           │  - Health checks │
           │  - CORS enabled  │
           └────────┬─────────┘
                    │ SQLAlchemy
                    ▼
           ┌──────────────────┐
           │   SQLite DB      │
           │  - Locations     │
           │  - Machines      │
           │  - Configs       │
           │  (Persistent)    │
           └──────────────────┘
```

### Troubleshooting

#### Health Check Failures

If containers show as unhealthy:

```bash
# Check backend health endpoint
curl http://localhost:8000/api/health

# Check frontend access
curl -I http://localhost:80

# View health check logs
docker inspect laundry-backend --format='{{json .State.Health}}' | python3 -m json.tool
docker inspect laundry-frontend --format='{{json .State.Health}}' | python3 -m json.tool
```

#### CORS Issues

If frontend can't connect to backend:

1. Check `ALLOWED_ORIGINS` in `docker-compose.yml`
2. Verify nginx proxy configuration in `frontend/nginx.conf`
3. Check browser console for CORS errors

```bash
# Verify CORS configuration
docker compose exec backend env | grep ALLOWED_ORIGINS
```

#### Database Issues

```bash
# Check if database file exists
docker compose exec backend ls -lh /app/laundry.db

# Verify database integrity
docker compose exec backend sqlite3 /app/laundry.db "PRAGMA integrity_check;"

# Reset database (⚠️ destroys all data)
docker compose down -v
docker compose up --build -d
```

#### Rebuild from Scratch

```bash
# Stop and remove everything
docker compose down -v

# Remove images
docker rmi prod-frontend prod-backend

# Rebuild and start
docker compose up --build -d
```

## 📁 Project Structure

```
laundry_digital_twin/
├── backend/                    # FastAPI Python backend
│   ├── app/                    # Application package
│   │   ├── config.py           # Settings and environment
│   │   ├── database.py         # Database connection
│   │   ├── main.py             # FastAPI app factory
│   │   ├── models/             # Pydantic schemas
│   │   ├── repositories/       # Data access layer
│   │   ├── routes/             # API endpoints
│   │   └── services/           # Business logic
│   ├── Dockerfile              # Production container
│   ├── requirements.txt        # Python dependencies
│   ├── server.py               # Entry point
│   └── laundry.db              # SQLite database
│
├── frontend/                   # React frontend
│   ├── public/                 # Static assets
│   ├── src/                    # Source code
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # Utilities
│   │   ├── App.js              # Main component
│   │   └── index.js            # Entry point
│   ├── Dockerfile              # Multi-stage production build
│   ├── nginx.conf              # Nginx configuration
│   ├── .env                    # Development environment
│   ├── .env.production         # Production environment
│   ├── package.json            # Dependencies
│   └── tailwind.config.js      # Tailwind configuration
│
├── prod/                       # Production deployment
│   ├── docker-compose.yml      # Service orchestration
│   └── README.md               # Deployment guide
│
├── docs/                       # Documentation
├── tests/                      # Test files
├── start.sh                    # Development quick-start script
└── README.md                   # This file
```

## 📸 Configuration

### Via Dashboard

Click the **"Modify Settings"** button to access the configuration panel:

1. **Tariffs Tab**: Set electricity, water, and labor rates
2. **Environment Tab**: Configure seasonal variations and tariff modes
3. **Operations Tab**: Define operational volume and period
4. **Machines Tab**: Add/edit/remove washing, drying, and ironing machines
5. **Chemicals Tab**: Manage chemical inventory and costs
6. **Transport Tab**: Configure transport costs and distance

All changes are persisted to the SQLite database.

### Via API

Direct API access for automation:

```bash
# Get current configuration
curl http://localhost:8000/api/configurations/latest

# Create new configuration
curl -X POST http://localhost:8000/api/configurations \
  -H "Content-Type: application/json" \
  -d '{"electricity_rate": 0.25, "water_rate": 3.5, ...}'

# Add new location
curl -X POST http://localhost:8000/api/locations \
  -H "Content-Type: application/json" \
  -d '{"name": "New Branch"}'
```

See full API documentation at http://localhost:8000/docs

## 🧪 Testing

### Backend Tests

```bash
cd backend
source .venv/bin/activate
pytest
pytest --cov=app  # With coverage
```

### Frontend Tests

```bash
cd frontend
yarn test  # or npm test
```

## 🔧 Development

### Code Quality

Backend includes configured linting and formatting:

```bash
cd backend
source .venv/bin/activate

# Format code
black app/
isort app/

# Lint
flake8 app/
```

### Database Migrations

Currently using SQLite with direct schema management. For schema changes:

1. Update database initialization in `backend/app/database.py`
2. Back up existing database
3. Test schema changes in development
4. Deploy to production

## 📊 Monitoring

### Logs

Development:
```bash
# Backend logs in terminal
# Frontend logs in browser console
```

Production:
```bash
# View all logs
docker compose logs -f

# Filter by service
docker compose logs -f backend | grep ERROR
docker compose logs -f frontend | grep -i error
```

### Metrics

Access Prometheus-compatible metrics (if enabled):
- Backend: `/metrics` endpoint
- Container metrics: `docker stats`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review logs: `docker compose logs -f`
- Open an issue on GitHub

## 🎯 Roadmap

- [ ] PostgreSQL support for larger deployments
- [ ] Real-time monitoring dashboard
- [ ] Multi-user authentication and authorization
- [ ] Advanced analytics and reporting
- [ ] Mobile app
- [ ] Cloud deployment templates (AWS, Azure, GCP)
- [ ] Kubernetes deployment manifests

---

**Built with ❤️ for efficient laundry facility management**
