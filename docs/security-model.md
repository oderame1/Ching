# Security Model

## Authentication

### OTP-Based Login
- 6-digit OTP
- 5-minute expiry
- OTP is hashed before storage (bcrypt)
- Single-use only

### JWT Tokens
- Access token: 7 days expiry
- Refresh token: 30 days expiry
- Tokens include user ID, email, and role
- Tokens verified on every request

## Authorization

### Role-Based Access Control (RBAC)
- **Buyer**: Can create escrow, pay, mark received
- **Seller**: Can create escrow, mark delivered
- **Admin**: Full access, can release/refund

### IP Allowlist
- Admin routes require IP allowlist
- Configured via `ADMIN_IP_ALLOWLIST` environment variable

## Payment Security

### Webhook Verification
- HMAC signature verification for all webhooks
- Prevents unauthorized webhook submissions
- Both Paystack and Monnify signatures verified

### Idempotency
- Payment references are unique
- Duplicate payments prevented
- Webhook events tracked to prevent reprocessing

## Data Protection

### Input Validation
- All inputs validated with Zod schemas
- SQL injection prevented via Prisma ORM
- XSS protection via Next.js automatic escaping

### Sensitive Data
- Passwords/OTPs never stored in plain text
- Payment details not stored (only references)
- Audit trails for all sensitive operations

## API Security

### Rate Limiting
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- Webhooks: 100 requests per minute

### CORS
- Configured to allow only frontend origin
- Credentials enabled for authenticated requests

### HTTPS
- Required in production
- SSL/TLS certificates for all domains

## Audit & Logging

### Audit Trails
- All admin actions logged
- User actions tracked
- IP address and user agent recorded

### Security Logging
- Failed authentication attempts
- Unauthorized access attempts
- Webhook verification failures

## Best Practices

1. **Environment Variables**: Never commit secrets
2. **Dependencies**: Regular security updates
3. **Database**: Use connection pooling, prepared statements
4. **Error Handling**: Never expose internal errors to clients
5. **Session Management**: Tokens stored securely (httpOnly cookies in production)

