# Escrow Platform - Nigerian Market

A production-level escrow platform built for the Nigerian market with support for Paystack and Flutterwave payment gateways.

## 🏗️ Architecture

This is a monorepo containing:

- **`/frontend`** - Next.js 14 + Tailwind CSS + Shadcn UI + PWA
- **`/backend`** - Node.js + Express + PostgreSQL + Prisma + Zod
- **`/worker`** - BullMQ + Redis (background jobs)
- **`/webhooks`** - Payment gateway webhook processor
- **`/shared`** - Reusable TypeScript types, utils, constants
- **`/tests`** - Unit + Integration + E2E tests
- **`/docs`** - API docs + architecture docs
- **`/infra`** - Docker + docker-compose + production configs

## ✨ Features

### Core Business Logic
- ✅ Buyer or Seller can initiate escrow
- ✅ Complete escrow state machine (pending → paid → delivered → received → released)
- ✅ Auto-cancel expired escrows
- ✅ Support for Paystack and Flutterwave payment gateways
- ✅ Secure webhook processing with HMAC signature verification
- ✅ Background job processing for notifications and payouts

### Security
- ✅ JWT-based authentication
- ✅ OTP login (6 digits, 5 min expiry)
- ✅ Role-based access control (Buyer, Seller, Admin)
- ✅ Zod validation on all inputs
- ✅ SQL injection protection via Prisma
- ✅ XSS protection via Helmet
- ✅ Rate limiting
- ✅ Admin IP allowlist
- ✅ Webhook signature verification

### Frontend
- ✅ Next.js 14 with App Router
- ✅ Tailwind CSS + Shadcn UI components
- ✅ Fully responsive, mobile-first design
- ✅ PWA support (offline mode + installable)
- ✅ Real-time escrow status updates

### Testing
- ✅ Unit tests (Vitest)
- ✅ Integration tests (Vitest + Prisma)
- ✅ E2E tests (Playwright)
- ✅ CI/CD with GitHub Actions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd Ching
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up database**
```bash
# Generate Prisma Client
npm run generate

# Run migrations
npm run migrate:dev
```

5. **Start development servers**
```bash
# Start all services
npm run dev

# Or start individually:
npm run dev:backend
npm run dev:frontend
npm run dev:worker
npm run dev:webhooks
```

### Using Docker

```bash
# Start all services with Docker Compose
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

## 📁 Project Structure

```
.
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/      # Next.js App Router pages
│   │   ├── components/ # React components
│   │   └── lib/      # Utilities
│   └── public/       # Static assets
│
├── backend/          # Express API server
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Express middleware
│   │   ├── services/    # Payment gateway services
│   │   └── utils/       # Utilities
│   └── prisma/       # Prisma schema and migrations
│
├── worker/           # BullMQ background workers
│   └── src/
│       ├── processors/ # Job processors
│       └── utils/      # Utilities
│
├── webhooks/         # Webhook processor service
│   └── src/
│       └── handlers/ # Webhook handlers
│
├── shared/           # Shared TypeScript code
│   └── src/
│       ├── types/    # TypeScript types
│       ├── constants/ # Constants
│       └── utils/    # Utilities
│
├── tests/            # Test files
│   ├── unit/         # Unit tests
│   ├── integration/  # Integration tests
│   └── e2e/          # E2E tests
│
├── docs/             # Documentation
│   ├── api-spec.md
│   ├── architecture.md
│   ├── database-schema.md
│   ├── deployment-guide.md
│   ├── security-model.md
│   ├── testing-guide.md
│   └── faq.md
│
└── infra/            # Infrastructure configs
    ├── docker-compose.yml
    ├── Dockerfile.*
    └── nginx.conf
```

## 📖 API Documentation

See [docs/api-spec.md](./docs/api-spec.md) for complete API documentation.

### Key Endpoints

#### Authentication
- `POST /api/auth/request-otp` - Request OTP
- `POST /api/auth/verify` - Verify OTP and get tokens

#### Escrow
- `POST /api/escrow/initiate` - Create new escrow
- `GET /api/escrow/:id` - Get escrow details
- `POST /api/escrow/:id/cancel` - Cancel escrow
- `POST /api/escrow/:id/delivered` - Mark as delivered (seller)
- `POST /api/escrow/:id/received` - Mark as received (buyer)

#### Payments
- `POST /api/payments/initialize` - Initialize payment
- `GET /api/payments/status/:reference` - Get payment status

#### Webhooks
- `POST /api/webhooks/paystack` - Paystack webhook
- `POST /api/webhooks/monnify` - Monnify webhook

#### Admin
- `GET /api/admin/escrows` - List all escrows
- `GET /api/admin/users` - List all users
- `POST /api/admin/release/:id` - Release escrow funds
- `POST /api/admin/refund/:id` - Refund escrow

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit --workspace=tests

# Run integration tests
npm run test:integration --workspace=tests

# Run E2E tests
npm run test:e2e --workspace=tests

# Run tests in watch mode
npm run test:watch --workspace=tests

# Run with coverage
npm run test:coverage --workspace=tests
```

## 🔧 Development

### Database Migrations

```bash
# Create a new migration
npm run migrate:dev --workspace=backend

# Apply migrations (production)
npm run migrate --workspace=backend
```

### Code Quality

```bash
# Type check
npm run typecheck

# Lint
npm run lint
```

## 🚢 Deployment

See [docs/deployment-guide.md](./docs/deployment-guide.md) for detailed deployment instructions.

### Production Checklist

- [ ] Set all required environment variables
- [ ] Configure payment gateway credentials
- [ ] Set up SSL certificates
- [ ] Configure admin IP allowlist
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Set up CI/CD pipeline
- [ ] Configure rate limiting for production
- [ ] Enable HTTPS-only cookies

## 🔒 Security

See [docs/security-model.md](./docs/security-model.md) for security details.

Key security features:
- JWT authentication with refresh tokens
- OTP-based login
- HMAC webhook signature verification
- SQL injection protection (Prisma)
- XSS protection (Helmet)
- Rate limiting
- Input validation (Zod)
- Role-based access control

## 📚 Documentation

- [API Specification](./docs/api-spec.md)
- [Architecture](./docs/architecture.md)
- [Database Schema](./docs/database-schema.md)
- [Deployment Guide](./docs/deployment-guide.md)
- [Security Model](./docs/security-model.md)
- [Testing Guide](./docs/testing-guide.md)
- [FAQ](./docs/faq.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

[Your License Here]

## 🙋 Support

For questions and support, please open an issue on GitHub.

## 🎯 Roadmap

- [ ] SMS notifications
- [ ] Email notifications
- [ ] WhatsApp Business API integration
- [ ] Mobile apps (React Native)
- [ ] Advanced fraud detection
- [ ] Dispute resolution system
- [ ] Multi-currency support
- [ ] Analytics dashboard
