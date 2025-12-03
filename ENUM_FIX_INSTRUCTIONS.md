# Fix Database Enum Issue: monnify → flutterwave

## Problem
The database still has the old `monnify` enum value, but the code has been updated to use `flutterwave`. This causes errors when running migrations or seeding the database.

## Solution

### Quick Fix (Recommended)

Run the provided script:

```bash
cd backend
./apply-enum-fix.sh
```

This script will:
1. Update all existing data from `monnify` to `paystack` (temporary)
2. Update the `PaymentGateway` enum to include `flutterwave` instead of `monnify`
3. Update the `WebhookEventType` enum similarly
4. Regenerate Prisma Client

### Manual Fix

If the script doesn't work, you can run the SQL directly:

```bash
cd backend

# Make sure DATABASE_URL is set
export DATABASE_URL="postgresql://user:password@localhost:5432/escrow_db"

# Remove query parameters if present (psql doesn't like them)
CLEAN_URL=$(echo $DATABASE_URL | sed 's/?.*$//')

# Apply migration
psql "$CLEAN_URL" -f fix-enum-migration.sql

# Regenerate Prisma Client
npx prisma generate
```

### Alternative: Fresh Database

If you're in development and can reset the database:

```bash
cd backend

# Reset database (WARNING: This deletes all data!)
npx prisma migrate reset

# This will apply all migrations including the enum update
```

### Verify Fix

After applying the fix, verify it worked:

```bash
cd backend

# Check enum values in database
psql "$DATABASE_URL" -c "SELECT unnest(enum_range(NULL::\"PaymentGateway\"));"

# Should show:
#  paystack
#  flutterwave
```

### Then Run Seed

Once the enum is fixed, you can seed the database:

```bash
npm run db:seed
```

## What the Migration Does

1. **Updates existing data**: Changes any `monnify` values to `paystack` (temporary)
2. **Recreates PaymentGateway enum**: Drops old enum, creates new one with `flutterwave`
3. **Recreates WebhookEventType enum**: Updates to include `flutterwave_payment_success` and `flutterwave_payment_failed`
4. **Updates all columns**: Migrates all tables using these enums

## Troubleshooting

### Error: "relation does not exist"
- Make sure your database is running
- Check that DATABASE_URL points to the correct database

### Error: "permission denied"
- Make sure your database user has ALTER TYPE permissions
- You may need to run as a superuser

### Error: "enum value already exists"
- The migration may have partially run
- Check the database state and manually complete if needed




