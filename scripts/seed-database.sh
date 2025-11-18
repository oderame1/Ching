#!/bin/bash

# Database Seeding Script
# Seeds the database with dummy buyers, sellers, and admins

set -e

echo "🌱 Seeding Database..."
echo ""

# Check if TypeScript is available
if ! command -v tsx &> /dev/null && ! command -v ts-node &> /dev/null; then
    echo "Installing tsx for running TypeScript..."
    npm install -g tsx
fi

# Run the seed script
if command -v tsx &> /dev/null; then
    echo "Running seed script with tsx..."
    tsx scripts/seed-database.ts
elif command -v ts-node &> /dev/null; then
    echo "Running seed script with ts-node..."
    ts-node scripts/seed-database.ts
else
    echo "❌ TypeScript runner not found. Please install tsx: npm install -g tsx"
    exit 1
fi

