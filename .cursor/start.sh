#!/usr/bin/env bash
# Per-boot reconciliation: bring up PostgreSQL and Redis, ensure the database
# exists and is in sync with the Prisma schema, and seed sample data once.
# Must be idempotent, avoid duplicate processes, check readiness, then return.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

PG_MAJOR="$(ls /etc/postgresql 2>/dev/null | sort -n | tail -1 || echo 16)"
DB_URL="postgresql://escrow_user:escrow_password@localhost:5432/escrow_db"

echo "==> Starting PostgreSQL (cluster ${PG_MAJOR}/main)"
sudo pg_ctlcluster "${PG_MAJOR}" main start 2>/dev/null || true
for _ in $(seq 1 30); do
  if pg_isready -h localhost -p 5432 -U escrow_user >/dev/null 2>&1; then break; fi
  sleep 1
done

echo "==> Ensuring database role and database exist"
sudo -u postgres psql -v ON_ERROR_STOP=1 <<'SQL' || true
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'escrow_user') THEN
    CREATE ROLE escrow_user LOGIN PASSWORD 'escrow_password';
  END IF;
END$$;
SQL
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='escrow_db'" | grep -q 1 \
  || sudo -u postgres createdb -O escrow_user escrow_db

echo "==> Starting Redis"
if ! redis-cli ping >/dev/null 2>&1; then
  sudo redis-server /etc/redis/redis.conf --daemonize yes
fi
for _ in $(seq 1 30); do
  if redis-cli ping >/dev/null 2>&1; then break; fi
  sleep 1
done

echo "==> Syncing database schema (prisma db push)"
# NOTE: `prisma migrate deploy` is intentionally not used here: the committed
# migrations have a timestamp-ordering bug (a *_update_monnify_to_flutterwave
# migration is dated before the init migration), so a fresh deploy fails.
# db push syncs schema.prisma directly, which is the correct dev workflow.
( cd backend && DATABASE_URL="$DB_URL" npx prisma db push --skip-generate )

echo "==> Seeding sample data (only when the database is empty)"
USER_COUNT="$(sudo -u postgres psql -tAc 'SELECT COUNT(*) FROM "User";' escrow_db 2>/dev/null || echo 0)"
if [ "${USER_COUNT:-0}" = "0" ]; then
  ( cd backend && DATABASE_URL="$DB_URL" npx tsx prisma/seed.ts )
else
  echo "   Database already has ${USER_COUNT} users; skipping seed."
fi

echo "==> Start complete: PostgreSQL and Redis are ready"
