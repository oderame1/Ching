# Frontend Applications Setup Guide

## Quick Start

```bash
# Start all frontend apps
npm run dev:apps

# Or start individually
cd apps/buyer-app && npm run dev
cd apps/seller-app && npm run dev
cd apps/admin-dashboard && npm run dev
```

## Frontend Applications

### 1. Buyer App (PWA)
- **Path**: `/Users/pro/Ching/apps/buyer-app`
- **Port**: 5173 (Vite default)
- **URL**: http://localhost:5173
- **Features**: 
  - Login/Register
  - Create Escrow
  - View Escrows
  - Release Escrow

### 2. Seller App
- **Path**: `/Users/pro/Ching/apps/seller-app`
- **Port**: 5174 (if configured) or next available
- **URL**: http://localhost:5174
- **Features**:
  - View Escrows
  - Track Transactions

### 3. Admin Dashboard
- **Path**: `/Users/pro/Ching/apps/admin-dashboard`
- **Port**: 5175 (if configured) or next available
- **URL**: http://localhost:5175
- **Features**:
  - View All Escrows
  - Manage Disputes
  - View Audit Logs
  - System Statistics

## Configuration

### Environment Variables

Each app can have its own `.env` file:

**apps/buyer-app/.env**
```env
VITE_API_URL=http://localhost:3000
```

**apps/seller-app/.env**
```env
VITE_API_URL=http://localhost:3000
```

**apps/admin-dashboard/.env**
```env
VITE_API_URL=http://localhost:3000
```

### API URL Configuration

The frontend apps connect to the API Gateway at `http://localhost:3000` by default.

To change the API URL, create `.env` files in each app directory:

```bash
# Buyer App
echo "VITE_API_URL=http://localhost:3000" > apps/buyer-app/.env

# Seller App
echo "VITE_API_URL=http://localhost:3000" > apps/seller-app/.env

# Admin Dashboard
echo "VITE_API_URL=http://localhost:3000" > apps/admin-dashboard/.env
```

## Development

### Start All Apps
```bash
npm run dev:apps
```

### Start Individual App

**Buyer App:**
```bash
cd apps/buyer-app
npm run dev
```

**Seller App:**
```bash
cd apps/seller-app
npm run dev
```

**Admin Dashboard:**
```bash
cd apps/admin-dashboard
npm run dev
```

## Build for Production

### Build All Apps
```bash
cd apps/buyer-app && npm run build
cd apps/seller-app && npm run build
cd apps/admin-dashboard && npm run build
```

### Build Outputs
- `apps/buyer-app/dist/` - Buyer app production build
- `apps/seller-app/dist/` - Seller app production build
- `apps/admin-dashboard/dist/` - Admin dashboard production build

## Testing the Frontend

### 1. Buyer App Workflow

1. Open http://localhost:5173
2. Register a new account
3. Login
4. Create an escrow transaction
5. View escrow details
6. Release escrow when ready

### 2. Seller App Workflow

1. Open http://localhost:5174
2. View escrows assigned to you
3. Track transaction status

### 3. Admin Dashboard Workflow

1. Open http://localhost:5175
2. View system statistics
3. Manage disputes
4. View audit logs

## Troubleshooting

### Port Already in Use

If a port is already in use, Vite will automatically use the next available port.

To specify a custom port:
```bash
cd apps/buyer-app
npm run dev -- --port 3001
```

### CORS Issues

If you see CORS errors, ensure:
1. Backend services are running
2. API Gateway is configured correctly
3. CORS is enabled in backend services (already configured)

### API Connection Errors

1. Verify API Gateway is running: `curl http://localhost:3000/health`
2. Check `.env` file has correct `VITE_API_URL`
3. Check browser console for errors

### Build Errors

If build fails:
```bash
# Clear node_modules and reinstall
cd apps/buyer-app
rm -rf node_modules
npm install
npm run build
```

## PWA Features (Buyer App)

The Buyer App is configured as a Progressive Web App (PWA):

- **Offline Support**: Can work offline (with service worker)
- **Installable**: Can be installed on mobile/desktop
- **Manifest**: Configured in `vite.config.js`

### Testing PWA

1. Open Buyer App in Chrome/Edge
2. Look for install prompt
3. Or use DevTools > Application > Manifest

## Hot Module Replacement (HMR)

All apps support hot module replacement:
- Changes to React components update instantly
- No page refresh needed
- State is preserved during updates

## Development Tips

1. **Use React DevTools**: Install browser extension for debugging
2. **Check Network Tab**: Monitor API calls in browser DevTools
3. **Console Logs**: Check browser console for errors
4. **Vite DevTools**: Vite provides helpful error messages

## Production Deployment

### Static Hosting

Build outputs can be deployed to:
- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **AWS S3 + CloudFront**
- **GitHub Pages**

### Docker Deployment

Each app can be containerized:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
```

## File Structure

```
apps/
├── buyer-app/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateEscrow.jsx
│   │   │   └── EscrowDetail.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── seller-app/
│   └── ...
└── admin-dashboard/
    └── ...
```

