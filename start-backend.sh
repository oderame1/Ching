#!/bin/bash

# Start Backend Services Locally
# This script starts all backend microservices

set -e

echo "🚀 Starting Backend Services..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    # .env should be created by now
fi

# Check PostgreSQL
echo "📊 Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    if psql -h localhost -U escrow_user -d escrow_db -c "SELECT 1;" &>/dev/null 2>&1 || \
       psql -h localhost -U postgres -d postgres -c "SELECT 1;" &>/dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL is accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  PostgreSQL may not be running or credentials need setup${NC}"
        echo "   You may need to:"
        echo "   - Start PostgreSQL: brew services start postgresql (macOS)"
        echo "   - Create database: createdb escrow_db"
        echo "   - Or use Docker: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:14"
    fi
else
    echo -e "${YELLOW}⚠️  PostgreSQL client not found${NC}"
fi

# Check Redis
echo "📊 Checking Redis..."
if redis-cli ping &>/dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is running${NC}"
else
    echo -e "${YELLOW}⚠️  Redis is not running${NC}"
    echo "   Start Redis:"
    echo "   - macOS: brew services start redis"
    echo "   - Or: redis-server"
    echo "   - Or Docker: docker run -d -p 6379:6379 redis:7-alpine"
fi

echo ""
echo "🔧 Starting backend services..."
echo ""

# Start services using npm script
npm run dev:services

