# Test Hub User Guide

## 🎯 Overview

The Test Hub is a comprehensive testing interface that allows you to test all functionality of the Escrow Platform without writing code. It's designed for both technical and non-technical users.

## 🚀 Getting Started

### Step 1: Start the Backend Server

Before using the Test Hub, make sure your backend is running:

```bash
# From the project root
npm run dev:backend

# Or use the script
./run-backend.sh
```

The backend should be running on `http://localhost:3001`

### Step 2: Start the Frontend

In a separate terminal:

```bash
# From the project root
npm run dev:frontend
```

The frontend will be available at `http://localhost:3000`

### Step 3: Access the Test Hub

Open your browser and navigate to:
```
http://localhost:3000/test-hub
```

Or from the home page, click the "🧪 Testing Hub" button.

## 📋 Available Test Sections

### 1. 🧪 Comprehensive Test Suite (Recommended)
**Location**: `/test-suite`

**What it does**: Automatically tests all major functionality in sequence

**Best for**: Quick verification that everything is working

**How to use**:
1. Enter a phone number (e.g., `+2348012345678`)
2. Click "🚀 Run All Tests"
3. Watch tests execute automatically
4. Review results - green ✅ means passed, red ❌ means failed

**Tests included**:
- Health Check
- Request OTP
- Verify OTP
- Get Current User
- Create Escrow
- Initialize Payment
- Update User Profile
- Send Notification

### 2. 🔐 Authentication & OTP
**Location**: `/test-otp`

**What it does**: Tests OTP-based login system

**How to use**:
1. Enter your phone number (Nigerian format: `+2348012345678` or `08012345678`)
2. Click "📱 Send OTP"
3. In development mode, the OTP will appear in a yellow box
4. Enter the 6-digit OTP code
5. Click "✅ Verify OTP"
6. You'll be logged in and can use other test pages

**Tips**:
- In development mode, OTP is displayed on screen
- In production, check backend console logs for OTP
- OTP expires in 5 minutes

### 3. 💼 Escrow Management
**Location**: `/test-escrow`

**What it does**: Test creating and managing escrow transactions

**How to use**:
1. **First, login** using the Authentication test page
2. **Create Escrow**:
   - Enter counterparty ID (UUID of another user)
   - Enter amount (e.g., `10000`)
   - Select currency (NGN or USD)
   - Enter description
   - Click "✨ Create Escrow"
3. **Get Escrow Details**:
   - Enter the Escrow ID from the creation response
   - Click "📋 Get Escrow Details"
4. **Update Status**:
   - **Mark as Delivered** (Seller only): Click "📦 Mark as Delivered"
   - **Mark as Received** (Buyer only): Click "✅ Mark as Received"
5. **Cancel Escrow**:
   - Enter Escrow ID
   - Optionally enter cancellation reason
   - Click "❌ Cancel Escrow"

**Important Notes**:
- You need to be logged in first
- You cannot create escrow with yourself
- Only buyer can mark received, only seller can mark delivered

### 4. 💳 Payments
**Location**: `/test-payments`

**What it does**: Test payment initialization and status checking

**How to use**:
1. **First, login** and create an escrow
2. **Initialize Payment**:
   - Enter the Escrow ID
   - Select payment gateway (Paystack or Monnify)
   - Optionally enter callback URL
   - Click "🚀 Initialize Payment"
   - You'll get a payment URL to complete the payment
3. **Check Payment Status**:
   - Enter the payment reference from initialization
   - Click "📊 Get Payment Status"

**Tips**:
- Payment can only be initiated by the buyer
- Payment URL opens in a new tab
- Payment reference is needed to check status

### 5. 💰 Payouts
**Location**: `/test-payouts`

**What it does**: Check payout status after escrow release

**How to use**:
1. **First, complete an escrow flow**:
   - Create escrow
   - Make payment
   - Mark as delivered
   - Mark as received
   - Release escrow
2. **Check Payout**:
   - Enter the payout reference (from escrow details)
   - Click "📊 Get Payout Status"

**Note**: Payouts are created automatically when escrow is released

### 6. 👤 User Management
**Location**: `/test-users`

**What it does**: View and update your user profile

**How to use**:
1. **First, login** using Authentication test
2. **View Profile**:
   - Click "📋 Get Current User"
   - Your profile information will be displayed
3. **Update Profile**:
   - Modify name, email, or phone
   - Click "💾 Update Profile"
   - Only fill fields you want to change

**Tips**:
- Profile loads automatically when you visit (if logged in)
- Email and phone must be unique
- All fields are optional when updating

### 7. 📧 Notifications
**Location**: `/test-notifications`

**What it does**: Send test notifications via WhatsApp or Email

**How to use**:
1. **First, login**
2. **Select Channel**:
   - Choose WhatsApp or Email
3. **Fill Details**:
   - **For WhatsApp**: Enter phone number (e.g., `+2348012345678`)
   - **For Email**: Enter email address and subject
   - Enter your message
4. **Send**:
   - Click "📤 Send Notification"

**Note**: In development mode, notifications are queued but may not actually send (check backend logs)

## 🔄 Typical Testing Workflow

### Complete End-to-End Test

1. **Start with Authentication** (`/test-otp`)
   - Request OTP
   - Verify OTP to get authentication token

2. **Create an Escrow** (`/test-escrow`)
   - You'll need another user's ID as counterparty
   - Create escrow transaction

3. **Make Payment** (`/test-payments`)
   - Initialize payment for the escrow
   - Complete payment via payment gateway

4. **Update Escrow Status** (`/test-escrow`)
   - Seller marks as delivered
   - Buyer marks as received

5. **Check Payout** (`/test-payouts`)
   - Verify payout was processed

### Quick Functionality Check

Use the **Comprehensive Test Suite** (`/test-suite`) for a quick check:
- Click "Run All Tests"
- Review results
- All green ✅ = everything working!

## 🎨 Understanding the Interface

### Color Coding
- **Green** ✅ = Success/Passed
- **Red** ❌ = Error/Failed
- **Yellow** ⏳ = In Progress/Running
- **Blue** ℹ️ = Information/Instructions

### Status Indicators
- **✅ Passed**: Test completed successfully
- **❌ Failed**: Test encountered an error
- **⏳ Running**: Test is currently executing
- **⏸️ Pending**: Test hasn't run yet

### Response Data
- Click "View Response Data" to see full API responses
- Useful for debugging and understanding the data structure

## 🐛 Troubleshooting

### "Network error: Cannot connect to backend"
- **Solution**: Make sure backend is running on port 3001
- Check: `curl http://localhost:3001/health`

### "Please login first"
- **Solution**: Go to Authentication test page and verify OTP first
- The token is stored automatically in browser

### "OTP not appearing"
- **Solution**: 
  - Check backend console logs for OTP
  - Make sure `NODE_ENV=development` in backend
  - OTP is logged as: `OTP for +2348012345678: 123456`

### "Invalid or expired OTP"
- **Solution**: 
  - OTP expires in 5 minutes
  - Request a new OTP
  - Make sure you're using the correct phone number

### "User not found" or "Counterparty not found"
- **Solution**: 
  - User must exist in database
  - Use the phone number you verified OTP with
  - For counterparty, you need another user's UUID

### Tests showing as failed but backend is working
- **Solution**: 
  - Check browser console (F12) for detailed errors
  - Verify you're logged in (have authentication token)
  - Check that required data exists (e.g., escrow ID, user ID)

## 💡 Tips for Best Results

1. **Start Fresh**: Clear browser storage if you encounter issues
   - Open DevTools (F12) → Application → Local Storage → Clear

2. **Use Real Data**: 
   - Use actual phone numbers in correct format
   - Use valid UUIDs for user IDs
   - Use realistic amounts and descriptions

3. **Follow Sequence**:
   - Always authenticate first
   - Create resources before using them
   - Complete flows in logical order

4. **Check Console**:
   - Browser console (F12) shows detailed API responses
   - Backend console shows server-side logs

5. **Development Mode**:
   - OTP is visible on screen
   - More detailed error messages
   - Response data is shown

## 📊 Understanding Test Results

### Comprehensive Test Suite Results

Each test shows:
- **Status**: Passed ✅, Failed ❌, Running ⏳, or Pending ⏸️
- **Message**: What happened (success or error description)
- **Duration**: How long the test took (in milliseconds)
- **Data**: Full API response (expandable)

### Individual Test Pages

- **Success Messages**: Green boxes with ✅
- **Error Messages**: Red boxes with ❌
- **Response Data**: JSON format in gray boxes
- **Instructions**: Blue boxes with ℹ️

## 🎯 Quick Reference

| Test Section | Requires Login | Main Purpose |
|-------------|----------------|-------------|
| Comprehensive Suite | Optional | Quick overall check |
| Authentication | No | Get login token |
| Escrow Management | Yes | Create/manage escrows |
| Payments | Yes | Process payments |
| Payouts | Yes | Check payout status |
| User Management | Yes | View/update profile |
| Notifications | Yes | Send notifications |

## 🚨 Important Notes

1. **Development Mode**: 
   - OTP is visible on screen
   - More permissive CORS
   - Detailed logging

2. **Production Mode**:
   - OTP only in backend logs
   - Stricter security
   - Less verbose errors

3. **Data Persistence**:
   - Test data is saved to database
   - Use test phone numbers to avoid conflicts
   - Clean up test data if needed

4. **Rate Limiting**:
   - Auth endpoints: 10 requests per 15 minutes
   - Other endpoints: 100 requests per 15 minutes
   - If you hit limits, wait a few minutes

## 📞 Need Help?

- Check browser console (F12) for errors
- Check backend console for server logs
- Review error messages - they're designed to be helpful
- See `PROJECT_ISSUES.md` for known issues
- See `DEBUG.md` for debugging guide

## 🎉 You're Ready!

The Test Hub is designed to be intuitive and user-friendly. Start with the Comprehensive Test Suite for a quick check, or dive into individual sections for detailed testing.

Happy Testing! 🧪

