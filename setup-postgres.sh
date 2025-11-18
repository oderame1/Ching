#!/bin/bash

# PostgreSQL Setup Script for Escrow Platform
# This script sets up PostgreSQL database locally

set -e

echo "🐘 Setting up PostgreSQL Database..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Database configuration
DB_NAME="escrow_db"
DB_USER="escrow_user"
DB_PASSWORD="escrow_password"

# Check if PostgreSQL is installed
echo "📦 Checking PostgreSQL installation..."
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version | awk '{print $3}')
    echo -e "${GREEN}✅ PostgreSQL is installed (version $PSQL_VERSION)${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL not found${NC}"
    echo ""
    echo "Installing PostgreSQL..."
    
    # Check if Homebrew is available
    if command -v brew &> /dev/null; then
        echo "Installing PostgreSQL via Homebrew..."
        brew install postgresql@14
        echo ""
        echo "Adding PostgreSQL to PATH..."
        echo 'export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"' >> ~/.zshrc
        echo 'export PATH="/usr/local/opt/postgresql@14/bin:$PATH"' >> ~/.zshrc
        export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"
        export PATH="/usr/local/opt/postgresql@14/bin:$PATH"
    else
        echo -e "${RED}❌ Homebrew not found. Please install PostgreSQL manually.${NC}"
        echo "Visit: https://www.postgresql.org/download/"
        exit 1
    fi
fi

# Check if PostgreSQL is running
echo ""
echo "🔍 Checking if PostgreSQL is running..."
if pg_isready -h localhost &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL is not running. Starting it...${NC}"
    
    if command -v brew &> /dev/null; then
        # Try to start via Homebrew services
        if brew services list | grep -q "postgresql"; then
            brew services start postgresql@14 || brew services start postgresql
        else
            # Start PostgreSQL manually
            pg_ctl -D /opt/homebrew/var/postgresql@14 start 2>/dev/null || \
            pg_ctl -D /usr/local/var/postgresql@14 start 2>/dev/null || \
            pg_ctl -D ~/Library/Application\ Support/Postgres/var-14 start 2>/dev/null || \
            echo "Please start PostgreSQL manually: brew services start postgresql@14"
        fi
        
        # Wait for PostgreSQL to start
        sleep 3
        
        if pg_isready -h localhost &> /dev/null; then
            echo -e "${GREEN}✅ PostgreSQL started successfully${NC}"
        else
            echo -e "${RED}❌ Failed to start PostgreSQL${NC}"
            echo "Please start it manually:"
            echo "  brew services start postgresql@14"
            exit 1
        fi
    else
        echo -e "${RED}❌ Cannot start PostgreSQL automatically${NC}"
        echo "Please start PostgreSQL manually and run this script again."
        exit 1
    fi
fi

# Create database user
echo ""
echo "👤 Creating database user..."
if psql -h localhost -U postgres -d postgres -tc "SELECT 1 FROM pg_user WHERE usename='$DB_USER'" | grep -q 1; then
    echo -e "${GREEN}✅ User '$DB_USER' already exists${NC}"
else
    # Try to create user (may require password for postgres user)
    if psql -h localhost -U postgres -d postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null; then
        echo -e "${GREEN}✅ User '$DB_USER' created${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not create user automatically${NC}"
        echo "Please run manually:"
        echo "  psql -h localhost -U postgres -d postgres"
        echo "  CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
        echo "  \\q"
        read -p "Press enter after creating the user..."
    fi
fi

# Create database
echo ""
echo "📊 Creating database..."
if psql -h localhost -U postgres -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${GREEN}✅ Database '$DB_NAME' already exists${NC}"
else
    if psql -h localhost -U postgres -d postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null; then
        echo -e "${GREEN}✅ Database '$DB_NAME' created${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not create database automatically${NC}"
        echo "Please run manually:"
        echo "  psql -h localhost -U postgres -d postgres"
        echo "  CREATE DATABASE $DB_NAME OWNER $DB_USER;"
        echo "  \\q"
        read -p "Press enter after creating the database..."
    fi
fi

# Grant privileges
echo ""
echo "🔐 Granting privileges..."
if psql -h localhost -U postgres -d $DB_NAME -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null; then
    echo -e "${GREEN}✅ Privileges granted${NC}"
else
    echo -e "${YELLOW}⚠️  Could not grant privileges automatically${NC}"
fi

# Test connection
echo ""
echo "🧪 Testing database connection..."
if psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT version();" &>/dev/null; then
    echo -e "${GREEN}✅ Database connection successful!${NC}"
    echo ""
    echo "Database Details:"
    echo "  Host: localhost"
    echo "  Port: 5432"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    echo "  Password: $DB_PASSWORD"
    echo ""
    echo "Connection String:"
    echo "  postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo "Please check your PostgreSQL configuration."
    exit 1
fi

echo ""
echo -e "${GREEN}✅ PostgreSQL setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Run migrations: npm run migrate"
echo "2. Start backend services: npm run dev:services"
echo ""

