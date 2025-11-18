# Database Schema

## Models

### User
Stores user accounts.

```prisma
model User {
  id         String   @id @default(uuid())
  email      String   @unique
  phone      String   @unique
  name       String
  role       UserRole @default(buyer)
  isVerified Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

### Escrow
Main escrow transaction records.

```prisma
model Escrow {
  id                 String           @id @default(uuid())
  buyerId            String
  sellerId           String
  initiator          EscrowInitiator
  amount             Decimal          @db.Decimal(18, 2)
  currency           String           @default("NGN")
  description        String
  state              EscrowState      @default(pending)
  paymentReference   String?          @unique
  paymentGateway     PaymentGateway?
  expiresAt          DateTime?
  paidAt             DateTime?
  deliveredAt        DateTime?
  receivedAt         DateTime?
  releasedAt         DateTime?
  cancelledAt        DateTime?
  cancelledBy        String?
  cancellationReason String?          @db.Text
  metadata           Json?
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt
}
```

### Payment
Payment records linked to escrows.

```prisma
model Payment {
  id             String          @id @default(uuid())
  escrowId       String
  amount         Decimal         @db.Decimal(18, 2)
  currency       String          @default("NGN")
  gateway        PaymentGateway
  reference      String          @unique
  status         PaymentStatus   @default(pending)
  gatewayResponse Json?
  metadata       Json?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
}
```

### Transaction
All financial transactions (payments, payouts, refunds).

```prisma
model Transaction {
  id              String            @id @default(uuid())
  escrowId        String
  type            TransactionType
  amount          Decimal           @db.Decimal(18, 2)
  currency        String            @default("NGN")
  status          TransactionStatus @default(pending)
  reference       String            @unique
  gateway         String?
  gatewayResponse Json?
  errorMessage    String?           @db.Text
  processedAt     DateTime?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
}
```

### Payout
Payout records for released escrows.

```prisma
model Payout {
  id              String            @id @default(uuid())
  escrowId        String            @unique
  amount          Decimal           @db.Decimal(18, 2)
  currency        String            @default("NGN")
  recipientAccount String
  recipientBank   String
  recipientName   String
  gateway         String
  reference       String            @unique
  status          TransactionStatus @default(pending)
  gatewayResponse Json?
  errorMessage    String?           @db.Text
  processedAt     DateTime?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
}
```

### OtpCode
OTP codes for authentication.

```prisma
model OtpCode {
  id        String   @id @default(uuid())
  userId    String
  code      String   // Hashed
  phone     String
  expiresAt DateTime
  isUsed    Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

### NotificationLog
Notification delivery logs.

```prisma
model NotificationLog {
  id        String   @id @default(uuid())
  escrowId  String
  userId    String?
  channel   String   // whatsapp, email, sms
  recipient String
  subject   String?
  message   String   @db.Text
  status    String   @default(pending)
  errorMessage String? @db.Text
  sentAt    DateTime?
  createdAt DateTime @default(now())
}
```

### AuditTrail
Audit log for all system actions.

```prisma
model AuditTrail {
  id        String   @id @default(uuid())
  userId    String?
  action    String
  resource  String
  resourceId String?
  details   Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
}
```

### WebhookEvent
Webhook event logs.

```prisma
model WebhookEvent {
  id          String           @id @default(uuid())
  type        WebhookEventType
  gateway     String
  payload     Json
  signature   String
  isProcessed Boolean          @default(false)
  processedAt DateTime?
  errorMessage String?         @db.Text
  createdAt   DateTime         @default(now())
}
```

## Enums

```prisma
enum UserRole {
  buyer
  seller
  admin
}

enum EscrowState {
  pending
  waiting_for_payment
  paid
  delivered
  received
  released
  cancelled
  expired
}

enum EscrowInitiator {
  buyer
  seller
}

enum PaymentGateway {
  paystack
  monnify
}

enum PaymentStatus {
  pending
  initialized
  completed
  failed
  refunded
}

enum TransactionType {
  payment
  payout
  refund
}

enum TransactionStatus {
  pending
  processing
  completed
  failed
}

enum WebhookEventType {
  paystack_payment_success
  paystack_payment_failed
  monnify_payment_success
  monnify_payment_failed
}
```

