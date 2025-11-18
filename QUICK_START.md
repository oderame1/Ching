# Quick Start Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

## Setup in 5 Minutes

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret
- `REFRESH_TOKEN_SECRET` - Refresh token secret
- `OTP_SECRET` - OTP hashing secret
- Payment gateway credentials (Paystack/Monnify)

### 3. Setup Database

```bash
# Generate Prisma Client
npm run generate

# Run migrations
npm run migrate:dev
```

### 4. Start Services

**Option A: Docker (Recommended)**
```bash
npm run docker:up
```

**Option B: Local Development**
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend

# Terminal 3: Worker
npm run dev:worker

# Terminal 4: Webhooks
npm run dev:webhooks
```

### 5. Access the Platform

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Webhooks**: http://localhost:3002
- **Admin Dashboard**: http://localhost:3000/admin

## Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit --workspace=tests

# Run E2E tests
npm run test:e2e --workspace=tests
```

## Next Steps

1. Read the [API Documentation](./docs/api-spec.md)
2. Review [Architecture](./docs/architecture.md)
3. Check [Security Model](./docs/security-model.md)
4. See [Deployment Guide](./docs/deployment-guide.md)

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Verify database exists: `CREATE DATABASE escrow_db;`

### Redis Connection Error
- Ensure Redis is running: `redis-cli ping`
- Check `REDIS_URL` in `.env`

### Port Already in Use
- Change ports in `.env` or `package.json`
- Kill existing processes on those ports

## Getting Help

- Check [FAQ](./docs/faq.md)
- Review [Documentation](./docs/)
- Open an issue on GitHub
