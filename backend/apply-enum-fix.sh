#!/bin/bash
# Script to fix PaymentGateway enum from monnify to flutterwave

set -e

echo "🔧 Applying enum fix migration..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set it in your .env file or export it:"
    echo "  export DATABASE_URL='postgresql://user:password@localhost:5432/escrow_db'"
    exit 1
fi

# Extract connection details from DATABASE_URL if it has query params
# Prisma DATABASE_URL might have ?schema=public which psql doesn't like
CLEAN_DB_URL=$(echo "$DATABASE_URL" | sed 's/?.*$//')

echo "📝 Running SQL migration..."
echo "Connecting to database..."

# Apply the SQL migration
psql "$CLEAN_DB_URL" -f fix-enum-migration.sql

if [ $? -eq 0 ]; then
    echo "✅ Enum migration applied successfully!"
    echo "🔄 Regenerating Prisma Client..."
    npx prisma generate
    echo ""
    echo "✅ Done! Database enums have been updated from 'monnify' to 'flutterwave'"
    echo "You can now run: npm run db:seed"
else
    echo "❌ Migration failed. Please check the error above."
    exit 1
fi
