#!/bin/sh

# Simple Debug Script (sh compatible)

echo "🔍 Quick Debug Check"
echo "==================="
echo ""

# Infrastructure
echo "Infrastructure:"
redis-cli ping >/dev/null 2>&1 && echo "  ✅ Redis: Running" || echo "  ❌ Redis: Not Running"
pg_isready -h localhost >/dev/null 2>&1 && echo "  ✅ PostgreSQL: Running" || echo "  ❌ PostgreSQL: Not Running"
echo ""

# Services
echo "Backend Services:"
for port in 3000 3001 3002 3003 3004 3005 3006 3007; do
    if lsof -ti:$port >/dev/null 2>&1; then
        echo "  ✅ Port $port: Active"
    else
        echo "  ❌ Port $port: Not Active"
    fi
done
echo ""

# Frontend
echo "Frontend Apps:"
for port in 5173 5174 5175; do
    if lsof -ti:$port >/dev/null 2>&1; then
        echo "  ✅ Port $port: Active"
    else
        echo "  ❌ Port $port: Not Active"
    fi
done
echo ""

# Environment
echo "Configuration:"
[ -f .env ] && echo "  ✅ .env file exists" || echo "  ❌ .env file missing"
[ -d node_modules ] && echo "  ✅ node_modules exists" || echo "  ❌ node_modules missing"
echo ""

echo "Quick Fixes:"
echo "  1. Start all services: npm run dev:services"
echo "  2. Start infrastructure: brew services start redis postgresql@14"
echo "  3. Run migrations: npm run migrate"
echo ""

