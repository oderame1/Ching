#!/bin/bash

# Redis Setup Script for Escrow Platform
# This script sets up Redis cache locally

set -e

echo "🔴 Setting up Redis Cache..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Redis is installed
echo "📦 Checking Redis installation..."
if command -v redis-server &> /dev/null; then
    REDIS_VERSION=$(redis-server --version | awk '{print $3}' | cut -d'=' -f2)
    echo -e "${GREEN}✅ Redis is installed (version $REDIS_VERSION)${NC}"
else
    echo -e "${YELLOW}⚠️  Redis not found${NC}"
    echo ""
    echo "Installing Redis..."
    
    # Check if Homebrew is available
    if command -v brew &> /dev/null; then
        echo "Installing Redis via Homebrew..."
        brew install redis
        echo ""
        echo -e "${GREEN}✅ Redis installed successfully${NC}"
    else
        echo -e "${RED}❌ Homebrew not found. Please install Redis manually.${NC}"
        echo "Visit: https://redis.io/download"
        exit 1
    fi
fi

# Check if Redis is running
echo ""
echo "🔍 Checking if Redis is running..."
if redis-cli ping &> /dev/null; then
    echo -e "${GREEN}✅ Redis is already running${NC}"
    echo ""
    echo "Redis Details:"
    echo "  Host: localhost"
    echo "  Port: 6379"
    echo "  URL: redis://localhost:6379"
    echo ""
    echo "Testing connection..."
    redis-cli ping
    echo ""
    echo -e "${GREEN}✅ Redis setup complete!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Redis is not running. Starting it...${NC}"
fi

# Start Redis
if command -v brew &> /dev/null; then
    # Try to start via Homebrew services
    if brew services list | grep -q "redis"; then
        echo "Starting Redis via Homebrew services..."
        brew services start redis
    else
        # Start Redis manually
        echo "Starting Redis server..."
        redis-server --daemonize yes 2>/dev/null || \
        /opt/homebrew/opt/redis/bin/redis-server --daemonize yes 2>/dev/null || \
        /usr/local/opt/redis/bin/redis-server --daemonize yes 2>/dev/null || \
        echo "Please start Redis manually: brew services start redis"
    fi
    
    # Wait for Redis to start
    echo "Waiting for Redis to start..."
    sleep 2
    
    # Test connection
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✅ Redis started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start Redis${NC}"
        echo "Please start it manually:"
        echo "  brew services start redis"
        echo "  or"
        echo "  redis-server"
        exit 1
    fi
else
    echo -e "${RED}❌ Cannot start Redis automatically${NC}"
    echo "Please start Redis manually:"
    echo "  redis-server"
    exit 1
fi

# Display Redis information
echo ""
echo "📊 Redis Information:"
echo "  Host: localhost"
echo "  Port: 6379"
echo "  URL: redis://localhost:6379"
echo ""

# Test Redis operations
echo "🧪 Testing Redis operations..."
redis-cli set test_key "test_value" > /dev/null
if redis-cli get test_key | grep -q "test_value"; then
    echo -e "${GREEN}✅ Redis read/write test successful${NC}"
    redis-cli del test_key > /dev/null
else
    echo -e "${YELLOW}⚠️  Redis read/write test failed${NC}"
fi

# Show Redis info
echo ""
echo "📈 Redis Server Info:"
redis-cli info server | grep -E "(redis_version|os|process_id)" | head -3

echo ""
echo -e "${GREEN}✅ Redis setup complete!${NC}"
echo ""
echo "Redis is ready to use with:"
echo "  - Caching"
echo "  - Session storage"
echo "  - Event queue"
echo "  - Rate limiting"
echo ""
echo "Connection string for .env:"
echo "  REDIS_URL=redis://localhost:6379"
echo ""

