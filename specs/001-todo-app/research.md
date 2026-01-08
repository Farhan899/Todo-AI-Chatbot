# Research: Multi-User Todo Application

**Feature**: 001-todo-app
**Date**: 2025-12-28
**Phase**: 0 (Technology Research & Decision Justification)

## Executive Summary

This document consolidates technology choices and architectural patterns for the Neon-FastAPI-Next-Todo application. All decisions align with the constitution requirements for decoupled architecture, security-first design, and simplicity principles.

## Technology Stack Decisions

### 1. Frontend Framework: Next.js 16+ (App Router)

**Decision**: Use Next.js 16+ with App Router architecture

**Rationale**:
- **Server/Client Component Separation**: App Router enables optimal split between Server Components (auth pages, layouts) and Client Components (interactive task dashboard)
- **Built-in Routing**: File-system based routing simplifies protected route implementation
- **Middleware Support**: Native middleware for route protection (redirect unauthenticated users)
- **TypeScript Integration**: First-class TypeScript support with strict mode
- **Performance**: Automatic code splitting, image optimization, and SSR capabilities
- **Community**: Large ecosystem with Better Auth integration examples

**Alternatives Considered**:
- **React (Vite)**: More configuration required for routing, SSR, and middleware. Rejected for added complexity.
- **Vue/Nuxt**: Less mature Better Auth integration. Rejected for ecosystem maturity concerns.
- **Svelte/SvelteKit**: Smaller community, fewer Better Auth examples. Rejected for support concerns.

**Constitution Alignment**: ✅ Supports decoupled architecture (Principle I), TypeScript strict mode (Principle III), mobile-first responsive design (Principle VIII)

---

### 2. Authentication: Better Auth with JWT Plugin

**Decision**: Use Better Auth library with JWT Plugin enabled for frontend authentication

**Rationale**:
- **JWT Plugin**: Explicit support for JWT token generation (required for backend verification)
- **Next.js Integration**: Purpose-built for Next.js App Router with Server Actions
- **Session Management**: Handles token refresh, storage, and retrieval automatically
- **Minimal Configuration**: Simple setup with environment variable (BETTER_AUTH_SECRET)
- **User Management**: Built-in user registration, login, logout flows

**Alternatives Considered**:
- **NextAuth.js (Auth.js)**: More complex configuration, heavier abstraction layer. Rejected for simplicity violation.
- **Clerk**: Third-party hosted service, vendor lock-in risk. Rejected for external dependency.
- **Custom JWT Implementation**: Requires implementing user management, password hashing, session logic. Rejected for unnecessary complexity.

**Constitution Alignment**: ✅ Supports Security First principle (Principle II), Simplicity (Principle VIII), uses well-maintained library

**Implementation Notes**:
- Configure JWT Plugin to include `sub` (user ID) claim in token payload
- Set token expiration to 24 hours (industry standard, per spec assumptions)
- Ensure JWT is accessible for API client (stored in secure cookie or session storage)

---

### 3. Backend Framework: FastAPI

**Decision**: Use FastAPI for async REST API

**Rationale**:
- **Async/Await Support**: Native async eliminates blocking on database operations (required by Principle III)
- **Type Safety**: Pydantic models for automatic request/response validation (Principle III)
- **OpenAPI Generation**: Automatic API documentation and contract generation
- **Performance**: One of fastest Python frameworks (benchmarks: 10k+ req/s)
- **Dependency Injection**: Clean pattern for JWT verification and database session management
- **HTTPException**: Built-in exception handling with status codes and detail messages

**Alternatives Considered**:
- **Flask**: Synchronous by default, requires extensions for async. Rejected for async requirement.
- **Django REST Framework**: Heavy ORM (Django ORM), not compatible with SQLModel. Rejected for complexity.
- **Litestar**: Newer framework, smaller community. Rejected for maturity concerns.

**Constitution Alignment**: ✅ Async operations (Principle III), type safety with Pydantic (Principle III), HTTPException for errors (Principle III)

---

### 4. ORM: SQLModel

**Decision**: Use SQLModel for database models and queries

**Rationale**:
- **Pydantic + SQLAlchemy Hybrid**: Combines Pydantic validation with SQLAlchemy ORM
- **Type Safety**: Python type hints for fields, automatic validation
- **Async Support**: Compatible with SQLAlchemy 2.0 async engine
- **Migration Support**: Works with Alembic for database migrations (Principle V)
- **Simplicity**: Single model definition for both database and API schemas

**Alternatives Considered**:
- **SQLAlchemy (raw)**: Requires separate Pydantic schemas for validation. Rejected for duplication.
- **Tortoise ORM**: Async-first but lacks Pydantic integration. Rejected for validation gap.
- **Prisma (Python)**: Less mature Python support. Rejected for ecosystem maturity.

**Constitution Alignment**: ✅ Data integrity (Principle V), type safety (Principle III), migration support (Principle V)

**Implementation Notes**:
- Define index on `user_id` field for query performance (required by Principle V)
- Use SQLAlchemy async session for all queries
- Implement automatic timestamp management (created_at, updated_at)

---

### 5. Database: Neon Serverless PostgreSQL

**Decision**: Use Neon Serverless PostgreSQL

**Rationale**:
- **Serverless Scaling**: Automatic scaling for concurrent connections (target: 100+ users)
- **PostgreSQL Compatibility**: Full PostgreSQL feature set (indexes, transactions, ACID)
- **Connection Pooling**: Built-in pooling reduces connection overhead
- **Developer Experience**: Instant provisioning, branch-based development databases
- **Cost Efficiency**: Pay-per-use model with auto-pause for idle time

**Alternatives Considered**:
- **AWS RDS PostgreSQL**: Requires manual scaling, higher baseline cost. Rejected for serverless benefit.
- **Supabase**: Includes unnecessary features (auth, storage, realtime). Rejected for YAGNI violation.
- **Local PostgreSQL**: Requires self-hosting and management. Rejected for operational overhead.

**Constitution Alignment**: ✅ Simplicity (Principle VIII), scalability for 100+ concurrent users (Technical Context), PostgreSQL for ACID guarantees (Principle V)

**Implementation Notes**:
- Retrieve `DATABASE_URL` from Neon dashboard
- Configure connection pool size based on expected load (start with 20, monitor)
- Use connection string format: `postgresql+asyncpg://...` for async support

---

### 6. JWT Library: python-jose

**Decision**: Use python-jose for JWT encoding/decoding

**Rationale**:
- **HS256 Support**: Algorithm required by constitution (Principle II)
- **Simple API**: Clear encode/decode functions with secret key
- **Error Handling**: Explicit exceptions for expired/invalid tokens (JWTError, ExpiredSignatureError)
- **Lightweight**: Minimal dependencies, focused on JWT operations
- **Battle-Tested**: Used in FastAPI tutorials and production applications

**Alternatives Considered**:
- **PyJWT**: Similar functionality, slightly different API. Acceptable alternative (noted in plan.md).
- **Authlib**: Heavier library with OAuth support. Rejected for unnecessary features (YAGNI).
- **Custom JWT Implementation**: Security risk, no benefit. Rejected for security concerns.

**Constitution Alignment**: ✅ Security First (Principle II HS256 requirement), Simplicity (Principle VIII)

**Implementation Notes**:
```python
from jose import jwt, JWTError

# Decode and verify
try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    user_id = payload.get("sub")
except JWTError:
    raise HTTPException(status_code=401, detail="Invalid authentication token")
```

---

### 7. Styling: Tailwind CSS

**Decision**: Use Tailwind CSS for responsive styling

**Rationale**:
- **Utility-First**: Rapid development with pre-defined utility classes
- **Mobile-First**: Default breakpoint system (sm, md, lg, xl) matches requirement (320px+)
- **No Runtime Overhead**: Purges unused classes at build time
- **Next.js Integration**: Official integration with automatic PostCSS setup
- **Design Consistency**: Enforces spacing/color scale across components

**Alternatives Considered**:
- **CSS Modules**: More verbose, manual media queries required. Rejected for developer productivity.
- **Styled Components**: Runtime overhead, not SSR-friendly. Rejected for performance.
- **Material UI**: Heavy component library, opinionated design. Rejected for bundle size and design flexibility.

**Constitution Alignment**: ✅ Mobile-first responsive design (Principle VIII), performance (no runtime overhead)

---

### 8. Testing Frameworks

**Decisions**:

**Frontend: Jest + React Testing Library**
- **Jest**: De-facto React testing framework, built into Next.js
- **React Testing Library**: User-centric testing (test behavior, not implementation)
- **Rationale**: Standard React testing stack, minimal configuration

**Backend: pytest + pytest-asyncio**
- **pytest**: Industry standard Python testing framework
- **pytest-asyncio**: Enables async test functions for FastAPI endpoints
- **Rationale**: Clean syntax, powerful fixtures, async support

**Contract: OpenAPI Schema Validation**
- **Library**: openapi-core (Python) or openapi-typescript (TypeScript)
- **Rationale**: Validate actual API responses against generated OpenAPI spec

**Alternatives Considered**:
- **Frontend (Vitest)**: Faster but less mature ecosystem. Acceptable alternative.
- **Backend (unittest)**: More verbose syntax. Rejected for pytest simplicity.

**Constitution Alignment**: ✅ TDD methodology support (Principle IV), contract tests (Principle IV)

---

## Architectural Patterns

### 1. JWT Verification Pattern (Backend)

**Pattern**: FastAPI Dependency for JWT verification and user extraction

**Implementation**:
```python
# app/api/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

security = HTTPBearer()

async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID"
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

async def verify_user_access(
    user_id: str,
    current_user_id: str = Depends(get_current_user_id)
) -> str:
    """Verify that URL user_id matches JWT user_id"""
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: cannot access another user's resources"
        )
    return current_user_id
```

**Rationale**: Dependency injection ensures JWT verification on every protected endpoint. Two-stage approach separates authentication (valid token) from authorization (user_id match).

---

### 2. API Client Pattern (Frontend)

**Pattern**: Centralized API client with automatic JWT injection

**Implementation**:
```typescript
// frontend/src/lib/api.ts
import { auth } from './auth'; // Better Auth instance

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await auth.getSession();
  if (!session?.token) {
    throw new Error('Not authenticated');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.token}`,
  };
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// Usage example
export const taskApi = {
  list: (userId: string) => apiRequest<Task[]>(`/api/${userId}/tasks`),
  create: (userId: string, data: CreateTaskInput) =>
    apiRequest<Task>(`/api/${userId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  // ... other methods
};
```

**Rationale**: Centralized auth logic prevents JWT forgetting. Type-safe API client with TypeScript generics.

---

### 3. Database Query Pattern (User Isolation)

**Pattern**: Always filter by user_id in WHERE clause

**Implementation**:
```python
# app/api/routes/tasks.py
from sqlmodel import select
from app.models.task import Task

@router.get("/api/{user_id}/tasks")
async def list_tasks(
    user_id: str,
    current_user_id: str = Depends(verify_user_access),
    session: AsyncSession = Depends(get_session)
):
    """List all tasks for authenticated user"""
    statement = select(Task).where(Task.user_id == current_user_id)
    results = await session.execute(statement)
    tasks = results.scalars().all()
    return tasks
```

**Rationale**: Every query includes `user_id` filter. Even if authorization bypass occurs, database queries still enforce isolation.

---

## Security Considerations

### 1. Shared Secret Management

**Requirement**: BETTER_AUTH_SECRET must be identical in both services

**Implementation**:
- **Generation**: Use cryptographically secure random string (min 32 bytes)
  ```bash
  openssl rand -hex 32
  ```
- **Storage**: Environment variables (.env files, NOT committed to git)
- **Deployment**: Use secret management service (AWS Secrets Manager, Doppler, etc.)

**Validation Checkpoint**:
- [ ] Same BETTER_AUTH_SECRET value in `frontend/.env.local` and `backend/.env`
- [ ] Secret is at least 32 characters long
- [ ] .env files are in .gitignore

---

### 2. CORS Configuration

**Requirement**: Backend only accepts requests from Next.js origin

**Implementation**:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)
```

**Rationale**: Prevents cross-origin attacks. Production: set FRONTEND_URL to actual domain.

---

### 3. Input Validation

**Pattern**: Pydantic models with field validators

**Implementation**:
```python
from pydantic import BaseModel, Field, validator

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(None, max_length=2000)

    @validator('title')
    def title_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace only')
        return v.strip()
```

**Rationale**: Validation happens before database interaction. Matches spec requirements (FR-008, FR-009).

---

## Performance Optimizations

### 1. Database Indexing

**Required Indexes**:
```python
from sqlmodel import Field, SQLModel

class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)  # INDEX for query performance
    title: str = Field(max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**Rationale**: Index on `user_id` optimizes multi-tenant queries (required by Principle V).

---

### 2. Connection Pooling

**Configuration**:
```python
from sqlalchemy.ext.asyncio import create_async_engine

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=20,          # Concurrent connections
    max_overflow=10,       # Burst capacity
    pool_pre_ping=True,    # Verify connections before use
)
```

**Rationale**: Pool prevents connection exhaustion under load (100+ concurrent users).

---

## Logging Strategy

**Structured Logging Format**:
```python
import logging
import json

class StructuredLogger:
    def log_request(self, user_id: str, endpoint: str, method: str, status: int, duration_ms: float):
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "endpoint": endpoint,
            "method": method,
            "status": status,
            "duration_ms": duration_ms,
            "request_id": get_request_id(),  # From middleware
        }
        logging.info(json.dumps(log_entry))
```

**Rationale**: Structured logs enable querying by user_id, endpoint, slow queries (Principle VII).

---

## Deployment Architecture

**Services**:
1. **Frontend**: Next.js on Vercel or similar (supports SSR, edge functions)
2. **Backend**: FastAPI on Railway, Render, or AWS ECS (async support required)
3. **Database**: Neon PostgreSQL (managed service)

**Environment Variables**:

**Frontend (.env.local)**:
```
BETTER_AUTH_SECRET=<shared-secret>
NEXT_PUBLIC_API_URL=http://localhost:8000  # or production API URL
```

**Backend (.env)**:
```
BETTER_AUTH_SECRET=<shared-secret>  # MUST match frontend
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
FRONTEND_URL=http://localhost:3000  # or production frontend URL
ENVIRONMENT=development  # or production
```

---

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| Secret mismatch (frontend ≠ backend) | Add startup validation: decode a test JWT with both secrets |
| JWT expiration mid-session | Frontend: detect 401 responses, refresh token via Better Auth |
| Database connection exhaustion | Connection pooling (size=20) + monitoring alerts |
| CORS misconfiguration | Integration test: verify cross-origin request succeeds from frontend origin |
| SQL injection | SQLModel parameterized queries (ORM prevents injection) |
| Slow queries (>100ms) | Logging middleware tracks duration, alerts on threshold breach |

---

## Open Questions for Implementation Phase

1. **Token Refresh**: How does Better Auth handle token refresh when JWT expires after 24 hours?
   - **Research Required**: Better Auth JWT Plugin documentation for refresh token flow
   - **Fallback**: Manual implementation if not supported (refresh endpoint)

2. **Migration Tool**: Alembic vs SQLModel's `create_all()` for initial setup?
   - **Decision**: Use Alembic for production (versioned migrations per Principle V)
   - **Shortcut**: `create_all()` acceptable for development/testing only

3. **Password Hashing**: Does Better Auth handle hashing automatically?
   - **Assumption**: Yes (per library documentation)
   - **Validation**: Verify in implementation phase, ensure bcrypt or argon2

4. **Error Handling**: Should frontend display raw API error messages?
   - **Decision**: No (Principle VII: sanitize errors)
   - **Implementation**: Map API errors to user-friendly messages in frontend

---

## Summary

All technology choices align with constitution principles:
- ✅ Decoupled architecture (Next.js + FastAPI separate services)
- ✅ Security first (JWT verification, shared secret, user isolation)
- ✅ Code quality (TypeScript strict, Python type hints, Pydantic)
- ✅ TDD support (Jest, pytest, contract tests)
- ✅ Data integrity (SQLModel, migrations, indexes)
- ✅ Observability (structured logging, request IDs)
- ✅ Simplicity (direct library usage, no unnecessary abstractions)

**Next Phase**: Generate data-model.md with SQLModel schemas and API contracts.
