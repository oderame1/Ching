# API Reference

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://api.yourdomain.com`

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Request OTP
```http
POST /api/auth/request-otp
Content-Type: application/json

{
  "phone": "+2348012345678"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "expiresIn": 300,
  "otp": "123456" // Only in development mode
}
```

#### Verify OTP
```http
POST /api/auth/verify
Content-Type: application/json

{
  "phone": "+2348012345678",
  "otp": "123456"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "phone": "+2348012345678",
    "name": "User Name",
    "role": "buyer"
  },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

### Escrow Management

#### Create Escrow
```http
POST /api/escrow/initiate
Authorization: Bearer <token>
Content-Type: application/json

{
  "counterpartyId": "uuid",
  "amount": 10000,
  "currency": "NGN",
  "description": "Product purchase",
  "expiresInDays": 7
}
```

#### Get Escrow
```http
GET /api/escrow/:id
Authorization: Bearer <token>
```

#### Cancel Escrow
```http
POST /api/escrow/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Optional cancellation reason"
}
```

#### Mark as Delivered (Seller)
```http
POST /api/escrow/:id/delivered
Authorization: Bearer <token>
```

#### Mark as Received (Buyer)
```http
POST /api/escrow/:id/received
Authorization: Bearer <token>
```

### Payments

#### Initialize Payment
```http
POST /api/payments/initialize
Authorization: Bearer <token>
Content-Type: application/json

{
  "escrowId": "uuid",
  "gateway": "paystack" | "monnify",
  "callbackUrl": "https://example.com/callback"
}
```

#### Get Payment Status
```http
GET /api/payments/status/:reference
Authorization: Bearer <token>
```

### Payouts

#### Get Payout Status
```http
GET /api/payouts/status/:reference
Authorization: Bearer <token>
```

### User Management

#### Get Current User
```http
GET /api/users/me
Authorization: Bearer <token>
```

#### Update User Profile
```http
PATCH /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Name",
  "email": "newemail@example.com",
  "phone": "+2348012345678"
}
```

### Notifications

#### Send WhatsApp Notification
```http
POST /api/notifications/whatsapp
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipient": "+2348012345678",
  "message": "Your message here"
}
```

#### Send Email Notification
```http
POST /api/notifications/email
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipient": "user@example.com",
  "subject": "Email Subject",
  "message": "Your message here"
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

### Common Error Codes

- `UNAUTHORIZED` - Authentication required or invalid
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `INVALID_INPUT` - Validation error
- `ESCROW_STATE_INVALID` - Invalid escrow state transition
- `CONFLICT` - Resource conflict (e.g., duplicate email)

## Rate Limiting

- Most endpoints: 100 requests per 15 minutes per IP
- Auth endpoints: 10 requests per 15 minutes per IP
- Admin endpoints: IP allowlist required

## Webhooks

### Paystack Webhook
```http
POST /api/webhooks/paystack
X-Paystack-Signature: <signature>
Content-Type: application/json
```

### Monnify Webhook
```http
POST /api/webhooks/monnify
monnify-signature: <signature>
Content-Type: application/json
```

## Development Endpoints

These endpoints are only available in development/test mode:

### Get OTP (Dev Only)
```http
GET /api/dev/otp/:phone
```

Returns OTP information for testing (OTP is hashed in database, check backend logs for plain text).

