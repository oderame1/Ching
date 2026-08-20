# AGENTS.md

## Cursor Cloud specific instructions

This is an npm-workspaces monorepo (`escrow-platform`) for a Nigerian-market escrow/payments product. The canonical, runnable product is **Architecture A**: `frontend` + `backend` + `shared` (+ background `worker`/`webhooks`), orchestrated locally per-service. The `services/*` (microservices) and `apps/*` (standalone Vite apps) directories are alternate/parallel architectures that are NOT wired into the root workspaces and are not part of the standard dev flow.

### Environment layer (already handled by the update script)
The update script runs `npm install`, works around the npm Rollup optional-deps bug, creates/links `.env`, runs `prisma generate`, and builds `shared`. You should not need to redo these. System dependencies (PostgreSQL 16, Redis 7) are provided by the VM snapshot, not the update script.

### Datastores must be started manually (no systemd in the VM)
PostgreSQL and Redis are installed but not auto-started. Start them each session before running the backend/worker/webhooks:
- `sudo pg_ctlcluster 16 main start`
- `sudo redis-server --daemonize yes`

DB credentials (match `.env.example`): user `escrow_user` / password `escrow_password` / db `escrow_db` on `localhost:5432`. Redis on `localhost:6379`.

### First-time database setup (only if the DB is empty)
Migrations are intentionally NOT applied via `prisma migrate` — the committed migration history is broken (a data migration timestamped `20250101...` sorts before the `_init` migration that creates the tables, so `migrate deploy`/`reset` fail). Use `db push` instead, then seed:
- `cd backend && npx prisma db push`
- `npm run db:seed --workspace=backend` (creates 5 test users; e.g. buyer `+2348123456789`, seller `+2348123456787`, admin `+2348123456785`)

### Running the app (use per-service commands, NOT root `npm run dev`)
Root `npm run dev` runs workspace dev scripts sequentially, so it hangs on the first long-running watcher and never starts the rest. Start each service in its own terminal:
- Backend API (port 3001): `npm run dev:backend` — health: `curl localhost:3001/health`
- Frontend (Vite, port 3000): `npm run dev:frontend`
- Worker (background jobs): `npm run dev:worker` — see known issue below
- Webhooks (port 3002): `npm run dev:webhooks` — see known issue below

Auth is passwordless OTP. In development, `POST /api/auth/request-otp {"phone":"0..."}` returns the OTP in the response body (also logged), so no SMS provider is needed. External integrations (Paystack/Flutterwave/SendGrid/Termii/S3) default to mock/empty and are not required for local dev.

### Env var loading gotcha
Each service calls `dotenv.config()` from its own working directory, so it needs a `.env` in that directory. The update script symlinks `backend/.env`, `worker/.env`, `webhooks/.env` → root `.env`. Prisma CLI also reads `backend/.env`.

### Tests
- Unit tests pass: `npm run test:unit --workspace=tests` (vitest). These resolve `@escrow/shared` via `shared/dist`, so keep `shared` built.
- Integration test (`npm run test:integration`) currently fails due to a pre-existing test defect: it creates users with phone numbers that collide with the seeded data, leaving IDs `undefined`. DB connectivity itself is fine.
- E2E: `tests/playwright.config.ts` uses `webServer: npm run dev`, which (see above) won't bring up the frontend on its own; run `npm run dev:frontend` + `npm run dev:backend` yourself first (Playwright reuses an existing server on :3000 when not in CI). Playwright browsers may also need `npx playwright install`.

### Known pre-existing defects (not environment issues)
- `npm run lint` fails everywhere: no ESLint config files are committed.
- `npm run typecheck` / `npm run build` fail in `worker`/`webhooks` with `Cannot find type definition file for 'minimatch'` (root `@types/minimatch` is a stub) and other type errors. Dev via `tsx` is unaffected.
- `worker` crashes on start: BullMQ requires the Redis connection to set `maxRetriesPerRequest: null` (`worker/src/utils/redis.ts`).
- `webhooks` crashes on start: `webhooks/src/index.ts` imports `handleMonnifyWebhook`, which no longer exists after the monnify→flutterwave refactor (should be `handleFlutterwaveWebhook`).
These block the background/async services but not the core backend+frontend escrow flow.
