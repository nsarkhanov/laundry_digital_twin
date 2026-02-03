# Production Deployment - Laundry Digital Twin

This directory contains the Docker Compose configuration for production deployment.

## Quick Start

```bash
# From the prod directory
docker compose up --build
```

## Access

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8000

## Services

| Service  | Port | Description |
|----------|------|-------------|
| frontend | 80   | React app served via Nginx |
| backend  | 8000 | FastAPI Python server |

## Data Persistence

SQLite database is persisted via Docker volume mount.

## Environment Variables

Edit `docker-compose.yml` to customize:
- `DATABASE_URL` - Path to SQLite database

## Stopping

```bash
docker compose down
```

## Rebuilding

```bash
docker compose up --build --force-recreate
```
