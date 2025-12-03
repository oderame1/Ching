-- Update PaymentGateway enum: replace monnify with flutterwave
-- First, update any existing data that uses 'monnify'
UPDATE "Payment" SET "gateway" = 'paystack' WHERE "gateway" = 'monnify';
UPDATE "Escrow" SET "paymentGateway" = 'paystack' WHERE "paymentGateway" = 'monnify';
UPDATE "Transaction" SET "gateway" = 'paystack' WHERE "gateway" = 'monnify';
UPDATE "Payout" SET "gateway" = 'paystack' WHERE "gateway" = 'monnify';

-- Update WebhookEventType enum: replace monnify events with flutterwave
UPDATE "WebhookEvent" SET "type" = 'paystack_payment_success' WHERE "type" = 'monnify_payment_success';
UPDATE "WebhookEvent" SET "type" = 'paystack_payment_failed' WHERE "type" = 'monnify_payment_failed';
UPDATE "WebhookEvent" SET "gateway" = 'paystack' WHERE "gateway" = 'monnify';

-- Drop and recreate PaymentGateway enum
ALTER TYPE "PaymentGateway" RENAME TO "PaymentGateway_old";
CREATE TYPE "PaymentGateway" AS ENUM ('paystack', 'flutterwave');

-- Update all columns that use PaymentGateway enum
ALTER TABLE "Escrow" ALTER COLUMN "paymentGateway" TYPE "PaymentGateway" USING "paymentGateway"::text::"PaymentGateway";
ALTER TABLE "Payment" ALTER COLUMN "gateway" TYPE "PaymentGateway" USING "gateway"::text::"PaymentGateway";
ALTER TABLE "Transaction" ALTER COLUMN "gateway" TYPE "PaymentGateway" USING "gateway"::text::"PaymentGateway";
ALTER TABLE "Payout" ALTER COLUMN "gateway" TYPE "PaymentGateway" USING "gateway"::text::"PaymentGateway";

-- Drop old enum
DROP TYPE "PaymentGateway_old";

-- Drop and recreate WebhookEventType enum
ALTER TYPE "WebhookEventType" RENAME TO "WebhookEventType_old";
CREATE TYPE "WebhookEventType" AS ENUM ('paystack_payment_success', 'paystack_payment_failed', 'flutterwave_payment_success', 'flutterwave_payment_failed');

-- Update WebhookEvent table
ALTER TABLE "WebhookEvent" ALTER COLUMN "type" TYPE "WebhookEventType" USING "type"::text::"WebhookEventType";

-- Drop old enum
DROP TYPE "WebhookEventType_old";




