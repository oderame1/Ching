#!/bin/bash

# Simple script to run the backend

echo "🚀 Starting Backend Server..."
echo ""

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Error: backend/package.json not found"
    echo "   Please run this script from the project root directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Start the backend
echo "🔧 Starting backend on http://localhost:3001..."
echo ""
cd backend && npm run dev
