#!/usr/bin/env bash
# Idempotent repository bootstrap for the Escrow Platform monorepo.
# Runs after checkout; must terminate and not start long-running processes.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Install PostgreSQL + Redis at the system level so the environment is
# self-contained (no snapshot/base-image dependency). apt is idempotent, and
# with environment builds this cost is paid once when the baseline is created.
echo "==> Ensuring PostgreSQL and Redis are installed"
if ! command -v pg_ctlcluster >/dev/null 2>&1 || ! command -v redis-server >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql postgresql-contrib redis-server
else
  echo "    PostgreSQL and Redis already installed; skipping apt."
fi

echo "==> Installing JavaScript dependencies (npm ci)"
npm ci

# Work around npm optional-dependency bug that leaves Vite's native rollup
# binary uninstalled (https://github.com/npm/cli/issues/4828).
echo "==> Ensuring native rollup binary is present"
if ! node -e "require('@rollup/rollup-linux-x64-gnu')" >/dev/null 2>&1; then
  ROLLUP_VERSION="$(node -e "console.log(require('rollup/package.json').version)")"
  npm install --no-save "@rollup/rollup-linux-x64-gnu@${ROLLUP_VERSION}"
fi

echo "==> Building shared package"
npm run build --workspace=shared

echo "==> Generating Prisma client"
npm run generate --workspace=backend

echo "==> Writing development .env files (only if missing)"

if [ ! -f backend/.env ]; then
  cat > backend/.env <<'EOF'
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

DATABASE_URL=postgresql://escrow_user:escrow_password@localhost:5432/escrow_db
REDIS_URL=redis://localhost:6379

JWT_SECRET=dev-jwt-secret-change-in-production-0123456789
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=dev-refresh-secret-change-in-production-0123456789
REFRESH_TOKEN_EXPIRES_IN=30d

OTP_SECRET=dev-otp-secret-change-in-production
OTP_EXPIRY_MINUTES=5

PAYSTACK_SECRET_KEY=sk_test_dev_placeholder
PAYSTACK_PUBLIC_KEY=pk_test_dev_placeholder
PAYSTACK_WEBHOOK_SECRET=dev_paystack_webhook_secret

ADMIN_IP_ALLOWLIST=

SENDGRID_API_KEY=
FROM_EMAIL=noreply@escrow.local
FROM_NAME=Escrow Platform

TERMII_API_KEY=
TERMII_SENDER_ID=Escrow

STORAGE_PROVIDER=MOCK
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,application/pdf
EOF
fi

if [ ! -f worker/.env ]; then
  cat > worker/.env <<'EOF'
NODE_ENV=development
DATABASE_URL=postgresql://escrow_user:escrow_password@localhost:5432/escrow_db
REDIS_URL=redis://localhost:6379
EOF
fi

# The standalone webhook service re-uses the backend controllers, so it needs
# the same secrets the backend config module validates on import.
if [ ! -f webhooks/.env ]; then
  cat > webhooks/.env <<'EOF'
NODE_ENV=development
PORT=3002

DATABASE_URL=postgresql://escrow_user:escrow_password@localhost:5432/escrow_db
REDIS_URL=redis://localhost:6379

JWT_SECRET=dev-jwt-secret-change-in-production-0123456789
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=dev-refresh-secret-change-in-production-0123456789
REFRESH_TOKEN_EXPIRES_IN=30d

OTP_SECRET=dev-otp-secret-change-in-production
OTP_EXPIRY_MINUTES=5

PAYSTACK_SECRET_KEY=sk_test_dev_placeholder
PAYSTACK_PUBLIC_KEY=pk_test_dev_placeholder
PAYSTACK_WEBHOOK_SECRET=dev_paystack_webhook_secret
EOF
fi

if [ ! -f frontend/.env ]; then
  cat > frontend/.env <<'EOF'
VITE_API_URL=http://localhost:3001
EOF
fi

echo "==> Install complete"
