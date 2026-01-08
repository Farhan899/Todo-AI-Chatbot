# Quickstart Guide: Neon-FastAPI-Next-Todo

**Feature**: 001-todo-app
**Date**: 2025-12-28
**Audience**: Developers setting up the project for the first time

## Overview

This guide walks you through setting up the complete development environment for the Neon-FastAPI-Next-Todo application. You'll configure both frontend (Next.js) and backend (FastAPI) services with a shared authentication secret.

**Estimated Setup Time**: 20-30 minutes

---

## Prerequisites

Ensure you have the following installed:

- **Node.js**: 18.x or later ([Download](https://nodejs.org/))
- **npm** or **pnpm**: Latest version (comes with Node.js)
- **Python**: 3.11 or later ([Download](https://www.python.org/downloads/))
- **pip**: Latest version (comes with Python)
- **Git**: For version control ([Download](https://git-scm.com/))
- **PostgreSQL Client** (optional): For direct database access ([Download](https://www.postgresql.org/download/))

**Verify installations**:
```bash
node --version    # Should be v18.x or higher
npm --version     # Should be 9.x or higher
python --version  # Should be 3.11.x or higher
pip --version     # Should be 23.x or higher
git --version     # Any recent version
```

---

## Step 1: Clone Repository

```bash
git clone <repository-url>
cd To-do\ app

# Verify branch
git branch  # Should show 001-todo-app (or checkout if needed)
```

---

## Step 2: Database Setup (Neon PostgreSQL)

### 2.1 Create Neon Project

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign in or create account
3. Click **"New Project"**
4. Configure project:
   - **Name**: `neon-fastapi-next-todo`
   - **Region**: Choose closest to your location
   - **PostgreSQL Version**: 16 (latest)
5. Click **"Create Project"**

### 2.2 Retrieve Connection String

1. In project dashboard, click **"Connection Details"**
2. Copy the connection string (it looks like):
   ```
   postgresql://user:password@ep-random-name.region.aws.neon.tech/neondb
   ```
3. **Important**: Replace `postgresql://` with `postgresql+asyncpg://` for Python async support
   ```
   postgresql+asyncpg://user:password@ep-random-name.region.aws.neon.tech/neondb
   ```

### 2.3 Test Connection (Optional)

```bash
# Using psql (if installed)
psql "postgresql://user:password@ep-random-name.region.aws.neon.tech/neondb"

# Should connect successfully
# Type \q to exit
```

---

## Step 3: Generate Shared Secret

Generate a cryptographically secure secret for JWT signing/verification:

```bash
# Using OpenSSL (Linux/macOS/Git Bash on Windows)
openssl rand -hex 32

# Using Python (cross-platform)
python -c "import secrets; print(secrets.token_hex(32))"
```

**Example output**:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Save this value**: You'll use it in both frontend and backend `.env` files.

---

## Step 4: Backend Setup (FastAPI)

### 4.1 Navigate to Backend Directory

```bash
cd backend
```

### 4.2 Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate

# On Windows (Command Prompt):
venv\Scripts\activate

# On Windows (PowerShell):
venv\Scripts\Activate.ps1

# Verify activation (prompt should show (venv))
which python  # Should point to venv/bin/python
```

### 4.3 Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt

# Expected packages:
# - fastapi
# - uvicorn[standard]
# - sqlmodel
# - asyncpg
# - python-jose[cryptography]
# - python-multipart
# - alembic
# - pytest
# - pytest-asyncio
# - httpx
```

### 4.4 Create Environment File

Create `backend/.env`:

```bash
# Create .env file
touch .env

# Edit with your favorite editor (nano, vim, vscode)
nano .env
```

Add the following content (replace placeholders):

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@host/db

# Authentication (MUST match frontend)
BETTER_AUTH_SECRET=<your-generated-secret-from-step-3>

# CORS
FRONTEND_URL=http://localhost:3000

# Environment
ENVIRONMENT=development

# Server
API_HOST=0.0.0.0
API_PORT=8000

# Logging
LOG_LEVEL=INFO
```

**Critical**: Ensure `BETTER_AUTH_SECRET` is the same value you'll use in frontend.

### 4.5 Initialize Database

```bash
# Run Alembic migrations
alembic upgrade head

# Expected output:
# INFO  [alembic.runtime.migration] Running upgrade  -> 001, Initial schema
# INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
```

### 4.6 Verify Backend Setup

```bash
# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Expected output:
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
# INFO:     Started reloader process [12345] using statreload
# INFO:     Started server process [12346]
# INFO:     Waiting for application startup.
# INFO:     Application startup complete.
```

**Test in browser**: Navigate to `http://localhost:8000/docs`
- You should see interactive Swagger UI with API documentation
- Try expanding `/api/{user_id}/tasks` endpoints

**Leave server running** for frontend integration testing, or stop with `Ctrl+C`.

---

## Step 5: Frontend Setup (Next.js)

### 5.1 Navigate to Frontend Directory

```bash
# Open new terminal window/tab
cd frontend
```

### 5.2 Install Dependencies

```bash
# Using npm
npm install

# Or using pnpm (faster)
pnpm install

# Expected packages:
# - next (16+)
# - react, react-dom
# - better-auth (with JWT plugin)
# - tailwindcss, postcss, autoprefixer
# - typescript, @types/react, @types/node
```

### 5.3 Create Environment File

Create `frontend/.env.local`:

```bash
# Create .env.local file
touch .env.local

# Edit with your favorite editor
nano .env.local
```

Add the following content:

```env
# Authentication (MUST match backend)
BETTER_AUTH_SECRET=<your-generated-secret-from-step-3>

# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Database URL (for Better Auth user management)
# Use the same Neon connection string (without +asyncpg)
DATABASE_URL=postgresql://user:password@host/db

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Critical**:
- `BETTER_AUTH_SECRET` must match backend `.env`
- `DATABASE_URL` uses `postgresql://` (not `postgresql+asyncpg://`)

### 5.4 Configure Better Auth

Create or verify `frontend/src/lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  plugins: [
    // JWT Plugin for token generation
    {
      id: "jwt",
      config: {
        expiresIn: "24h",  // Token expiration (matches spec)
      },
    },
  ],
});
```

### 5.5 Run Database Migrations (Better Auth)

```bash
# Better Auth automatically creates user tables on first run
npm run dev

# This will:
# 1. Start Next.js dev server
# 2. Initialize Better Auth
# 3. Create users table in Neon database
# 4. Listen on http://localhost:3000
```

### 5.6 Verify Frontend Setup

**Test in browser**: Navigate to `http://localhost:3000`
- You should see the landing page
- Try navigating to `/auth/signin` (should show login form)
- Try navigating to `/dashboard` (should redirect to login if not authenticated)

---

## Step 6: Integration Test

### 6.1 Create Test User

1. Go to `http://localhost:3000/auth/signup`
2. Fill form:
   - **Email**: `test@example.com`
   - **Password**: `password123`
3. Click **"Sign Up"**
4. Should redirect to dashboard automatically

### 6.2 Create Test Task

1. On dashboard, fill task form:
   - **Title**: `Test Task`
   - **Description**: `Verify integration works`
2. Click **"Add Task"**
3. Task should appear in list immediately

### 6.3 Verify Backend Logs

Check backend terminal for logs:
```
INFO: POST /api/{user_id}/tasks HTTP/1.1 200 OK
INFO: User usr_xxx created task id=1
```

### 6.4 Verify Database

Connect to Neon database and query:
```sql
-- List users
SELECT id, email, created_at FROM users;

-- List tasks
SELECT id, user_id, title, is_completed FROM tasks;
```

You should see your test user and task.

---

## Step 7: Development Workflow

### Starting Services

**Terminal 1 (Backend)**:
```bash
cd backend
source venv/bin/activate  # Or activate.ps1 on Windows
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm run dev
```

### Environment Variables Checklist

Before running, verify:

```bash
# Backend (.env)
grep BETTER_AUTH_SECRET backend/.env

# Frontend (.env.local)
grep BETTER_AUTH_SECRET frontend/.env.local

# Values must match EXACTLY
```

**Tip**: Create a script to check:
```bash
# check-secrets.sh
#!/bin/bash
BACKEND_SECRET=$(grep BETTER_AUTH_SECRET backend/.env | cut -d '=' -f 2)
FRONTEND_SECRET=$(grep BETTER_AUTH_SECRET frontend/.env.local | cut -d '=' -f 2)

if [ "$BACKEND_SECRET" == "$FRONTEND_SECRET" ]; then
  echo "✅ Secrets match"
else
  echo "❌ Secrets DO NOT match!"
  exit 1
fi
```

---

## Step 8: Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/integration/test_tasks.py

# Run with verbose output
pytest -v
```

**Expected output**:
```
================================ test session starts ================================
tests/unit/test_security.py ......                                          [ 30%]
tests/unit/test_models.py ....                                              [ 50%]
tests/integration/test_tasks.py ..........                                  [ 90%]
tests/contract/test_api_schema.py ..                                        [100%]

================================ 22 passed in 5.42s =================================
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- task-list.test.tsx

# Run in watch mode
npm test -- --watch
```

---

## Common Issues & Solutions

### Issue 1: Database Connection Fails

**Symptom**: `sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) could not connect to server`

**Solutions**:
1. Verify `DATABASE_URL` in `.env` files
2. Check Neon project is not suspended (free tier auto-suspends after inactivity)
3. Test connection with `psql` command
4. Ensure firewall allows outbound connections to Neon

### Issue 2: JWT Verification Fails (403 Forbidden)

**Symptom**: All API requests return `{"detail": "Access denied: cannot access another user's resources"}`

**Solutions**:
1. **Check secret match**:
   ```bash
   # Backend
   cat backend/.env | grep BETTER_AUTH_SECRET

   # Frontend
   cat frontend/.env.local | grep BETTER_AUTH_SECRET
   ```
2. **Verify JWT token contains `sub` claim**:
   - Go to [jwt.io](https://jwt.io/)
   - Paste your token (from browser dev tools → Application → Cookies)
   - Check decoded payload has `"sub": "usr_xxx"`
3. **Check user_id in URL matches JWT**:
   - Frontend should extract user_id from JWT and use it in API calls
   - Verify `lib/api.ts` correctly constructs URLs

### Issue 3: CORS Errors in Browser Console

**Symptom**: `Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solutions**:
1. Verify `FRONTEND_URL=http://localhost:3000` in backend `.env`
2. Check backend CORS configuration in `app/main.py`:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[os.getenv("FRONTEND_URL")],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```
3. Restart backend server after changing `.env`

### Issue 4: Alembic Migration Fails

**Symptom**: `alembic.util.exc.CommandError: Can't locate revision identified by 'XXX'`

**Solutions**:
1. **Reset migrations** (development only):
   ```bash
   # Drop all tables
   psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

   # Re-run migrations
   alembic upgrade head
   ```
2. **Check migration history**:
   ```bash
   alembic history
   alembic current
   ```

### Issue 5: Port Already in Use

**Symptom**: `OSError: [Errno 98] Address already in use`

**Solutions**:
```bash
# Find process using port 8000 (backend)
lsof -i :8000
# Or on Windows: netstat -ano | findstr :8000

# Kill process
kill -9 <PID>
# Or on Windows: taskkill /PID <PID> /F

# Start server again
uvicorn app.main:app --reload
```

---

## Project Structure Reference

```
To-do app/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry
│   │   ├── models/              # SQLModel entities
│   │   ├── schemas/             # Pydantic request/response models
│   │   ├── api/
│   │   │   ├── deps.py          # JWT verification dependency
│   │   │   └── routes/
│   │   │       └── tasks.py     # Task CRUD endpoints
│   │   ├── core/
│   │   │   ├── config.py        # Settings
│   │   │   ├── security.py      # JWT utilities
│   │   │   └── database.py      # SQLModel engine/session
│   │   └── utils/
│   │       └── logging.py       # Structured logging
│   ├── tests/                   # Pytest tests
│   ├── alembic/                 # Database migrations
│   ├── .env                     # Backend environment variables
│   ├── requirements.txt         # Python dependencies
│   └── pytest.ini
│
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   ├── components/          # React components
│   │   ├── lib/
│   │   │   ├── api.ts           # API client with JWT injection
│   │   │   ├── auth.ts          # Better Auth configuration
│   │   │   └── types.ts         # TypeScript interfaces
│   │   └── middleware.ts        # Route protection
│   ├── public/                  # Static assets
│   ├── tests/                   # Jest tests
│   ├── .env.local               # Frontend environment variables
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── specs/
    └── 001-todo-app/
        ├── spec.md              # Feature specification
        ├── plan.md              # Implementation plan
        ├── research.md          # Technology decisions
        ├── data-model.md        # Entity schemas
        ├── quickstart.md        # This file
        └── contracts/
            └── api.openapi.yaml # API specification
```

---

## Next Steps

After completing setup:

1. **Explore API Documentation**: `http://localhost:8000/docs`
2. **Review Codebase Structure**: Read `plan.md` and `data-model.md`
3. **Run Tests**: Ensure all tests pass (`pytest` and `npm test`)
4. **Start Development**: Follow TDD workflow (write tests → implement → refactor)
5. **Generate Tasks**: Run `/sp.tasks` command to break down implementation into actionable steps

---

## Environment Variables Summary

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
BETTER_AUTH_SECRET=<64-char-hex-string>
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO
```

### Frontend (`frontend/.env.local`)

```env
BETTER_AUTH_SECRET=<64-char-hex-string>  # MUST match backend
NEXT_PUBLIC_API_URL=http://localhost:8000
DATABASE_URL=postgresql://user:pass@host/db  # No +asyncpg
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Security Checklist

Before deploying to production:

- [ ] Change `BETTER_AUTH_SECRET` to production value (different from dev)
- [ ] Use secret management service (AWS Secrets Manager, Doppler, etc.)
- [ ] Never commit `.env` or `.env.local` files to git (add to `.gitignore`)
- [ ] Enable HTTPS for both frontend and backend
- [ ] Update `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` to production domains
- [ ] Configure database connection pooling for production load
- [ ] Enable rate limiting on API endpoints
- [ ] Set up monitoring and alerting (log aggregation, error tracking)

---

## Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Better Auth Documentation**: https://better-auth.com/docs
- **SQLModel Documentation**: https://sqlmodel.tiangolo.com/
- **Neon Documentation**: https://neon.tech/docs
- **API Specification**: `specs/001-todo-app/contracts/api.openapi.yaml`
- **Data Model**: `specs/001-todo-app/data-model.md`

---

## Support

If you encounter issues not covered in this guide:

1. Check existing documentation in `specs/001-todo-app/`
2. Review error logs (backend: uvicorn output, frontend: browser console)
3. Verify environment variables match requirements
4. Test each service independently before integration
5. Create an issue in the project repository with:
   - Error message (full stack trace)
   - Steps to reproduce
   - Environment details (OS, Python/Node versions)
   - Configuration (sanitized `.env` without secrets)

---

**Setup Complete!** You're ready to start building the todo application. 🎉
