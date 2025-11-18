# Backend Services Setup Guide

## Quick Start

```bash
# Start all backend services
npm run dev:services

# Or use the script
./start-backend.sh
```

## Prerequisites

### 1. PostgreSQL

**Option A: Local Installation**
```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb escrow_db
psql escrow_db -c "CREATE USER escrow_user WITH PASSWORD 'escrow_password';"
psql escrow_db -c "GRANT ALL PRIVILEGES ON DATABASE escrow_db TO escrow_user;"
```

**Option B: Docker**
```bash
docker run -d \
  --name escrow-postgres \
  -e POSTGRES_USER=escrow_user \
  -e POSTGRES_PASSWORD=escrow_password \
  -e POSTGRES_DB=escrow_db \
  -p 5432:5432 \
  postgres:14-alpine
```

### 2. Redis

**Option A: Local Installation**
```bash
# macOS
brew install redis
brew services start redis

# Or run directly
redis-server
```

**Option B: Docker**
```bash
docker run -d \
  --name escrow-redis \
  -p 6379:6379 \
  redis:7-alpine
```

## Service Ports

| Service | Port | URL |
|---------|------|-----|
| API Gateway | 3000 | http://localhost:3000 |
| Auth Service | 3001 | http://localhost:3001 |
| Business Logic | 3002 | http://localhost:3002 |
| Payment Service | 3003 | http://localhost:3003 |
| Webhook Listener | 3004 | http://localhost:3004 |
| Notification Service | 3005 | http://localhost:3005 |
| Fraud Service | 3006 | http://localhost:3006 |
| Audit Service | 3007 | http://localhost:3007 |

## Environment Configuration

The `.env` file should contain:

```env
DATABASE_URL=postgresql://escrow_user:escrow_password@localhost:5432/escrow_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

## Starting Services

### All Services at Once
```bash
npm run dev:services
```

### Individual Services
```bash
# Auth Service
cd services/auth-service
npm run dev

# Business Logic Service
cd services/business-logic-service
npm run dev

# Payment Service
cd services/payment-service
npm run dev
```

## Health Checks

Once services are running, check their health:

```bash
# API Gateway
curl http://localhost:3000/health

# Auth Service
curl http://localhost:3001/health

# Business Logic Service
curl http://localhost:3002/health

# Payment Service
curl http://localhost:3003/health
```

## Troubleshooting

### Services won't start

1. **Check if ports are in use:**
   ```bash
   lsof -ti:3000,3001,3002,3003
   ```

2. **Check PostgreSQL connection:**
   ```bash
   psql -h localhost -U escrow_user -d escrow_db -c "SELECT 1;"
   ```

3. **Check Redis connection:**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

### Database connection errors

- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in `.env`
- Ensure database exists: `psql -l | grep escrow_db`

### Redis connection errors

- Verify Redis is running: `redis-cli ping`
- Check REDIS_URL in `.env`
- Start Redis if needed: `redis-server` or `brew services start redis`

## Running Migrations

Before starting services, run database migrations:

```bash
npm run migrate
```

This creates all necessary tables in PostgreSQL.

## Development Workflow

1. Start PostgreSQL and Redis
2. Run migrations: `npm run migrate`
3. Start services: `npm run dev:services`
4. Check health endpoints
5. Test API endpoints

## Logs

Each service logs to console. For production, logs are written to files or a logging service.

To see logs for a specific service:
```bash
cd services/auth-service
npm run dev
```

