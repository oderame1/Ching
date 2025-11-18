# Quick Setup Guide

## 1. Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

## 2. Installation

```bash
# Clone and install dependencies
git clone <repo>
cd Ching
npm install
```

## 3. Environment Setup

```bash
# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend environment
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your configuration
```

## 4. Database Setup

```bash
# Start PostgreSQL and Redis (Docker)
docker-compose -f infra/docker-compose.yml up -d postgres redis

# Or use local PostgreSQL/Redis

# Generate Prisma Client
cd backend
npm run generate

# Run migrations
npm run migrate:dev
```

## 5. Start Development

```bash
# From root directory - start all services
npm run dev

# Or individually:
npm run dev:frontend    # http://localhost:3000
npm run dev:backend     # http://localhost:3001
npm run dev:worker
npm run dev:webhooks
```

## 6. Access Applications

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Webhooks**: http://localhost:3002
- **Admin Dashboard**: http://localhost:3000/admin

## 7. Test Credentials

Create a user via OTP login:
1. Go to http://localhost:3000/auth
2. Enter phone number (e.g., +2349012345678)
3. Check console/logs for OTP (development mode)
4. Verify OTP to login

## Next Steps

- Read [Architecture Documentation](./docs/architecture.md)
- Check [API Specification](./docs/api-spec.md)
- Review [Deployment Guide](./docs/deployment-guide.md)

