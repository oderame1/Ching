import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Database seeding...');

  // Clear existing data
  await prisma.webhookEvent.deleteMany();
  await prisma.auditTrail.deleteMany();
  await prisma.notificationLog.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.escrow.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create Users
  const buyer1 = await prisma.user.create({
    data: {
      email: 'buyer1@example.com',
      phone: '+2348123456789',
      name: 'John Buyer',
      role: 'buyer',
      isVerified: true,
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      email: 'buyer2@example.com',
      phone: '+2348123456788',
      name: 'Jane Buyer',
      role: 'buyer',
      isVerified: true,
    },
  });

  const seller1 = await prisma.user.create({
    data: {
      email: 'seller1@example.com',
      phone: '+2348123456787',
      name: 'Mike Seller',
      role: 'seller',
      isVerified: true,
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      email: 'seller2@example.com',
      phone: '+2348123456786',
      name: 'Sarah Seller',
      role: 'seller',
      isVerified: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      phone: '+2348123456785',
      name: 'Admin User',
      role: 'admin',
      isVerified: true,
    },
  });

  console.log('👥 Created 5 users (2 buyers, 2 sellers, 1 admin)');

  // Create Escrows in various states
  const escrow1 = await prisma.escrow.create({
    data: {
      buyerId: buyer1.id,
      sellerId: seller1.id,
      initiator: 'buyer',
      amount: 50000,
      currency: 'NGN',
      description: 'iPhone 14 Pro Max - Brand New',
      state: 'waiting_for_payment',
      paymentGateway: 'paystack',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  const escrow2 = await prisma.escrow.create({
    data: {
      buyerId: buyer1.id,
      sellerId: seller2.id,
      initiator: 'seller',
      amount: 120000,
      currency: 'NGN',
      description: 'MacBook Air M2 - 8GB RAM, 256GB SSD',
      state: 'paid',
      paymentGateway: 'flutterwave',
      paymentReference: 'PAY-TEST-001',
      paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  const escrow3 = await prisma.escrow.create({
    data: {
      buyerId: buyer2.id,
      sellerId: seller1.id,
      initiator: 'buyer',
      amount: 35000,
      currency: 'NGN',
      description: 'Samsung Galaxy Watch 5',
      state: 'delivered',
      paymentGateway: 'paystack',
      paymentReference: 'PAY-TEST-002',
      paidAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  const escrow4 = await prisma.escrow.create({
    data: {
      buyerId: buyer2.id,
      sellerId: seller2.id,
      initiator: 'seller',
      amount: 25000,
      currency: 'NGN',
      description: 'Sony WH-1000XM5 Headphones',
      state: 'received',
      paymentGateway: 'flutterwave',
      paymentReference: 'PAY-TEST-003',
      paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      receivedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  });

  const escrow5 = await prisma.escrow.create({
    data: {
      buyerId: buyer1.id,
      sellerId: seller1.id,
      initiator: 'buyer',
      amount: 85000,
      currency: 'NGN',
      description: 'PlayStation 5 with 2 Controllers',
      state: 'released',
      paymentGateway: 'paystack',
      paymentReference: 'PAY-TEST-004',
      paidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      receivedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      releasedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      expiresAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  const escrow6 = await prisma.escrow.create({
    data: {
      buyerId: buyer2.id,
      sellerId: seller2.id,
      initiator: 'buyer',
      amount: 15000,
      currency: 'NGN',
      description: 'Nike Air Force 1 - Size 42',
      state: 'cancelled',
      cancelledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      cancelledBy: buyer2.id,
      cancellationReason: 'Changed my mind',
    },
  });

  const escrow7 = await prisma.escrow.create({
    data: {
      buyerId: buyer1.id,
      sellerId: seller2.id,
      initiator: 'seller',
      amount: 200000,
      currency: 'NGN',
      description: 'Canon EOS R6 Camera Body',
      state: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('💼 Created 7 escrows in various states');

  // Create Payments
  await prisma.payment.create({
    data: {
      escrowId: escrow2.id,
      amount: 120000,
      currency: 'NGN',
      gateway: 'flutterwave',
      reference: 'PAY-TEST-001',
      status: 'completed',
      gatewayResponse: {
        tx_ref: 'PAY-TEST-001',
        flw_ref: 'FLW-20231118120000-123456',
        status: 'successful',
        created_at: new Date().toISOString(),
      },
    },
  });

  await prisma.payment.create({
    data: {
      escrowId: escrow3.id,
      amount: 35000,
      currency: 'NGN',
      gateway: 'paystack',
      reference: 'PAY-TEST-002',
      status: 'completed',
      gatewayResponse: {
        reference: 'PAY-TEST-002',
        trans: 'TRX-123456',
        status: 'success',
      },
    },
  });

  await prisma.payment.create({
    data: {
      escrowId: escrow4.id,
      amount: 25000,
      currency: 'NGN',
      gateway: 'flutterwave',
      reference: 'PAY-TEST-003',
      status: 'completed',
    },
  });

  await prisma.payment.create({
    data: {
      escrowId: escrow5.id,
      amount: 85000,
      currency: 'NGN',
      gateway: 'paystack',
      reference: 'PAY-TEST-004',
      status: 'completed',
    },
  });

  console.log('💳 Created 4 payments');

  // Create Transactions
  await prisma.transaction.create({
    data: {
      escrowId: escrow5.id,
      type: 'payout',
      amount: 85000,
      currency: 'NGN',
      status: 'completed',
      reference: 'PAYOUT-TEST-001',
      gateway: 'paystack',
      processedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('💸 Created 1 transaction');

  // Create Payout for released escrow
  await prisma.payout.create({
    data: {
      escrowId: escrow5.id,
      amount: 85000,
      currency: 'NGN',
      recipientAccount: '0123456789',
      recipientBank: 'Access Bank',
      recipientName: 'Mike Seller',
      gateway: 'paystack',
      reference: 'PAYOUT-TEST-001',
      status: 'completed',
      processedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('🏦 Created 1 payout');

  // Create some Audit Trails
  await prisma.auditTrail.create({
    data: {
      userId: buyer1.id,
      action: 'CREATE_ESCROW',
      resource: 'escrow',
      resourceId: escrow1.id,
      details: { amount: 50000, description: 'iPhone 14 Pro Max' },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    },
  });

  await prisma.auditTrail.create({
    data: {
      userId: admin.id,
      action: 'RELEASE_ESCROW',
      resource: 'escrow',
      resourceId: escrow5.id,
      details: { amount: 85000 },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    },
  });

  console.log('📋 Created 2 audit trails');

  console.log('✅ Seeding complete!');
  console.log('\n📊 Summary:');
  console.log('  - 5 Users (2 buyers, 2 sellers, 1 admin)');
  console.log('  - 7 Escrows (various states)');
  console.log('  - 4 Payments');
  console.log('  - 1 Transaction');
  console.log('  - 1 Payout');
  console.log('  - 2 Audit Trails');
  console.log('\n🔐 Test Accounts:');
  console.log('  Buyer 1: +2348123456789 (buyer1@example.com)');
  console.log('  Buyer 2: +2348123456788 (buyer2@example.com)');
  console.log('  Seller 1: +2348123456787 (seller1@example.com)');
  console.log('  Seller 2: +2348123456786 (seller2@example.com)');
  console.log('  Admin: +2348123456785 (admin@example.com)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

