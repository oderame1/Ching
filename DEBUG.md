# Debugging Guide

## Quick Debug

Run the comprehensive debug script:

```bash
./debug.sh
```

This will check:
- Infrastructure status (Redis, PostgreSQL)
- Service ports and health
- Environment configuration
- Database connections
- Common issues

## Common Issues and Solutions

### 1. Services Not Starting

**Problem**: Services fail to start or crash immediately

**Check:**
```bash
# Check if ports are in use
lsof -ti:3000,3001,3002,3003

# Check service logs
cd services/auth-service
npm run dev
```

**Solutions:**
- Kill processes on ports: `lsof -ti:3000 | xargs kill`
- Check for syntax errors in service code
- Verify dependencies: `npm install`

### 2. Database Connection Errors

**Problem**: `ECONNREFUSED` or `Connection refused`

**Check:**
```bash
# Verify PostgreSQL is running
pg_isready -h localhost

# Check database exists
psql -h localhost -U postgres -l | grep escrow_db
```

**Solutions:**
```bash
# Start PostgreSQL
brew services start postgresql@14

# Create database
createdb escrow_db

# Run migrations
npm run migrate
```

### 3. Redis Connection Errors

**Problem**: `ECONNREFUSED` to Redis

**Check:**
```bash
redis-cli ping
# Should return: PONG
```

**Solutions:**
```bash
# Start Redis
brew services start redis

# Or run directly
redis-server
```

### 4. Port Already in Use

**Problem**: `EADDRINUSE: address already in use`

**Check:**
```bash
# Find process using port
lsof -ti:3000
```

**Solutions:**
```bash
# Kill process on port
lsof -ti:3000 | xargs kill

# Or change port in service .env or code
```

### 5. Module Not Found Errors

**Problem**: `Cannot find module 'xxx'`

**Solutions:**
```bash
# Reinstall dependencies
npm run install:all

# Or for specific service
cd services/auth-service
rm -rf node_modules
npm install
```

### 6. Environment Variables Not Loading

**Problem**: Services can't read environment variables

**Check:**
```bash
# Verify .env exists
ls -la .env

# Check if variables are set
cat .env | grep DATABASE_URL
```

**Solutions:**
```bash
# Create .env from template
cp .env.example .env

# Edit with your values
nano .env
```

### 7. TypeScript Compilation Errors

**Problem**: TypeScript errors preventing build

**Check:**
```bash
cd services/auth-service
npm run build
```

**Solutions:**
```bash
# Check tsconfig.json
cat tsconfig.json

# Fix type errors
# Or disable strict mode temporarily (not recommended)
```

### 8. CORS Errors in Frontend

**Problem**: Frontend can't connect to API

**Check:**
```bash
# Verify API Gateway is running
curl http://localhost:3000/health

# Check browser console for CORS errors
```

**Solutions:**
- Ensure API Gateway is running
- Check CORS configuration in API Gateway
- Verify `VITE_API_URL` in frontend `.env`

### 9. Authentication Errors

**Problem**: JWT token invalid or expired

**Check:**
```bash
# Verify JWT_SECRET is set
grep JWT_SECRET .env

# Check token in browser DevTools > Application > Local Storage
```

**Solutions:**
- Set strong JWT_SECRET in `.env`
- Clear browser storage and re-login
- Check token expiration settings

### 10. Event Queue Not Working

**Problem**: Events not being processed

**Check:**
```bash
# Verify Redis is running
redis-cli ping

# Check Redis keys
redis-cli keys "events:*"
```

**Solutions:**
- Ensure Redis is running
- Check EVENT_QUEUE_URL in .env
- Verify event consumers are running

## Debugging Individual Services

### Auth Service
```bash
cd services/auth-service
npm run dev
# Check console for errors
```

### Business Logic Service
```bash
cd services/business-logic-service
npm run dev
# Test endpoints
curl http://localhost:3002/health
```

### Payment Service
```bash
cd services/payment-service
npm run dev
# Check Stripe configuration
grep STRIPE .env
```

## Database Debugging

### Check Tables
```bash
psql -h localhost -U escrow_user -d escrow_db -c "\dt"
```

### Check Data
```bash
psql -h localhost -U escrow_user -d escrow_db -c "SELECT * FROM users LIMIT 5;"
```

### Reset Database
```bash
# Drop and recreate
dropdb escrow_db
createdb escrow_db
npm run migrate
```

## Redis Debugging

### Check Keys
```bash
redis-cli keys "*"
```

### Monitor Commands
```bash
redis-cli monitor
```

### Clear Cache
```bash
redis-cli FLUSHALL
```

## Network Debugging

### Test API Endpoints
```bash
# Health check
curl http://localhost:3000/health

# With authentication
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/auth/me
```

### Check Service Communication
```bash
# Test service-to-service
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Business Logic
```

## Log Analysis

### View Service Logs
```bash
# All services
npm run dev:services 2>&1 | tee logs.txt

# Specific service
cd services/auth-service
npm run dev 2>&1 | tee auth.log
```

### Common Log Patterns

**Database errors:**
- `ECONNREFUSED` → PostgreSQL not running
- `password authentication failed` → Wrong credentials
- `database does not exist` → Run migrations

**Redis errors:**
- `ECONNREFUSED` → Redis not running
- `NOAUTH` → Redis password required

**Service errors:**
- `EADDRINUSE` → Port conflict
- `MODULE_NOT_FOUND` → Missing dependency
- `TypeError` → Check code logic

## Performance Debugging

### Check Memory Usage
```bash
ps aux | grep node | awk '{print $2, $3, $4, $11}'
```

### Check CPU Usage
```bash
top -pid $(pgrep -f "tsx watch")
```

### Database Query Performance
```bash
# Enable query logging in PostgreSQL
# Check slow queries
```

## Getting Help

1. **Run debug script**: `./debug.sh`
2. **Check logs**: Service console output
3. **Verify infrastructure**: Redis, PostgreSQL
4. **Check environment**: `.env` file
5. **Review documentation**: README.md, BACKEND_SETUP.md

## Debug Checklist

- [ ] Redis is running (`redis-cli ping`)
- [ ] PostgreSQL is running (`pg_isready`)
- [ ] Database exists (`psql -l | grep escrow_db`)
- [ ] .env file exists and configured
- [ ] Dependencies installed (`npm install`)
- [ ] Ports are available (no conflicts)
- [ ] Services can start individually
- [ ] Health endpoints respond
- [ ] Frontend can connect to API
- [ ] No TypeScript errors

