# How to Run the Backend

## Quick Start

### Option 1: From Root Directory (Recommended)
```bash
npm run dev:backend
```

### Option 2: From Backend Directory
```bash
cd backend
npm run dev
```

### Option 3: Using the Script
```bash
./start-backend.sh
```

## Prerequisites

Before running the backend, make sure:

1. **PostgreSQL is running**
   ```bash
   # Check if PostgreSQL is running
   pg_isready
   
   # If not running, start it (macOS)
   brew services start postgresql@14
   ```

2. **Redis is running** (optional, but recommended)
   ```bash
   # Check if Redis is running
   redis-cli ping
   
   # If not running, start it (macOS)
   brew services start redis
   ```

3. **Environment variables are set**
   - Make sure `.env` file exists in the root directory
   - Required variables:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `REFRESH_TOKEN_SECRET`
     - `OTP_SECRET`

4. **Database is migrated**
   ```bash
   npm run migrate:dev
   ```

## Backend Server

Once started, the backend will run on:
- **URL**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## Verify It's Running

```bash
# Check health endpoint
curl http://localhost:3001/health

# Should return: {"status":"ok","timestamp":"..."}
```

## Stop the Backend

Press `Ctrl + C` in the terminal where the backend is running.



