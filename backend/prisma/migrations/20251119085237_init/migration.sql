-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('buyer', 'seller', 'admin');

-- CreateEnum
CREATE TYPE "EscrowState" AS ENUM ('pending', 'waiting_for_payment', 'paid', 'delivered', 'received', 'released', 'cancelled', 'expired');

-- CreateEnum
CREATE TYPE "EscrowInitiator" AS ENUM ('buyer', 'seller');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('paystack', 'monnify');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'initialized', 'completed', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('payment', 'payout', 'refund');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "WebhookEventType" AS ENUM ('paystack_payment_success', 'paystack_payment_failed', 'monnify_payment_success', 'monnify_payment_failed');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'buyer',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Escrow" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "initiator" "EscrowInitiator" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "description" TEXT NOT NULL,
    "state" "EscrowState" NOT NULL DEFAULT 'pending',
    "paymentReference" TEXT,
    "paymentGateway" "PaymentGateway",
    "expiresAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" TEXT,
    "cancellationReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Escrow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "escrowId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "gateway" "PaymentGateway" NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "gatewayResponse" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "escrowId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "reference" TEXT NOT NULL,
    "gateway" TEXT,
    "gatewayResponse" JSONB,
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "escrowId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "recipientAccount" TEXT NOT NULL,
    "recipientBank" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "gateway" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "gatewayResponse" JSONB,
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "escrowId" TEXT NOT NULL,
    "userId" TEXT,
    "channel" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditTrail" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditTrail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "type" "WebhookEventType" NOT NULL,
    "gateway" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "signature" TEXT NOT NULL,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Escrow_paymentReference_key" ON "Escrow"("paymentReference");

-- CreateIndex
CREATE INDEX "Escrow_buyerId_idx" ON "Escrow"("buyerId");

-- CreateIndex
CREATE INDEX "Escrow_sellerId_idx" ON "Escrow"("sellerId");

-- CreateIndex
CREATE INDEX "Escrow_state_idx" ON "Escrow"("state");

-- CreateIndex
CREATE INDEX "Escrow_paymentReference_idx" ON "Escrow"("paymentReference");

-- CreateIndex
CREATE INDEX "Escrow_createdAt_idx" ON "Escrow"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_reference_key" ON "Payment"("reference");

-- CreateIndex
CREATE INDEX "Payment_escrowId_idx" ON "Payment"("escrowId");

-- CreateIndex
CREATE INDEX "Payment_reference_idx" ON "Payment"("reference");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_reference_key" ON "Transaction"("reference");

-- CreateIndex
CREATE INDEX "Transaction_escrowId_idx" ON "Transaction"("escrowId");

-- CreateIndex
CREATE INDEX "Transaction_reference_idx" ON "Transaction"("reference");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_escrowId_key" ON "Payout"("escrowId");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_reference_key" ON "Payout"("reference");

-- CreateIndex
CREATE INDEX "Payout_escrowId_idx" ON "Payout"("escrowId");

-- CreateIndex
CREATE INDEX "Payout_reference_idx" ON "Payout"("reference");

-- CreateIndex
CREATE INDEX "Payout_status_idx" ON "Payout"("status");

-- CreateIndex
CREATE INDEX "OtpCode_userId_idx" ON "OtpCode"("userId");

-- CreateIndex
CREATE INDEX "OtpCode_phone_idx" ON "OtpCode"("phone");

-- CreateIndex
CREATE INDEX "OtpCode_expiresAt_idx" ON "OtpCode"("expiresAt");

-- CreateIndex
CREATE INDEX "OtpCode_isUsed_idx" ON "OtpCode"("isUsed");

-- CreateIndex
CREATE INDEX "NotificationLog_escrowId_idx" ON "NotificationLog"("escrowId");

-- CreateIndex
CREATE INDEX "NotificationLog_userId_idx" ON "NotificationLog"("userId");

-- CreateIndex
CREATE INDEX "NotificationLog_channel_idx" ON "NotificationLog"("channel");

-- CreateIndex
CREATE INDEX "NotificationLog_status_idx" ON "NotificationLog"("status");

-- CreateIndex
CREATE INDEX "AuditTrail_userId_idx" ON "AuditTrail"("userId");

-- CreateIndex
CREATE INDEX "AuditTrail_resource_idx" ON "AuditTrail"("resource");

-- CreateIndex
CREATE INDEX "AuditTrail_resourceId_idx" ON "AuditTrail"("resourceId");

-- CreateIndex
CREATE INDEX "AuditTrail_createdAt_idx" ON "AuditTrail"("createdAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_gateway_idx" ON "WebhookEvent"("gateway");

-- CreateIndex
CREATE INDEX "WebhookEvent_type_idx" ON "WebhookEvent"("type");

-- CreateIndex
CREATE INDEX "WebhookEvent_isProcessed_idx" ON "WebhookEvent"("isProcessed");

-- CreateIndex
CREATE INDEX "WebhookEvent_createdAt_idx" ON "WebhookEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "Escrow" ADD CONSTRAINT "Escrow_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Escrow" ADD CONSTRAINT "Escrow_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "Escrow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "Escrow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "Escrow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpCode" ADD CONSTRAINT "OtpCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "Escrow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditTrail" ADD CONSTRAINT "AuditTrail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
