# Todo App - Deployment Guide

This guide covers deploying the full-stack Todo application to production.

## Architecture Overview

- **Frontend**: Next.js 16+ (React, TypeScript, Tailwind CSS)
- **Backend**: FastAPI (Python 3.11+, async)
- **Database**: PostgreSQL (Neon recommended)
- **Authentication**: Better Auth with JWT

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL database (Neon, Supabase, or self-hosted)
- Git

## Environment Variables

### Backend (.env)

Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname

# Better Auth (must match frontend)
BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars

# CORS
FRONTEND_URL=https://your-frontend-domain.com

# Server (optional)
ENVIRONMENT=production
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO
```

**Important**: Generate a secure random string for `BETTER_AUTH_SECRET`:
```bash
openssl rand -base64 32
```

### Frontend (.env.local)

Create `frontend/.env.local`:

```env
# API
NEXT_PUBLIC_API_URL=https://your-api-domain.com

# Database (for Better Auth)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Better Auth (must match backend)
BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars
```

## Database Setup

### 1. Create Neon Database (Recommended)

1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Update DATABASE_URL in both `.env` files
   - Backend: Use `postgresql+asyncpg://...` format
   - Frontend: Use `postgresql://...` format

### 2. Run Migrations

```bash
cd backend
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
alembic upgrade head
```

This creates the `tasks` table and sets up the schema.

### 3. Better Auth Setup

Better Auth automatically manages the `users` and `sessions` tables. On first run, it will create these tables.

## Backend Deployment

### Option 1: Deploy to Railway

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Initialize Railway project:
   ```bash
   cd backend
   railway init
   ```

3. Add environment variables in Railway dashboard

4. Deploy:
   ```bash
   railway up
   ```

5. Link custom domain in Railway settings

### Option 2: Deploy to Render

1. Create new Web Service on Render
2. Connect your GitHub repository
3. Configuration:
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Python Version**: 3.11
4. Add environment variables from Backend .env section
5. Deploy

### Option 3: Docker Deployment

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
cd backend
docker build -t todo-backend .
docker run -p 8000:8000 --env-file .env todo-backend
```

## Frontend Deployment

### Option 1: Deploy to Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd frontend
   vercel
   ```

3. Add environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from Frontend .env.local section

4. Redeploy:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy to Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Build the app:
   ```bash
   cd frontend
   npm run build
   ```

3. Deploy:
   ```bash
   netlify deploy --prod
   ```

4. Add environment variables in Netlify dashboard

### Option 3: Docker Deployment

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

CMD ["npm", "start"]
```

Build and run:
```bash
cd frontend
docker build -t todo-frontend .
docker run -p 3000:3000 --env-file .env.local todo-frontend
```

## CORS Configuration

Ensure your backend CORS settings allow your frontend domain:

In `backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],  # Update this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Health Checks

### Backend Health Check

```bash
curl https://your-api-domain.com/
```

Expected response:
```json
{
  "message": "Neon-FastAPI-Next-Todo API",
  "version": "1.0.0"
}
```

### Frontend Health Check

Visit `https://your-frontend-domain.com/` - should show the landing page.

## Testing Production

1. **Sign Up**: Create a new account at `/auth/signup`
2. **Sign In**: Log in at `/auth/signin`
3. **Create Task**: Add a task from the dashboard
4. **Toggle Task**: Mark task as complete/incomplete
5. **Delete Task**: Remove a task
6. **Sign Out**: Logout and verify redirect

## Monitoring

### Backend Monitoring

- Enable logging in production
- Use Sentry for error tracking
- Monitor database connections
- Track API response times

### Frontend Monitoring

- Use Vercel Analytics
- Track Core Web Vitals
- Monitor client-side errors
- Set up uptime monitoring

## Security Checklist

- [ ] Use HTTPS for all connections
- [ ] Secure BETTER_AUTH_SECRET (min 32 characters)
- [ ] Enable CORS only for your domains
- [ ] Use environment variables (never commit secrets)
- [ ] Enable rate limiting on API endpoints
- [ ] Validate all user inputs
- [ ] Use prepared statements (protected by SQLModel)
- [ ] Keep dependencies updated
- [ ] Enable database connection pooling
- [ ] Set up automated backups

## Scaling Considerations

### Database
- Use connection pooling (already configured)
- Add database indexes for user_id queries
- Consider read replicas for high traffic
- Enable query caching

### Backend
- Run multiple FastAPI instances behind load balancer
- Use Redis for session caching
- Implement rate limiting per user
- Add API response caching

### Frontend
- Enable Next.js ISR for landing page
- Use CDN for static assets
- Implement service worker for offline support
- Add image optimization

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
cd backend
source venv/bin/activate
python -c "from app.core.database import get_async_engine; import asyncio; asyncio.run(get_async_engine().connect())"
```

### CORS Errors

- Verify FRONTEND_URL in backend .env
- Check browser console for exact error
- Ensure credentials are included in fetch requests

### Authentication Failures

- Verify BETTER_AUTH_SECRET matches in both .env files
- Check DATABASE_URL format (asyncpg for backend, regular for frontend)
- Ensure users table exists in database

### Migration Issues

```bash
# Check current migration version
alembic current

# View migration history
alembic history

# Rollback one migration
alembic downgrade -1

# Upgrade to latest
alembic upgrade head
```

## Rollback Procedure

### Backend Rollback

1. Revert to previous deployment
2. Rollback database migrations if needed:
   ```bash
   alembic downgrade -1
   ```

### Frontend Rollback

1. In Vercel: Deployments → Previous deployment → Promote to Production
2. In Netlify: Deploys → Previous deploy → Publish deploy

## Backup Strategy

### Database Backups

- Neon: Automatic backups (retained 7 days on free tier)
- Manual backup:
  ```bash
  pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
  ```

### Code Backups

- Git repository serves as code backup
- Tag production releases:
  ```bash
  git tag -a v1.0.0 -m "Production release v1.0.0"
  git push origin v1.0.0
  ```

## Cost Optimization

- **Database**: Use Neon free tier (0.5GB storage, 100 hours compute/month)
- **Backend**: Railway/Render free tiers available
- **Frontend**: Vercel free tier (100GB bandwidth/month)
- **Total**: Can run on free tiers for development and low-traffic production

## Support

For issues:
1. Check application logs
2. Review error messages in browser console
3. Verify environment variables
4. Test database connectivity
5. Check CORS configuration

## Production Checklist

- [ ] Environment variables configured
- [ ] Database created and migrated
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] CORS configured correctly
- [ ] Authentication working end-to-end
- [ ] All CRUD operations tested
- [ ] HTTPS enabled
- [ ] Custom domains configured
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Documentation updated
