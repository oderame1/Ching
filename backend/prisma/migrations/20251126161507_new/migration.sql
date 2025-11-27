/*
  Warnings:

  - The values [monnify] on the enum `PaymentGateway` will be removed. If these variants are still used in the database, this will fail.
  - The values [monnify_payment_success,monnify_payment_failed] on the enum `WebhookEventType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentGateway_new" AS ENUM ('paystack', 'flutterwave');
ALTER TABLE "Escrow" ALTER COLUMN "paymentGateway" TYPE "PaymentGateway_new" USING ("paymentGateway"::text::"PaymentGateway_new");
ALTER TABLE "Payment" ALTER COLUMN "gateway" TYPE "PaymentGateway_new" USING ("gateway"::text::"PaymentGateway_new");
ALTER TYPE "PaymentGateway" RENAME TO "PaymentGateway_old";
ALTER TYPE "PaymentGateway_new" RENAME TO "PaymentGateway";
DROP TYPE "PaymentGateway_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "WebhookEventType_new" AS ENUM ('paystack_payment_success', 'paystack_payment_failed', 'flutterwave_payment_success', 'flutterwave_payment_failed');
ALTER TABLE "WebhookEvent" ALTER COLUMN "type" TYPE "WebhookEventType_new" USING ("type"::text::"WebhookEventType_new");
ALTER TYPE "WebhookEventType" RENAME TO "WebhookEventType_old";
ALTER TYPE "WebhookEventType_new" RENAME TO "WebhookEventType";
DROP TYPE "WebhookEventType_old";
COMMIT;
