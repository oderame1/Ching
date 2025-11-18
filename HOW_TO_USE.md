# How to Use the Escrow Payment Platform

## Quick Start

### 1. Start Infrastructure
```bash
# Start PostgreSQL and Redis
brew services start postgresql@14 redis

# Or if already running, verify:
redis-cli ping  # Should return: PONG
pg_isready     # Should return: accepting connections
```

### 2. Start All Services
```bash
# Start backend services and frontend apps
npm run dev

# Or start separately:
npm run dev:services  # Backend only
npm run dev:apps      # Frontend only
```

### 3. Access the Platform

**Frontend Applications:**
- **Buyer App**: http://localhost:5173
- **Seller App**: http://localhost:5174

- **Admin Dashboard**: http://localhost:5175


**API Gateway**: http://localhost:3000

## User Workflows

### As a Buyer

#### 1. Login
- Go to: http://localhost:5173
- Email: `buyer1@test.escrow`
- Password: `password123`

#### 2. Create an Escrow Transaction
1. Click "Create Escrow" button
2. Enter seller email: `seller1@test.escrow`
3. Enter amount: `100.00`
4. Add description (optional)
5. Click "Create Escrow"

#### 3. Fund the Escrow
1. View your escrow in the dashboard
2. Click on the escrow to see details
3. Fund the escrow (money moves from your wallet to escrow)

#### 4. Release Escrow (After Seller Delivers)
1. Go to escrow details
2. Click "Release Escrow"
3. Money is transferred to seller

#### 5. Raise a Dispute (If Needed)
1. Go to escrow details
2. Click "Raise Dispute"
3. Enter reason and description
4. Upload evidence (optional)
5. Admin will review and resolve

### As a Seller

#### 1. Login
- Go to: http://localhost:5174
- Email: `seller1@test.escrow`
- Password: `password123`

#### 2. View Escrows
- See all escrows assigned to you
- Track status: pending, funded, in_progress, completed
- View buyer details and transaction amount

#### 3. Track Transactions
- Monitor escrow status
- See when buyer releases funds
- View transaction history

### As an Admin

#### 1. Login
- Go to: http://localhost:5175
- Email: `admin@test.escrow`
- Password: `admin123`

#### 2. View System Statistics
- Total escrows
- Active escrows
- Total disputes
- Open disputes

#### 3. Manage Disputes
1. Go to "Disputes" section
2. View all open disputes
3. Click on a dispute to see details
4. Review evidence and descriptions
5. Resolve dispute:
   - Favor Buyer (refund buyer)
   - Favor Seller (pay seller)
   - Partial (split amount)
   - Refund (return to buyer)

#### 4. View Audit Logs
- See all system activities
- Filter by user, action, entity type
- Track changes and events

## API Usage

### Authentication

#### Register New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "name": "New User",
    "role": "buyer"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer1@test.escrow",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "buyer1@test.escrow",
    "role": "buyer"
  },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

#### Use Token
```bash
# Save token from login response
TOKEN="your-access-token"

# Use in subsequent requests
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Escrow Operations

#### Create Escrow
```bash
curl -X POST http://localhost:3000/api/business/escrow \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "seller_id": "seller-uuid",
    "amount": 100.00,
    "currency": "USD",
    "description": "Payment for services"
  }'
```

#### Get Escrow Details
```bash
curl -X GET http://localhost:3000/api/business/escrow/ESCROW_ID \
  -H "Authorization: Bearer $TOKEN"
```

#### Release Escrow
```bash
curl -X POST http://localhost:3000/api/business/escrow/ESCROW_ID/release \
  -H "Authorization: Bearer $TOKEN"
```

#### Cancel Escrow
```bash
curl -X POST http://localhost:3000/api/business/escrow/ESCROW_ID/cancel \
  -H "Authorization: Bearer $TOKEN"
```

### Payment Operations

#### Get Wallet
```bash
curl -X GET http://localhost:3000/api/payment/wallet \
  -H "Authorization: Bearer $TOKEN"
```

#### Deposit to Wallet
```bash
curl -X POST http://localhost:3000/api/payment/wallet/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500.00,
    "currency": "USD",
    "payment_method": "card",
    "payment_method_id": "card-id"
  }'
```

#### Add Payment Card
```bash
curl -X POST http://localhost:3000/api/payment/cards \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "card_number": "4242424242424242",
    "expiry_month": 12,
    "expiry_year": 2025,
    "cvv": "123",
    "cardholder_name": "John Buyer"
  }'
```

### Dispute Operations

#### Create Dispute
```bash
curl -X POST http://localhost:3000/api/business/disputes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "escrow_id": "escrow-uuid",
    "reason": "Item not received",
    "description": "I paid but never received the item",
    "evidence_urls": ["https://example.com/proof.jpg"]
  }'
```

#### Resolve Dispute (Admin Only)
```bash
curl -X POST http://localhost:3000/api/business/disputes/DISPUTE_ID/resolve \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resolution": "favor_buyer",
    "admin_notes": "Buyer provided proof of non-delivery"
  }'
```

## Complete Example Workflow

### 1. Buyer Creates Escrow
```bash
# Login as buyer
BUYER_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer1@test.escrow","password":"password123"}' \
  | jq -r '.accessToken')

# Get seller ID
SELLER_ID=$(curl -s -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"seller1@test.escrow","password":"password123"}' \
    | jq -r '.accessToken')" \
  | jq -r '.user.id')

# Create escrow
ESCROW_ID=$(curl -s -X POST http://localhost:3000/api/business/escrow \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"seller_id\":\"$SELLER_ID\",\"amount\":100.00}" \
  | jq -r '.id')

echo "Escrow created: $ESCROW_ID"
```

### 2. Fund Escrow (via Payment Service)
The escrow is automatically funded when buyer initiates payment.

### 3. Buyer Releases Escrow
```bash
curl -X POST http://localhost:3000/api/business/escrow/$ESCROW_ID/release \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

## Testing with Frontend Apps

### Buyer App Workflow
1. Open http://localhost:5173
2. Login with `buyer1@test.escrow` / `password123`
3. Click "Create Escrow"
4. Enter seller email and amount
5. View escrows in dashboard
6. Click escrow to see details
7. Release when ready

### Seller App Workflow
1. Open http://localhost:5174
2. Login with `seller1@test.escrow` / `password123`
3. View escrows assigned to you
4. Track transaction status

### Admin Dashboard Workflow
1. Open http://localhost:5175
2. Login with `admin@test.escrow` / `admin123`
3. View system statistics
4. Go to Disputes section
5. Review and resolve disputes
6. View audit logs

## Common Tasks

### Check Service Health
```bash
# All services
for port in 3000 3001 3002 3003 3004 3005 3006 3007; do
  echo "Port $port: $(curl -s http://localhost:$port/health | jq -r '.service')"
done
```

### View Database Users
```bash
psql "postgresql://escrow_user:escrow_password@localhost:5432/escrow_db" \
  -c "SELECT email, name, role FROM users WHERE email LIKE '%@test.escrow';"
```

### View Wallets
```bash
psql "postgresql://escrow_user:escrow_password@localhost:5432/escrow_db" \
  -c "SELECT u.email, w.balance FROM users u JOIN wallets w ON u.id = w.user_id;"
```

### View Escrows
```bash
psql "postgresql://escrow_user:escrow_password@localhost:5432/escrow_db" \
  -c "SELECT id, buyer_id, seller_id, amount, status FROM escrows;"
```

## Troubleshooting

### Services Not Responding
```bash
# Check if services are running
./quick-debug.sh

# Restart services
pkill -f "tsx watch"
npm run dev:services
```

### Can't Login
- Verify user exists: Check `SEED_DATA.md`
- Verify password: All test users use `password123` (or `admin123` for admins)
- Check auth service: `curl http://localhost:3001/health`

### Database Connection Issues
```bash
# Verify database is running
pg_isready

# Check connection
psql "postgresql://escrow_user:escrow_password@localhost:5432/escrow_db" -c "SELECT 1;"
```

## Next Steps

1. **Explore the API**: Use the API endpoints to test functionality
2. **Create Test Escrows**: Use the frontend apps to create transactions
3. **Test Disputes**: Create disputes and resolve them as admin
4. **Check Logs**: Monitor service logs for debugging
5. **Customize**: Modify seed data or add more test users

## Resources

- **API Documentation**: Check service route files in `services/*/src/routes/`
- **Database Schema**: See migration files in service `database/connection.ts`
- **Test Data**: See `SEED_DATA.md` for all test credentials
- **Debugging**: See `DEBUG.md` for troubleshooting guide

