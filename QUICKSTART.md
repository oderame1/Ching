# Quick Start Guide

## 🚀 Complete Setup in 5 Steps

### Step 1: Install Dependencies
```bash
./setup.sh
# or
npm run install:all
```

### Step 2: Start Infrastructure
```bash
# Using Docker (recommended)
docker-compose up -d postgres redis

# Or use local PostgreSQL/Redis
# Make sure they're running and update .env
```

### Step 3: Configure Environment
```bash
# Copy and edit environment file
cp .env.example .env
# Edit .env with your settings
```

### Step 4: Initialize Database
```bash
# Run migrations to create tables
npm run migrate
```

### Step 5: Start Development
```bash
# Start all services and apps
npm run dev
```

## 📍 Service URLs

Once running, services will be available at:

- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **Business Logic Service**: http://localhost:3002
- **Payment Service**: http://localhost:3003
- **Webhook Listener**: http://localhost:3004
- **Notification Service**: http://localhost:3005
- **Fraud Service**: http://localhost:3006
- **Audit Service**: http://localhost:3007

### Frontend Apps

- **Buyer App**: http://localhost:5173 (Vite default)
- **Seller App**: http://localhost:5174 (if configured)
- **Admin Dashboard**: http://localhost:5175 (if configured)

## 🧪 Test the Platform

### 1. Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@example.com",
    "password": "password123",
    "name": "Test Buyer",
    "role": "buyer"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@example.com",
    "password": "password123"
  }'
```

### 3. Create Escrow (with token from login)
```bash
curl -X POST http://localhost:3000/api/business/escrow \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "seller_id": "seller-uuid-here",
    "amount": 100.00,
    "currency": "USD",
    "description": "Test escrow transaction"
  }'
```

## 🐛 Troubleshooting

### Services won't start
- Check if PostgreSQL and Redis are running
- Verify .env file has correct connection strings
- Check service logs: `docker-compose logs [service-name]`

### Database connection errors
- Ensure PostgreSQL is accessible
- Check DATABASE_URL in .env
- Verify database credentials

### Port conflicts
- Change ports in docker-compose.yml or .env
- Kill processes using ports: `lsof -ti:3000 | xargs kill`

## 📚 Next Steps

1. Read the full [README.md](./README.md)
2. Explore service documentation in each service directory
3. Check API endpoints in service route files
4. Customize frontend apps in `apps/` directory

