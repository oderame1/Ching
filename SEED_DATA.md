# Database Seed Data

## Overview

The database has been seeded with test users for development and testing purposes.

## Test Users

### Buyers (3 users)
All buyers have password: `password123`

| Email | Name | Balance |
|-------|------|---------|
| buyer1@test.escrow | John Buyer | $1,000.00 |
| buyer2@test.escrow | Jane Purchaser | $1,000.00 |
| buyer3@test.escrow | Bob Customer | $1,000.00 |

### Sellers (3 users)
All sellers have password: `password123`

| Email | Name | Balance |
|-------|------|---------|
| seller1@test.escrow | Alice Seller | $500.00 |
| seller2@test.escrow | Charlie Merchant | $500.00 |
| seller3@test.escrow | Diana Vendor | $500.00 |

### Admins (2 users)
All admins have password: `admin123`

| Email | Name | Balance |
|-------|------|---------|
| admin@test.escrow | Admin User | $0.00 |
| admin2@test.escrow | Super Admin | $0.00 |

## Quick Login

### As Buyer
```
Email: buyer1@test.escrow
Password: password123
```

### As Seller
```
Email: seller1@test.escrow
Password: password123
```

### As Admin
```
Email: admin@test.escrow
Password: admin123
```

## Reseeding

To reseed the database (clears existing test data and recreates):

```bash
npm run seed
```

Or manually:

```bash
tsx scripts/seed-database.ts
```

## Testing API Endpoints

### Login as Buyer
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer1@test.escrow",
    "password": "password123"
  }'
```

### Login as Seller
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller1@test.escrow",
    "password": "password123"
  }'
```

### Login as Admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.escrow",
    "password": "admin123"
  }'
```

## User Features

### Buyers
- Can create escrow transactions
- Can fund escrows
- Can release escrows
- Can cancel escrows
- Can raise disputes
- Starting balance: $1,000

### Sellers
- Can view escrows assigned to them
- Can track transaction status
- Can respond to disputes
- Starting balance: $500

### Admins
- Can view all escrows
- Can resolve disputes
- Can view audit logs
- Can manage blacklist
- Can view system statistics
- Starting balance: $0

## Notes

- All test users have verified emails and phones
- Wallets are automatically created for all users
- Test data uses `@test.escrow` domain to distinguish from real users
- Passwords are hashed using bcrypt
- You can modify the seed script to add more users or change balances

