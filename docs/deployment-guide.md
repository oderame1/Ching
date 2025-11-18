# Deployment Guide

## Prerequisites

- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- Node.js 18+
- Nginx (for production)

## Local Development Setup

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd Ching
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   # Edit .env files with your configuration
   ```

4. **Start infrastructure:**
   ```bash
   docker-compose -f infra/docker-compose.yml up -d postgres redis
   ```

5. **Run database migrations:**
   ```bash
   cd backend
   npm run migrate:dev
   ```

6. **Start development servers:**
   ```bash
   # From root directory
   npm run dev
   ```

   Or individually:
   ```bash
   npm run dev:frontend
   npm run dev:backend
   npm run dev:worker
   npm run dev:webhooks
   ```

## Production Deployment

### Docker Deployment

1. **Build images:**
   ```bash
   docker-compose -f infra/docker-compose.yml build
   ```

2. **Start all services:**
   ```bash
   docker-compose -f infra/docker-compose.yml up -d
   ```

3. **Run migrations:**
   ```bash
   docker-compose -f infra/docker-compose.yml exec backend npm run migrate
   ```

### Manual Deployment

1. **Build applications:**
   ```bash
   npm run build
   ```

2. **Start backend:**
   ```bash
   cd backend
   npm start
   ```

3. **Start worker:**
   ```bash
   cd worker
   npm start
   ```

4. **Start webhooks:**
   ```bash
   cd webhooks
   npm start
   ```

5. **Start frontend:**
   ```bash
   cd frontend
   npm start
   ```

### Nginx Configuration

Configure Nginx as reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/escrow_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
PAYSTACK_SECRET_KEY=your-paystack-key
MONNIFY_SECRET_KEY=your-monnify-key
```

### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

## Database Backups

```bash
# Backup
pg_dump -U escrow_user escrow_db > backup.sql

# Restore
psql -U escrow_user escrow_db < backup.sql
```

## Monitoring

- Health checks: `GET /health` on each service
- Logs: Check Docker logs or application logs
- Database: Monitor connection pool and query performance
- Redis: Monitor memory usage and queue length

## Scaling

- **Horizontal scaling**: Deploy multiple worker instances
- **Database**: Use read replicas for read-heavy operations
- **Redis**: Use Redis Cluster for high availability
- **CDN**: Use CloudFront/Cloudflare for static assets

