#!/bin/bash

echo "🚀 Setting up Escrow Payment Platform..."

# Check Node.js version
echo "📦 Checking Node.js version..."
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install service dependencies
echo "📦 Installing service dependencies..."
cd services
for dir in */; do
    echo "  Installing dependencies for $dir..."
    cd "$dir" && npm install && cd ..
done
cd ..

# Install app dependencies
echo "📦 Installing app dependencies..."
cd apps
for dir in */; do
    echo "  Installing dependencies for $dir..."
    cd "$dir" && npm install && cd ..
done
cd ..

# Check Docker
echo "🐳 Checking Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
        echo "✅ Docker Compose is available"
        echo "📝 To start infrastructure services, run: docker-compose up -d postgres redis"
    else
        echo "⚠️  Docker Compose not found"
    fi
else
    echo "⚠️  Docker not found. Install Docker to run infrastructure services."
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please update it with your configuration."
    else
        echo "⚠️  .env.example not found"
    fi
else
    echo "✅ .env file already exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Start infrastructure: docker-compose up -d postgres redis"
echo "3. Run migrations: npm run migrate"
echo "4. Start development: npm run dev"
echo ""

