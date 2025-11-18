# Escrow Payment Platform

A microservices-based escrow payment platform with buyer, seller, and admin interfaces.

## Architecture

```
User Layer (Buyer PWA, Seller App, Admin Dashboard)
    ↓
API Gateway (Rate Limit + Load Balancing)
    ↓
Core Services (Auth, Business Logic, Payment, Webhook)
    ↓
Event Queue (Async Updates/Notifications)
    ↓
Supporting Services (Notifications, Fraud Engine, Audit Logs)
    ↓
Data Layer (PostgreSQL, Redis, Storage)
```

## Services

- **API Gateway**: Rate limiting and load balancing
- **Auth Service**: Login, OTP, JWT authentication
- **Business Logic Service**: Escrow flow, disputes management
- **Payment Service**: Wallet, cards, transfers
- **Webhook Listener Service**: Async payment confirmation
- **Event Queue**: Redis-based message queue for async operations
- **Notification Service**: WhatsApp, SMS, Email notifications
- **Fraud/Rule Engine**: Blacklist, pattern detection
- **Audit Logs Service**: Immutable audit logging

## Getting Started

### Prerequisites

- Node.js 18+ (check with `node -v`)
- Docker & Docker Compose (optional, for infrastructure)
- PostgreSQL 14+ (via Docker or local installation)
- Redis 7+ (via Docker or local installation)

### Quick Setup

```bash
# Run the setup script (installs all dependencies)
./setup.sh

# Or manually:
npm run install:all
```

### Infrastructure Setup

```bash
# Start PostgreSQL and Redis with Docker Compose
docker-compose up -d postgres redis

# Or use local PostgreSQL/Redis instances
# Update .env file with your connection strings
```

### Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration:
# - Database URLs
# - Redis URL
# - JWT secrets
# - Payment gateway credentials
# - Notification service credentials
```

### Database Migrations

```bash
# Run migrations (creates all tables)
npm run migrate
```

### Development

```bash
# Start all services in development mode
npm run dev

# Or start services and apps separately:
npm run dev:services  # Backend services only
npm run dev:apps      # Frontend apps only

# Start individual service
cd services/auth-service && npm run dev
```

### Production

```bash
# Build all services
npm run build

# Start with Docker Compose
docker-compose up -d
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- Database connections
- Redis connection
- JWT secrets
- Payment gateway credentials
- Notification service credentials

## API Documentation

API documentation available at `/api-docs` when services are running.

