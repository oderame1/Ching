# Architecture Documentation

## Overview

This is a full-stack monorepo escrow platform designed for the Nigerian market. The platform is built with a microservices architecture, ensuring scalability, maintainability, and security.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│                    - Buyer/Seller Portal                     │
│                      - Admin Dashboard                       │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway / Backend                      │
│              - Authentication & Authorization                │
│              - Escrow Management                             │
│              - Payment Processing                            │
└──────┬──────────────────┬──────────────────┬────────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   Webhooks  │   │   Worker    │   │  PostgreSQL │
│  Processor  │   │  (BullMQ)   │   │  Database   │
└─────────────┘   └──────┬──────┘   └─────────────┘
                         │
                         ▼
                   ┌─────────────┐
                   │    Redis    │
                   │   (Queue)   │
                   └─────────────┘
```

## Technology Stack

### Frontend
- **Next.js 14**: React framework with SSR/SSG
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: Component library
- **PWA**: Progressive Web App capabilities

### Backend
- **Node.js + Express**: REST API server
- **Prisma ORM**: Database ORM
- **PostgreSQL**: Primary database
- **Redis**: Caching and message queue
- **BullMQ**: Job queue for background tasks

### Authentication
- **JWT**: Token-based authentication
- **OTP**: One-time password for login (6 digits, 5 min expiry)

### Payment Integration
- **Paystack**: Nigerian payment gateway
- **Monnify**: Alternative payment gateway

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Local development orchestration
- **Nginx**: Reverse proxy in production

## Key Features

1. **Dual Initiation**: Both buyer and seller can initiate escrow
2. **State Machine**: Robust escrow state transitions
3. **Payment Processing**: Multiple payment gateway support
4. **Webhook Verification**: HMAC signature validation
5. **Background Jobs**: Asynchronous processing for notifications and payouts
6. **Audit Trails**: Comprehensive logging of all actions
7. **Mobile-First**: Responsive design with PWA support

## Data Flow

### Escrow Creation Flow
1. User initiates escrow (buyer or seller)
2. Counterparty is notified
3. Escrow state: `pending` → `waiting_for_payment`
4. Buyer pays via payment link
5. Webhook confirms payment
6. Escrow state: `waiting_for_payment` → `paid`
7. Seller marks delivered
8. Escrow state: `paid` → `delivered`
9. Buyer marks received
10. Escrow state: `delivered` → `received`
11. Admin releases funds
12. Escrow state: `received` → `released`

### Payment Flow
1. Buyer initiates payment via frontend
2. Backend creates payment record
3. Payment gateway returns payment URL
4. Buyer completes payment
5. Gateway sends webhook
6. Webhook processor verifies signature
7. Payment status updated
8. Escrow state transitioned
9. Notifications queued

## Security Measures

- JWT-based authentication
- OTP verification (hashed before storage)
- Webhook HMAC signature validation
- Rate limiting on API endpoints
- IP allowlist for admin routes
- Input validation with Zod
- SQL injection protection via Prisma
- XSS protection via Next.js
- HTTPS-only in production

## Scalability Considerations

- Microservices architecture allows independent scaling
- Worker service can scale horizontally
- Redis queue enables distributed processing
- Database connection pooling
- CDN-ready static assets
- Stateless API design

