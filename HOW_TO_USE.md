# How to Use the Escrow Payment Platform

A comprehensive guide to using the Nigerian Escrow Platform - from setup to advanced workflows.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Platform Access](#platform-access)
3. [User Workflows](#user-workflows)
4. [API Usage](#api-usage)
5. [Complete Examples](#complete-examples)
6. [Testing & Debugging](#testing--debugging)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 15+ (running locally or via Docker)
- Redis 7+ (running locally or via Docker)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Minimum required:
# - DATABASE_URL
# - REDIS_URL
# - JWT_SECRET
# - REFRESH_TOKEN_SECRET
```

### Step 3: Setup Database

```bash
# Generate Prisma Client
npm run generate

# Run database migrations
npm run migrate:dev

# (Optional) Seed test data
npm run seed
```

### Step 4: Start Infrastructure

**Option A: Using Docker (Recommended)**
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Or use the setup scripts
./setup-postgres.sh
./setup-redis.sh
```

**Option B: Local Services**
```bash
# macOS with Homebrew
brew services start postgresql@14 redis

# Verify services are running
redis-cli ping  # Should return: PONG
pg_isready     # Should return: accepting connections
```

### Step 5: Start Development Servers

**Start All Services:**
```bash
npm run dev
```

**Or Start Individually:**
```bash
# Terminal 1: Backend API
npm run dev:backend

# Terminal 2: Frontend (Next.js)
npm run dev:frontend

# Terminal 3: Worker (Background Jobs)
npm run dev:worker

# Terminal 4: Webhooks Service
npm run dev:webhooks
```

---

## 🌐 Platform Access

### Frontend Applications

| Application | URL | Description |
|------------|-----|-------------|
| **Main Frontend** | http://localhost:3000 | Next.js app with all features |
| **Buyer App** | http://localhost:5173 | Dedicated buyer interface |
| **Seller App** | http://localhost:5174 | Dedicated seller interface |
| **Admin Dashboard** | http://localhost:5175 | Admin management interface |

### Backend Services

| Service | URL | Description |
|---------|-----|-------------|
| **Backend API** | http://localhost:3001 | Main API server |
| **Health Check** | http://localhost:3001/health | Service health status |

### Test Credentials

See [SEED_DATA.md](./SEED_DATA.md) for all test users.

**Quick Login:**
- **Buyer**: `buyer1@test.escrow` / `password123`
- **Seller**: `seller1@test.escrow` / `password123`
- **Admin**: `admin@test.escrow` / `admin123`

---

## 👥 User Workflows

### 🔵 As a Buyer

#### 1. Login
- Go to: http://localhost:3000 (or http://localhost:5173 for buyer app)
- Enter email: `buyer1@test.escrow`
- Enter password: `password123`
- You'll be redirected to the buyer dashboard

#### 2. Create an Escrow Transaction

**Via Frontend:**
1. Click "Create Escrow" button
2. Enter seller email: `seller1@test.escrow`
3. Enter amount: `100.00`
4. Select currency: `NGN` (or USD)
5. Add description (optional): "Payment for web design services"
6. Click "Create Escrow"
7. You'll receive a confirmation with escrow ID

**Via API:**
```bash
# Get your auth token first (see API Usage section)
curl -X POST http://localhost:3001/api/escrow/initiate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "counterpartyEmail": "seller1@test.escrow",
    "amount": 100.00,
    "currency": "NGN",
    "description": "Payment for services"
  }'
```

#### 3. Pay for the Escrow

**Via Frontend:**
1. Go to your dashboard
2. Click on the escrow you created
3. Click "Pay Now" or "Initialize Payment"
4. Select payment gateway: Paystack or Monnify
5. Complete payment on the gateway's page
6. You'll be redirected back after successful payment

**Via API:**
```bash
curl -X POST http://localhost:3001/api/payments/initialize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "escrowId": "escrow-uuid",
    "gateway": "paystack"
  }'
```

#### 4. Mark as Received (After Seller Delivers)

**Via Frontend:**
1. Go to escrow details
2. Click "Mark as Received"
3. Confirm the action
4. Funds will be released to seller automatically

**Via API:**
```bash
curl -X POST http://localhost:3001/api/escrow/ESCROW_ID/received \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 5. Cancel Escrow (If Needed)

**Via Frontend:**
1. Go to escrow details
2. Click "Cancel Escrow"
3. Confirm cancellation
4. Funds will be refunded to your wallet

**Via API:**
```bash
curl -X POST http://localhost:3001/api/escrow/ESCROW_ID/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 🟢 As a Seller

#### 1. Login
- Go to: http://localhost:3000 (or http://localhost:5174 for seller app)
- Enter email: `seller1@test.escrow`
- Enter password: `password123`
- You'll be redirected to the seller dashboard

#### 2. View Escrows
- See all escrows assigned to you
- Track status: `pending`, `waiting_for_payment`, `paid`, `delivered`, `received`, `released`
- View buyer details and transaction amount
- Filter by status or date

#### 3. Mark as Delivered

**Via Frontend:**
1. Go to escrow details
2. Click "Mark as Delivered"
3. Add delivery notes (optional)
4. Confirm delivery
5. Buyer will be notified

**Via API:**
```bash
curl -X POST http://localhost:3001/api/escrow/ESCROW_ID/delivered \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deliveryNotes": "Item shipped via DHL, tracking: ABC123"
  }'
```

#### 4. Track Transactions
- Monitor escrow status in real-time
- See when buyer releases funds
- View transaction history
- Export transaction reports

### 🔴 As an Admin

#### 1. Login
- Go to: http://localhost:3000/admin (or http://localhost:5175 for admin dashboard)
- Enter email: `admin@test.escrow`
- Enter password: `admin123`
- You'll be redirected to the admin dashboard

#### 2. View System Statistics
- Total escrows
- Active escrows
- Total transactions
- Total disputes
- System health metrics

#### 3. Manage Escrows

**View All Escrows:**
```bash
curl -X GET http://localhost:3001/api/admin/escrows \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Release Escrow Funds:**
```bash
curl -X POST http://localhost:3001/api/admin/release/ESCROW_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Refund Escrow:**
```bash
curl -X POST http://localhost:3001/api/admin/refund/ESCROW_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Buyer requested refund"
  }'
```

#### 4. View Users
```bash
curl -X GET http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

#### 5. View Audit Logs
```bash
curl -X GET http://localhost:3001/api/admin/audit-logs \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🔌 API Usage

### Base URL

All API requests should be made to:
```
http://localhost:3001
```

### Authentication

The platform uses **OTP-based authentication** for security.

#### Step 1: Request OTP

```bash
curl -X POST http://localhost:3001/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer1@test.escrow"
  }'
```

**Response:**
```json
{
  "message": "OTP sent to your email",
  "expiresIn": 300
}
```

#### Step 2: Verify OTP

```bash
curl -X POST http://localhost:3001/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer1@test.escrow",
    "otp": "123456"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "buyer1@test.escrow",
    "name": "John Buyer",
    "role": "buyer"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Step 3: Use Token in Requests

```bash
# Save token from verify response
TOKEN="your-access-token-here"

# Use in subsequent requests
curl -X GET http://localhost:3001/api/escrow/ESCROW_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Escrow Endpoints

#### Create Escrow (Initiate)

```bash
curl -X POST http://localhost:3001/api/escrow/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "counterpartyEmail": "seller1@test.escrow",
    "amount": 100.00,
    "currency": "NGN",
    "description": "Payment for web design",
    "expiresInDays": 7
  }'
```

**Response:**
```json
{
  "id": "escrow-uuid",
  "buyerId": "buyer-uuid",
  "sellerId": "seller-uuid",
  "amount": 100.00,
  "currency": "NGN",
  "status": "pending",
  "initiatedBy": "buyer",
  "expiresAt": "2024-01-15T10:00:00Z",
  "createdAt": "2024-01-08T10:00:00Z"
}
```

#### Get Escrow Details

```bash
curl -X GET http://localhost:3001/api/escrow/ESCROW_ID \
  -H "Authorization: Bearer $TOKEN"
```

#### Cancel Escrow

```bash
curl -X POST http://localhost:3001/api/escrow/ESCROW_ID/cancel \
  -H "Authorization: Bearer $TOKEN"
```

#### Mark as Delivered (Seller)

```bash
curl -X POST http://localhost:3001/api/escrow/ESCROW_ID/delivered \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deliveryNotes": "Item delivered successfully"
  }'
```

#### Mark as Received (Buyer)

```bash
curl -X POST http://localhost:3001/api/escrow/ESCROW_ID/received \
  -H "Authorization: Bearer $TOKEN"
```

### Payment Endpoints

#### Initialize Payment

```bash
curl -X POST http://localhost:3001/api/payments/initialize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "escrowId": "escrow-uuid",
    "gateway": "paystack"
  }'
```

**Response:**
```json
{
  "authorizationUrl": "https://paystack.com/pay/...",
  "reference": "TXN_123456789",
  "accessCode": "ACCESS_CODE"
}
```

#### Get Payment Status

```bash
curl -X GET http://localhost:3001/api/payments/status/REFERENCE \
  -H "Authorization: Bearer $TOKEN"
```

### Admin Endpoints

All admin endpoints require:
- Valid JWT token
- Admin role
- IP address in allowlist (if configured)

#### Get All Escrows

```bash
curl -X GET http://localhost:3001/api/admin/escrows \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Get All Users

```bash
curl -X GET http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Release Escrow

```bash
curl -X POST http://localhost:3001/api/admin/release/ESCROW_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Refund Escrow

```bash
curl -X POST http://localhost:3001/api/admin/refund/ESCROW_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Dispute resolved in favor of buyer"
  }'
```

#### Get Audit Logs

```bash
curl -X GET http://localhost:3001/api/admin/audit-logs \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Webhook Endpoints

#### Paystack Webhook

```bash
# This endpoint is called by Paystack
POST http://localhost:3001/api/webhooks/paystack
```

#### Monnify Webhook

```bash
# This endpoint is called by Monnify
POST http://localhost:3001/api/webhooks/monnify
```

---

## 📝 Complete Examples

### Example 1: Complete Escrow Flow (Buyer-Initiated)

```bash
# 1. Request OTP
curl -X POST http://localhost:3001/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "buyer1@test.escrow"}'

# 2. Verify OTP (save the token)
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "buyer1@test.escrow", "otp": "123456"}' \
  | jq -r '.accessToken')

# 3. Create Escrow
ESCROW_ID=$(curl -s -X POST http://localhost:3001/api/escrow/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "counterpartyEmail": "seller1@test.escrow",
    "amount": 100.00,
    "currency": "NGN",
    "description": "Payment for services"
  }' | jq -r '.id')

echo "Escrow created: $ESCROW_ID"

# 4. Initialize Payment
PAYMENT=$(curl -s -X POST http://localhost:3001/api/payments/initialize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"escrowId\": \"$ESCROW_ID\", \"gateway\": \"paystack\"}")

echo "Payment URL: $(echo $PAYMENT | jq -r '.authorizationUrl')"

# 5. After payment is confirmed (via webhook), seller marks delivered
# (Seller would use their own token)
SELLER_TOKEN="seller-token-here"
curl -X POST http://localhost:3001/api/escrow/$ESCROW_ID/delivered \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deliveryNotes": "Item delivered"}'

# 6. Buyer marks as received
curl -X POST http://localhost:3001/api/escrow/$ESCROW_ID/received \
  -H "Authorization: Bearer $TOKEN"

# 7. Funds are automatically released to seller
```

### Example 2: Seller-Initiated Escrow

```bash
# 1. Seller requests OTP and verifies
SELLER_TOKEN="seller-token-here"

# 2. Seller initiates escrow
ESCROW_ID=$(curl -s -X POST http://localhost:3001/api/escrow/initiate \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "counterpartyEmail": "buyer1@test.escrow",
    "amount": 200.00,
    "currency": "NGN",
    "description": "Payment for product"
  }' | jq -r '.id')

# 3. Buyer pays (buyer would use their token)
BUYER_TOKEN="buyer-token-here"
curl -X POST http://localhost:3001/api/payments/initialize \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"escrowId\": \"$ESCROW_ID\", \"gateway\": \"paystack\"}"

# Rest of the flow is the same...
```

---

## 🧪 Testing & Debugging

### Check Service Health

```bash
# Backend health check
curl http://localhost:3001/health

# Should return:
# {"status":"ok","timestamp":"2024-01-08T10:00:00.000Z"}
```

### View Database Data

```bash
# Connect to database
psql "postgresql://escrow_user:escrow_password@localhost:5432/escrow_db"

# View users
SELECT email, name, role FROM users WHERE email LIKE '%@test.escrow';

# View escrows
SELECT id, buyer_id, seller_id, amount, status, created_at FROM escrows;

# View transactions
SELECT id, escrow_id, amount, status, gateway FROM transactions;
```

### View Redis Data

```bash
# Connect to Redis
redis-cli

# View all keys
KEYS *

# View queue length
LLEN bull:whatsapp:waiting
LLEN bull:email:waiting
```

### Run Debug Script

```bash
# Comprehensive system check
./debug.sh

# Quick status check
./quick-debug.sh
```

### Check Logs

**Backend logs:**
- Check terminal where `npm run dev:backend` is running
- Logs include request/response details, errors, and warnings

**Worker logs:**
- Check terminal where `npm run dev:worker` is running
- Shows job processing status

---

## 🔧 Troubleshooting

### Services Not Starting

**Problem:** Services fail to start

**Solutions:**
```bash
# 1. Check if ports are already in use
lsof -i :3001  # Backend
lsof -i :3000  # Frontend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# 2. Kill processes if needed
kill -9 <PID>

# 3. Check environment variables
cat .env

# 4. Verify database connection
psql "postgresql://escrow_user:escrow_password@localhost:5432/escrow_db" -c "SELECT 1;"

# 5. Verify Redis connection
redis-cli ping
```

### Database Connection Errors

**Problem:** `Error: P1001: Can't reach database server`

**Solutions:**
```bash
# 1. Check if PostgreSQL is running
pg_isready

# 2. Start PostgreSQL
brew services start postgresql@14
# or
docker-compose up -d postgres

# 3. Verify connection string in .env
echo $DATABASE_URL

# 4. Test connection manually
psql $DATABASE_URL -c "SELECT 1;"
```

### Redis Connection Errors

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solutions:**
```bash
# 1. Check if Redis is running
redis-cli ping

# 2. Start Redis
brew services start redis
# or
docker-compose up -d redis

# 3. Verify connection string in .env
echo $REDIS_URL
```

### Authentication Issues

**Problem:** Can't login or OTP not received

**Solutions:**
```bash
# 1. Check if user exists
psql $DATABASE_URL -c "SELECT email, role FROM users WHERE email = 'buyer1@test.escrow';"

# 2. Reseed database if needed
npm run seed

# 3. Check OTP in database (for testing)
psql $DATABASE_URL -c "SELECT email, code, expires_at FROM otp_codes WHERE email = 'buyer1@test.escrow' ORDER BY created_at DESC LIMIT 1;"

# 4. Verify JWT_SECRET is set
echo $JWT_SECRET
```

### Payment Gateway Issues

**Problem:** Payment initialization fails

**Solutions:**
```bash
# 1. Check payment gateway credentials in .env
# Paystack
echo $PAYSTACK_SECRET_KEY
echo $PAYSTACK_PUBLIC_KEY

# Monnify
echo $MONNIFY_API_KEY
echo $MONNIFY_SECRET_KEY

# 2. Test gateway connection (if test mode)
curl -X GET https://api.paystack.com/bank \
  -H "Authorization: Bearer $PAYSTACK_SECRET_KEY"

# 3. Check webhook URL configuration
# Should be: http://your-domain.com/api/webhooks/paystack
```

### Frontend Not Loading

**Problem:** Frontend shows errors or blank page

**Solutions:**
```bash
# 1. Check if frontend is running
curl http://localhost:3000

# 2. Check browser console for errors
# Open DevTools (F12) and check Console tab

# 3. Verify backend is accessible
curl http://localhost:3001/health

# 4. Check CORS configuration
# Backend should allow frontend origin
```

### Webhook Not Working

**Problem:** Payment webhooks not being received

**Solutions:**
```bash
# 1. Check webhook service is running
curl http://localhost:3001/api/webhooks/paystack

# 2. Verify webhook URL in payment gateway dashboard
# Paystack: https://dashboard.paystack.com/#/settings/developer
# Monnify: https://app.monnify.com/settings/webhooks

# 3. Test webhook manually
curl -X POST http://localhost:3001/api/webhooks/paystack \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: test-signature" \
  -d '{"event": "charge.success", "data": {...}}'

# 4. Check webhook logs
# Look for webhook processing in backend logs
```

---

## 📚 Additional Resources

- **API Documentation**: See [docs/api-spec.md](./docs/api-spec.md)
- **Architecture**: See [docs/architecture.md](./docs/architecture.md)
- **Database Schema**: See [docs/database-schema.md](./docs/database-schema.md)
- **Security Model**: See [docs/security-model.md](./docs/security-model.md)
- **Deployment Guide**: See [docs/deployment-guide.md](./docs/deployment-guide.md)
- **Test Data**: See [SEED_DATA.md](./SEED_DATA.md)
- **Quick Start**: See [QUICK_START.md](./QUICK_START.md)
- **Debugging Guide**: See [DEBUG.md](./DEBUG.md)

---

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs** - Most errors are logged with details
2. **Review documentation** - See `/docs` folder
3. **Run debug scripts** - Use `./debug.sh` or `./quick-debug.sh`
4. **Check GitHub Issues** - Search for similar problems
5. **Open a new issue** - Provide error logs and steps to reproduce

---

**Last Updated:** 2024-01-08
