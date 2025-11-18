#!/bin/bash

# Comprehensive Debugging Script for Escrow Platform

set -e

# Ensure bash 4+ for associative arrays
if [ "${BASH_VERSION%%.*}" -lt 4 ]; then
    echo "Warning: Bash 4+ required for full functionality"
fi

echo "🔍 Escrow Platform Debugging Tool"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Check Infrastructure
echo -e "${BLUE}📊 Infrastructure Status${NC}"
echo "------------------------"

# Redis
if redis-cli ping &>/dev/null; then
    echo -e "${GREEN}✅ Redis: Running${NC}"
    redis-cli info server | grep redis_version | head -1
else
    echo -e "${RED}❌ Redis: Not Running${NC}"
    echo "   Fix: brew services start redis"
fi

# PostgreSQL
if pg_isready -h localhost &>/dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL: Running${NC}"
    psql --version 2>/dev/null | head -1 || echo "   (version check failed)"
else
    echo -e "${RED}❌ PostgreSQL: Not Running${NC}"
    echo "   Fix: brew services start postgresql@14"
fi

echo ""

# 2. Check Service Ports
echo -e "${BLUE}🔌 Service Ports${NC}"
echo "------------------------"

declare -A SERVICES=(
    ["3000"]="API Gateway"
    ["3001"]="Auth Service"
    ["3002"]="Business Logic"
    ["3003"]="Payment Service"
    ["3004"]="Webhook Listener"
    ["3005"]="Notification Service"
    ["3006"]="Fraud Service"
    ["3007"]="Audit Service"
)

for port in "${!SERVICES[@]}"; do
    if lsof -ti:$port &>/dev/null; then
        echo -e "${GREEN}✅ Port $port: ${SERVICES[$port]} - ACTIVE${NC}"
    else
        echo -e "${RED}❌ Port $port: ${SERVICES[$port]} - NOT ACTIVE${NC}"
    fi
done

echo ""

# 3. Check Frontend Ports
echo -e "${BLUE}🎨 Frontend Ports${NC}"
echo "------------------------"

declare -A APPS=(
    ["5173"]="Buyer App"
    ["5174"]="Seller App"
    ["5175"]="Admin Dashboard"
)

for port in "${!APPS[@]}"; do
    if lsof -ti:$port &>/dev/null; then
        echo -e "${GREEN}✅ Port $port: ${APPS[$port]} - ACTIVE${NC}"
    else
        echo -e "${RED}❌ Port $port: ${APPS[$port]} - NOT ACTIVE${NC}"
    fi
done

echo ""

# 4. Health Checks
echo -e "${BLUE}🏥 Service Health Checks${NC}"
echo "------------------------"

for port in "${!SERVICES[@]}"; do
    if curl -s http://localhost:$port/health 2>/dev/null | grep -q "ok"; then
        echo -e "${GREEN}✅ ${SERVICES[$port]}: HEALTHY${NC}"
    else
        echo -e "${YELLOW}⚠️  ${SERVICES[$port]}: UNHEALTHY or NOT RUNNING${NC}"
    fi
done

echo ""

# 5. Check Environment Variables
echo -e "${BLUE}⚙️  Environment Configuration${NC}"
echo "------------------------"

if [ -f .env ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    
    # Check critical variables
    if grep -q "DATABASE_URL" .env; then
        echo -e "${GREEN}✅ DATABASE_URL configured${NC}"
    else
        echo -e "${RED}❌ DATABASE_URL missing${NC}"
    fi
    
    if grep -q "REDIS_URL" .env; then
        echo -e "${GREEN}✅ REDIS_URL configured${NC}"
    else
        echo -e "${RED}❌ REDIS_URL missing${NC}"
    fi
    
    if grep -q "JWT_SECRET" .env; then
        echo -e "${GREEN}✅ JWT_SECRET configured${NC}"
    else
        echo -e "${YELLOW}⚠️  JWT_SECRET missing (using default)${NC}"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
    echo "   Fix: cp .env.example .env"
fi

echo ""

# 6. Check Database Connection
echo -e "${BLUE}🗄️  Database Connection${NC}"
echo "------------------------"

if pg_isready -h localhost &>/dev/null 2>&1; then
    DB_URL=$(grep DATABASE_URL .env 2>/dev/null | cut -d'=' -f2- || echo "")
    if [ -n "$DB_URL" ]; then
        DB_NAME=$(echo $DB_URL | sed 's/.*\///' | sed 's/\?.*//')
        if psql -h localhost -U postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
            echo -e "${GREEN}✅ Database '$DB_NAME' exists${NC}"
        else
            echo -e "${YELLOW}⚠️  Database '$DB_NAME' not found${NC}"
            echo "   Fix: createdb $DB_NAME"
        fi
    fi
else
    echo -e "${RED}❌ Cannot check database (PostgreSQL not running)${NC}"
fi

echo ""

# 7. Check Node Processes
echo -e "${BLUE}🔄 Node.js Processes${NC}"
echo "------------------------"

NODE_COUNT=$(ps aux | grep -E "(tsx|node.*index|vite)" | grep -v grep | wc -l | tr -d ' ')
echo "Active Node processes: $NODE_COUNT"

if [ "$NODE_COUNT" -gt 0 ]; then
    echo ""
    echo "Running processes:"
    ps aux | grep -E "(tsx|node.*index|vite)" | grep -v grep | awk '{print "  - " $11 " " $12 " " $13 " " $14 " " $15}' | head -10
fi

echo ""

# 8. Check for Common Issues
echo -e "${BLUE}🐛 Common Issues Check${NC}"
echo "------------------------"

# Port conflicts
CONFLICTS=0
for port in 3000 3001 3002 3003 3004 3005 3006 3007 5173 5174 5175; do
    COUNT=$(lsof -ti:$port 2>/dev/null | wc -l | tr -d ' ')
    if [ "$COUNT" -gt 1 ]; then
        echo -e "${YELLOW}⚠️  Port $port: Multiple processes ($COUNT)${NC}"
        CONFLICTS=$((CONFLICTS + 1))
    fi
done

if [ "$CONFLICTS" -eq 0 ]; then
    echo -e "${GREEN}✅ No port conflicts detected${NC}"
fi

# Missing dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found${NC}"
    echo "   Fix: npm install"
fi

# Check service directories
MISSING_SERVICES=0
for service in api-gateway auth-service business-logic-service payment-service webhook-listener-service notification-service fraud-service audit-service; do
    if [ ! -d "services/$service" ]; then
        echo -e "${RED}❌ Service missing: $service${NC}"
        MISSING_SERVICES=$((MISSING_SERVICES + 1))
    fi
done

if [ "$MISSING_SERVICES" -eq 0 ]; then
    echo -e "${GREEN}✅ All services present${NC}"
fi

echo ""

# 9. Quick Fixes
echo -e "${BLUE}🔧 Quick Fixes${NC}"
echo "------------------------"

if ! redis-cli ping &>/dev/null; then
    echo "1. Start Redis: brew services start redis"
fi

if ! pg_isready -h localhost &>/dev/null 2>&1; then
    echo "2. Start PostgreSQL: brew services start postgresql@14"
fi

if [ ! -f .env ]; then
    echo "3. Create .env: cp .env.example .env"
fi

echo ""

# 10. Service Logs Location
echo -e "${BLUE}📝 Service Logs${NC}"
echo "------------------------"
echo "Service logs are output to console when running:"
echo "  npm run dev:services  # Backend services"
echo "  npm run dev:apps      # Frontend apps"
echo ""
echo "To view logs for a specific service:"
echo "  cd services/auth-service && npm run dev"

echo ""
echo "=================================="
echo -e "${GREEN}✅ Debug check complete!${NC}"
echo ""

