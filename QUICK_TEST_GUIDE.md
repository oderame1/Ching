# Quick Test Hub Guide

## 🚀 3-Step Quick Start

### 1. Start Services
```bash
# Terminal 1: Start Backend
npm run dev:backend

# Terminal 2: Start Frontend  
npm run dev:frontend
```

### 2. Open Test Hub
Open your browser: **http://localhost:3000/test-hub**

### 3. Start Testing!

## 🎯 Two Ways to Test

### Option A: Quick Check (Recommended)
Click the **"🧪 Comprehensive Test Suite"** card at the top:
- Enter phone number: `+2348012345678`
- Click "🚀 Run All Tests"
- Wait for results (all green ✅ = working!)

### Option B: Detailed Testing
Click any individual test section:
- **🔐 Authentication** - Login first (required for other tests)
- **💼 Escrow** - Create transactions
- **💳 Payments** - Process payments
- **👤 Users** - Manage profile
- And more...

## 📱 Typical Flow

1. **Start with Authentication** (`/test-otp`)
   - Enter phone: `+2348012345678`
   - Click "Send OTP"
   - Enter the 6-digit code (shown in yellow box in dev mode)
   - Click "Verify OTP"
   - ✅ You're now logged in!

2. **Test Other Features**
   - Now you can test escrows, payments, etc.
   - All other test pages will use your login automatically

## ⚡ Quick Tips

- **OTP in Dev Mode**: Appears in yellow box on screen
- **OTP in Production**: Check backend console logs
- **Need Help?**: Check browser console (F12) for details
- **Backend Down?**: You'll see a clear error message

## 🎨 Understanding Results

- ✅ **Green** = Success
- ❌ **Red** = Error (check message for details)
- ⏳ **Yellow** = In Progress
- 📊 **View Data** = Click to see full API response

## 📖 Full Guide

For complete instructions, see: [TEST_HUB_GUIDE.md](./TEST_HUB_GUIDE.md)

