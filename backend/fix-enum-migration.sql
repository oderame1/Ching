-- Fix PaymentGateway and WebhookEventType enums
-- Run this script directly in your PostgreSQL database

BEGIN;

-- Step 1: Update existing data from 'monnify' to 'paystack' (temporary)
-- We'll change to flutterwave after enum is updated
UPDATE "Payment" SET "gateway" = 'paystack' WHERE "gateway" = 'monnify';
UPDATE "Escrow" SET "paymentGateway" = 'paystack' WHERE "paymentGateway" = 'monnify';
UPDATE "Transaction" SET "gateway" = 'paystack' WHERE "gateway" = 'monnify';
UPDATE "Payout" SET "gateway" = 'paystack' WHERE "gateway" = 'monnify';

-- Step 2: Update WebhookEvent data
UPDATE "WebhookEvent" SET "type" = 'paystack_payment_success' WHERE "type" = 'monnify_payment_success';
UPDATE "WebhookEvent" SET "type" = 'paystack_payment_failed' WHERE "type" = 'monnify_payment_failed';
UPDATE "WebhookEvent" SET "gateway" = 'paystack' WHERE "gateway" = 'monnify';

-- Step 3: Drop and recreate PaymentGateway enum
ALTER TYPE "PaymentGateway" RENAME TO "PaymentGateway_old";
CREATE TYPE "PaymentGateway" AS ENUM ('paystack', 'flutterwave');

-- Step 4: Update all columns using PaymentGateway
ALTER TABLE "Escrow" ALTER COLUMN "paymentGateway" TYPE "PaymentGateway" USING "paymentGateway"::text::"PaymentGateway";
ALTER TABLE "Payment" ALTER COLUMN "gateway" TYPE "PaymentGateway" USING "gateway"::text::"PaymentGateway";
ALTER TABLE "Transaction" ALTER COLUMN "gateway" TYPE "PaymentGateway" USING "gateway"::text::"PaymentGateway";
ALTER TABLE "Payout" ALTER COLUMN "gateway" TYPE "PaymentGateway" USING "gateway"::text::"PaymentGateway";

-- Step 5: Drop old enum
DROP TYPE "PaymentGateway_old";

-- Step 6: Drop and recreate WebhookEventType enum
ALTER TYPE "WebhookEventType" RENAME TO "WebhookEventType_old";
CREATE TYPE "WebhookEventType" AS ENUM ('paystack_payment_success', 'paystack_payment_failed', 'flutterwave_payment_success', 'flutterwave_payment_failed');

-- Step 7: Update WebhookEvent table
ALTER TABLE "WebhookEvent" ALTER COLUMN "type" TYPE "WebhookEventType" USING "type"::text::"WebhookEventType";

-- Step 8: Drop old enum
DROP TYPE "WebhookEventType_old";

COMMIT;




