# API Specification

Base URL: `http://localhost:3001/api`

## Authentication

All endpoints (except auth and webhooks) require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Auth

#### POST /auth/request-otp
Request OTP for phone number.

**Request:**
```json
{
  "phone": "+2349012345678"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "expiresIn": 300,
  "otp": "123456" // Only in development
}
```

#### POST /auth/verify
Verify OTP and get tokens.

**Request:**
```json
{
  "phone": "+2349012345678",
  "otp": "123456"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "email@example.com",
    "phone": "+2349012345678",
    "name": "User Name",
    "role": "buyer"
  },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

### Escrow

#### POST /escrow/initiate
Create a new escrow transaction.

**Request:**
```json
{
  "counterpartyId": "uuid",
  "amount": 10000,
  "currency": "NGN",
  "description": "Product purchase",
  "expiresInDays": 7
}
```

**Response:**
```json
{
  "escrow": {
    "id": "uuid",
    "buyerId": "uuid",
    "sellerId": "uuid",
    "initiator": "buyer",
    "amount": "10000.00",
    "currency": "NGN",
    "description": "Product purchase",
    "state": "waiting_for_payment",
    "expiresAt": "2024-01-08T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /escrow/:id
Get escrow details.

**Response:**
```json
{
  "escrow": {
    "id": "uuid",
    "buyerId": "uuid",
    "sellerId": "uuid",
    "amount": "10000.00",
    "state": "paid",
    "payments": [],
    "transactions": [],
    "payout": null
  }
}
```

#### POST /escrow/:id/cancel
Cancel an escrow.

**Request:**
```json
{
  "reason": "No longer needed"
}
```

#### POST /escrow/:id/delivered
Mark escrow as delivered (seller only).

#### POST /escrow/:id/received
Mark escrow as received (buyer only).

### Payments

#### POST /payments/initialize
Initialize payment for escrow.

**Request:**
```json
{
  "escrowId": "uuid",
  "gateway": "paystack",
  "callbackUrl": "https://example.com/callback"
}
```

**Response:**
```json
{
  "payment": {
    "id": "uuid",
    "reference": "PAY-xxx",
    "status": "initialized"
  },
  "paymentUrl": "https://paystack.com/checkout/xxx"
}
```

#### GET /payments/status/:reference
Get payment status.

### Admin

#### GET /admin/escrows
Get all escrows (paginated).

**Query Params:**
- `state`: Filter by state
- `page`: Page number
- `limit`: Items per page

#### GET /admin/users
Get all users (paginated).

#### POST /admin/release/:id
Release funds for escrow.

#### POST /admin/refund/:id
Refund escrow payment.

**Request:**
```json
{
  "reason": "Dispute resolution"
}
```

#### GET /admin/audit-logs
Get audit trail logs.

### Webhooks

#### POST /webhooks/paystack
Paystack webhook endpoint.

#### POST /webhooks/monnify
Monnify webhook endpoint.

