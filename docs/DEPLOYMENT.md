# Deployment Guide

This guide covers deployment of the Escrow Platform using the specified tech stack.

## Overview

- **Frontend**: Vercel
- **Backend**: Railway or Render
- **Database**: Neon PostgreSQL or Supabase
- **Monitoring**: Logtail or Sentry

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel

### Steps

1. **Install Vercel CLI** (optional):
```bash
npm i -g vercel
```

2. **Deploy from Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` directory as the root
   - Configure build settings:
     - **Framework Preset**: Vite (or React)
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Environment Variables**:
   Add these in Vercel dashboard → Settings → Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically deploy on every push to main branch

### Custom Domain
- Go to Project Settings → Domains
- Add your custom domain
- Update DNS records as instructed

## Backend Deployment

### Option 1: Railway

#### Prerequisites
- Railway account
- GitHub repository

#### Steps

1. **Create New Project**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Service**:
   - Select the `backend` directory
   - Railway will auto-detect Node.js

3. **Environment Variables**:
   Add in Railway dashboard → Variables:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-key
   PAYSTACK_SECRET_KEY=your-paystack-key
   PAYSTACK_PUBLIC_KEY=your-paystack-public-key
   PAYSTACK_WEBHOOK_SECRET=your-webhook-secret
   FLUTTERWAVE_SECRET_KEY=your-flutterwave-key
   FLUTTERWAVE_PUBLIC_KEY=your-flutterwave-public-key
   FLUTTERWAVE_WEBHOOK_SECRET=your-webhook-secret
   TERMII_API_KEY=your-termii-key
   SENDGRID_API_KEY=your-sendgrid-key
   # OR for Mailgun:
   EMAIL_PROVIDER=mailgun
   MAILGUN_API_KEY=your-mailgun-key
   MAILGUN_DOMAIN=your-domain
   AWS_ACCESS_KEY_ID=your-aws-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-bucket-name
   # OR for Cloudinary:
   STORAGE_PROVIDER=cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Database Setup**:
   - Add PostgreSQL service in Railway
   - Copy the DATABASE_URL to backend variables

5. **Run Migrations**:
   - Add a one-time command: `npm run migrate`
   - Or run manually: `railway run npm run migrate`

6. **Deploy**:
   - Railway auto-deploys on push to main
   - Check logs in Railway dashboard

### Option 2: Render

#### Prerequisites
- Render account
- GitHub repository

#### Steps

1. **Create Web Service**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect GitHub repository

2. **Configure Service**:
   - **Name**: escrow-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free or Paid

3. **Environment Variables**:
   Add in Render dashboard → Environment:
   (Same as Railway above)

4. **Database Setup**:
   - Create PostgreSQL database in Render
   - Copy DATABASE_URL to service environment variables

5. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy

## Database Setup

### Option 1: Neon PostgreSQL

1. **Create Account**:
   - Go to [neon.tech](https://neon.tech)
   - Sign up for free account

2. **Create Project**:
   - Click "Create Project"
   - Choose region (closest to your backend)
   - Select PostgreSQL version (15+)

3. **Get Connection String**:
   - Copy the connection string
   - Format: `postgresql://user:password@host/database`

4. **Run Migrations**:
   ```bash
   DATABASE_URL=your-neon-url npm run migrate
   ```

5. **Seed Database** (optional):
   ```bash
   DATABASE_URL=your-neon-url npm run db:seed
   ```

### Option 2: Supabase

1. **Create Account**:
   - Go to [supabase.com](https://supabase.com)
   - Sign up for free account

2. **Create Project**:
   - Click "New Project"
   - Choose organization
   - Set database password
   - Choose region

3. **Get Connection String**:
   - Go to Project Settings → Database
   - Copy "Connection string" (URI format)
   - Use format: `postgresql://postgres:password@host:5432/postgres`

4. **Run Migrations**:
   ```bash
   DATABASE_URL=your-supabase-url npm run migrate
   ```

## Monitoring Setup

### Option 1: Logtail

1. **Create Account**:
   - Go to [logtail.com](https://logtail.com)
   - Sign up for free account

2. **Create Source**:
   - Click "Add Source"
   - Select "Node.js"
   - Copy the source token

3. **Install Package**:
   ```bash
   npm install @logtail/node @logtail/pino
   ```

4. **Configure Backend**:
   Add to backend environment:
   ```
   LOGTAIL_SOURCE_TOKEN=your-token
   ```

5. **Update Logger** (in backend):
   ```typescript
   import { Logtail } from '@logtail/node';
   import { LogtailTransport } from '@logtail/pino';
   
   const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN);
   // Add LogtailTransport to pino logger
   ```

### Option 2: Sentry

1. **Create Account**:
   - Go to [sentry.io](https://sentry.io)
   - Sign up for free account

2. **Create Project**:
   - Select "Node.js"
   - Copy DSN

3. **Install Package**:
   ```bash
   npm install @sentry/node
   ```

4. **Configure Backend**:
   Add to backend environment:
   ```
   SENTRY_DSN=your-sentry-dsn
   ```

5. **Initialize Sentry** (in backend/src/index.ts):
   ```typescript
   import * as Sentry from '@sentry/node';
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });
   ```

## Webhook Configuration

### Paystack Webhooks

1. **Get Webhook URL**:
   - Your backend webhook URL: `https://your-backend-url.com/api/webhooks/paystack`

2. **Configure in Paystack**:
   - Go to Paystack Dashboard → Settings → Webhooks
   - Add webhook URL
   - Select events: `charge.success`, `charge.failed`
   - Copy webhook secret to `PAYSTACK_WEBHOOK_SECRET`

### Flutterwave Webhooks

1. **Get Webhook URL**:
   - Your backend webhook URL: `https://your-backend-url.com/api/webhooks/flutterwave`

2. **Configure in Flutterwave**:
   - Go to Flutterwave Dashboard → Settings → Webhooks
   - Add webhook URL
   - Select events: `charge.completed`
   - Copy webhook secret to `FLUTTERWAVE_WEBHOOK_SECRET`

## Environment Variables Summary

### Required Variables

```env
# App
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-url.vercel.app

# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret
OTP_SECRET=your-otp-secret

# Payments
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_WEBHOOK_SECRET=whsec_...

FLUTTERWAVE_SECRET_KEY=FLWSECK_...
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_...
FLUTTERWAVE_WEBHOOK_SECRET=your-webhook-secret

# Notifications
TERMII_API_KEY=your-termii-key
TERMII_SENDER_ID=Escrow

# Email (SendGrid or Mailgun)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG....
# OR
EMAIL_PROVIDER=mailgun
MAILGUN_API_KEY=your-mailgun-key
MAILGUN_DOMAIN=your-domain.com

# Storage (S3 or Cloudinary)
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
# OR
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Monitoring (optional)
LOGTAIL_SOURCE_TOKEN=your-token
# OR
SENTRY_DSN=your-sentry-dsn
```

## Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Environment variables configured
- [ ] Webhooks configured in payment gateways
- [ ] Frontend API URL points to backend
- [ ] CORS configured for frontend domain
- [ ] SSL certificates active (HTTPS)
- [ ] Monitoring configured and working
- [ ] Test payment flow end-to-end
- [ ] Test OTP/SMS delivery
- [ ] Test email notifications
- [ ] Test file uploads
- [ ] Check error logs in monitoring service

## Troubleshooting

### Backend not starting
- Check environment variables are set
- Verify DATABASE_URL is correct
- Check logs in Railway/Render dashboard

### Database connection errors
- Verify DATABASE_URL format
- Check database is accessible from backend IP
- Ensure migrations have run

### Webhook not receiving events
- Verify webhook URL is publicly accessible
- Check webhook secret matches
- Verify signature validation in code
- Check backend logs for webhook errors

### Frontend API errors
- Verify VITE_API_URL is set correctly
- Check CORS settings in backend
- Verify backend is running and accessible

## Support

For issues:
1. Check monitoring service (Logtail/Sentry) for errors
2. Review backend logs
3. Check database connection
4. Verify all environment variables are set

