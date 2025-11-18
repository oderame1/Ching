import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { EscrowState, PaymentStatus } from '@escrow/shared';

const prisma = new PrismaClient();

describe('Escrow Flow Integration', () => {
  let buyerId: string;
  let sellerId: string;
  let escrowId: string;

  beforeAll(async () => {
    // Create test users
    const buyer = await prisma.user.create({
      data: {
        email: 'test-buyer@example.com',
        phone: '+2348123456789',
        name: 'Test Buyer',
        role: 'buyer',
      },
    });

    const seller = await prisma.user.create({
      data: {
        email: 'test-seller@example.com',
        phone: '+2348123456790',
        name: 'Test Seller',
        role: 'seller',
      },
    });

    buyerId = buyer.id;
    sellerId = seller.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.escrow.deleteMany({
      where: { buyerId: { in: [buyerId] }, sellerId: { in: [sellerId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [buyerId, sellerId] } },
    });
    await prisma.$disconnect();
  });

  it('should create escrow and transition to waiting_for_payment', async () => {
    const escrow = await prisma.escrow.create({
      data: {
        buyerId,
        sellerId,
        initiator: 'buyer',
        amount: 1000,
        currency: 'NGN',
        description: 'Test escrow',
        state: EscrowState.PENDING,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    escrowId = escrow.id;

    expect(escrow.state).toBe(EscrowState.PENDING);

    // Transition to waiting_for_payment
    const updated = await prisma.escrow.update({
      where: { id: escrow.id },
      data: { state: EscrowState.WAITING_FOR_PAYMENT },
    });

    expect(updated.state).toBe(EscrowState.WAITING_FOR_PAYMENT);
  });

  it('should create payment when initialized', async () => {
    const payment = await prisma.payment.create({
      data: {
        escrowId,
        amount: 1000,
        currency: 'NGN',
        gateway: 'paystack',
        reference: 'PAY-TEST-123',
        status: PaymentStatus.INITIALIZED,
      },
    });

    expect(payment.escrowId).toBe(escrowId);
    expect(payment.status).toBe(PaymentStatus.INITIALIZED);
  });

  it('should update escrow state to paid when payment is completed', async () => {
    // Update payment to completed
    await prisma.payment.updateMany({
      where: { escrowId },
      data: { status: PaymentStatus.COMPLETED },
    });

    // Update escrow to paid
    const escrow = await prisma.escrow.update({
      where: { id: escrowId },
      data: {
        state: EscrowState.PAID,
        paidAt: new Date(),
      },
    });

    expect(escrow.state).toBe(EscrowState.PAID);
    expect(escrow.paidAt).toBeTruthy();
  });

  it('should transition through delivery and received states', async () => {
    // Mark as delivered
    const delivered = await prisma.escrow.update({
      where: { id: escrowId },
      data: {
        state: EscrowState.DELIVERED,
        deliveredAt: new Date(),
      },
    });
    expect(delivered.state).toBe(EscrowState.DELIVERED);

    // Mark as received
    const received = await prisma.escrow.update({
      where: { id: escrowId },
      data: {
        state: EscrowState.RECEIVED,
        receivedAt: new Date(),
      },
    });
    expect(received.state).toBe(EscrowState.RECEIVED);
  });

  it('should release escrow and create payout', async () => {
    // Create payout
    const payout = await prisma.payout.create({
      data: {
        escrowId,
        amount: 1000,
        currency: 'NGN',
        recipientAccount: '1234567890',
        recipientBank: 'MONNIFY',
        recipientName: 'Test Seller',
        gateway: 'monnify',
        reference: 'PAYOUT-TEST-123',
        status: 'pending',
      },
    });

    // Update escrow to released
    const released = await prisma.escrow.update({
      where: { id: escrowId },
      data: {
        state: EscrowState.RELEASED,
        releasedAt: new Date(),
      },
    });

    expect(released.state).toBe(EscrowState.RELEASED);
    expect(payout.escrowId).toBe(escrowId);
  });
});

