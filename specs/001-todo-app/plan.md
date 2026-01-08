# Implementation Plan: Multi-User Todo Application

**Branch**: `001-todo-app` | **Date**: 2025-12-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-app/spec.md`

## Summary

Build a secure, multi-user Todo application with decoupled Next.js frontend and Python FastAPI backend. The system uses JWT-based stateless authentication via Better Auth, with strict user isolation enforced at both routing and database query levels. Frontend handles authentication and UI, while backend provides async REST API with SQLModel ORM connecting to Neon PostgreSQL. All communication secured via shared secret (BETTER_AUTH_SECRET) with user_id verification on every request.

**Technical Approach**: Web application with separate frontend/backend services, JWT bridge for auth, RESTful API with user-scoped endpoints (/api/{user_id}/...), and mobile-first responsive UI.

## Technical Context

**Language/Version**:
- Frontend: TypeScript (Latest with strict mode)
- Backend: Python 3.11+

**Primary Dependencies**:
- Frontend: Next.js 16+ (App Router), Better Auth (JWT Plugin), Tailwind CSS
- Backend: FastAPI, SQLModel, python-jose or pyjwt, asyncpg

**Storage**: Neon Serverless PostgreSQL

**Testing**:
- Frontend: Jest + React Testing Library
- Backend: pytest + pytest-asyncio
- Contract: OpenAPI schema validation
- Integration: End-to-end with test database

**Target Platform**: Web (Linux/macOS server for backend, browser-based frontend)

**Project Type**: Web application (frontend + backend)

**Performance Goals**:
- Registration: <60 seconds (2 validations max)
- Login to dashboard: <3 seconds
- Task creation: <1 second response
- 100 concurrent users without degradation
- Database queries: <100ms (log slow queries)

**Constraints**:
- HTTPS required for production
- JWT expiration: 24 hours
- Task title: max 200 characters
- Task description: max 2000 characters
- Mobile viewport: 320px minimum width
- Browser support: Chrome, Firefox, Safari, Edge (last 2 versions)

**Scale/Scope**:
- Target: 100+ concurrent users
- Data: Multi-tenant with user isolation
- Sessions: Stateless (no server-side session storage)
- Deployment: Separate frontend/backend services

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Decoupled Architecture
- ✅ **PASS**: Frontend (Next.js) and Backend (FastAPI) are separate services
- ✅ **PASS**: Stateless API (no backend sessions, JWT-only auth)
- ✅ **PASS**: REST communication with Bearer tokens

### Principle II: Security First
- ✅ **PASS**: BETTER_AUTH_SECRET shared across services (environment variables)
- ✅ **PASS**: JWT verification with HS256 algorithm required
- ✅ **PASS**: User isolation enforced (user_id in JWT vs URL path check)
- ✅ **PASS**: Authorization enforcement (403 for mismatch, 401 for invalid token)
- ✅ **PASS**: API endpoint structure: `/api/{user_id}/...`

### Principle III: Code Quality Standards
- ✅ **PASS**: Backend type hints required (Python typing)
- ✅ **PASS**: Frontend TypeScript strict mode
- ✅ **PASS**: Async operations for all database access
- ✅ **PASS**: Pydantic models for request/response validation
- ✅ **PASS**: HTTPException with clear error messages
- ✅ **PASS**: API client abstraction (lib/api.ts)

### Principle IV: Test-Driven Development
- ✅ **PASS**: TDD required for all features (Red-Green-Refactor)
- ✅ **PASS**: Unit, integration, and contract tests specified

### Principle V: Data Integrity
- ✅ **PASS**: SQLModel for schema definition
- ✅ **PASS**: user_id indexed for query performance
- ✅ **PASS**: Timestamps (created_at, updated_at) automatic
- ✅ **PASS**: All queries filter by user_id
- ✅ **PASS**: Database migrations required for schema changes

### Principle VI: Development Workflow
- ✅ **PASS**: Phased approach (Database → Backend → Frontend → Integration)
- ✅ **PASS**: Follows constitution's 5-phase workflow

### Principle VII: Observability
- ✅ **PASS**: Structured logging required (user_id, endpoint, timestamp)
- ✅ **PASS**: Request tracing with IDs
- ✅ **PASS**: Sanitized user-facing errors
- ✅ **PASS**: Performance metrics (slow queries >100ms)

### Principle VIII: Simplicity & YAGNI
- ✅ **PASS**: Direct library usage (FastAPI, SQLModel, Better Auth)
- ✅ **PASS**: No unnecessary abstractions (repository patterns avoided)
- ✅ **PASS**: Mobile-first UI approach

**Constitution Compliance**: ✅ ALL GATES PASSED - No violations or exceptions required

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-app/
├── spec.md              # Feature specification
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (technology decisions)
├── data-model.md        # Phase 1 output (entity schemas)
├── quickstart.md        # Phase 1 output (developer setup guide)
├── contracts/           # Phase 1 output (API specifications)
│   └── api.openapi.yaml # OpenAPI 3.0 spec
├── checklists/          # Quality validation
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout (Server Component)
│   │   ├── page.tsx             # Landing page
│   │   ├── auth/
│   │   │   ├── signin/page.tsx  # Login page
│   │   │   └── signup/page.tsx  # Registration page
│   │   └── dashboard/
│   │       └── page.tsx         # Task dashboard (Client Component)
│   ├── components/
│   │   ├── task-list.tsx        # Task display component
│   │   ├── task-item.tsx        # Individual task component
│   │   ├── task-form.tsx        # Task creation/edit form
│   │   └── ui/                  # Reusable UI components
│   ├── lib/
│   │   ├── api.ts               # API client with JWT injection
│   │   ├── auth.ts              # Better Auth configuration
│   │   └── types.ts             # TypeScript interfaces
│   └── middleware.ts            # Route protection middleware
├── public/
├── tests/
│   ├── components/              # Component tests
│   └── integration/             # E2E tests
├── .env.local                   # Environment variables
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS configuration
└── package.json

backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI application entry
│   ├── models/
│   │   ├── __init__.py
│   │   ├── task.py              # Task SQLModel
│   │   └── user.py              # User SQLModel (Better Auth managed)
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── task.py              # Pydantic request/response models
│   │   └── auth.py              # JWT payload models
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py              # Dependencies (JWT verification, DB session)
│   │   └── routes/
│   │       ├── __init__.py
│   │       └── tasks.py         # Task CRUD endpoints
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py            # Settings (Pydantic BaseSettings)
│   │   ├── security.py          # JWT decode/verify utilities
│   │   └── database.py          # SQLModel engine, session management
│   └── utils/
│       ├── __init__.py
│       └── logging.py           # Structured logging setup
├── tests/
│   ├── conftest.py              # Pytest fixtures (test DB, client)
│   ├── unit/
│   │   ├── test_security.py    # JWT verification tests
│   │   └── test_models.py      # SQLModel validation tests
│   ├── integration/
│   │   └── test_tasks.py       # API endpoint tests
│   └── contract/
│       └── test_api_schema.py  # OpenAPI contract validation
├── alembic/                     # Database migrations
│   ├── versions/
│   └── env.py
├── .env                         # Environment variables
├── requirements.txt             # Python dependencies
├── pyproject.toml              # Python project configuration
└── pytest.ini                   # Pytest configuration
```

**Structure Decision**: Web application architecture selected based on frontend/backend separation requirement. Frontend and backend are independent services that communicate via REST API. This structure enables:
- Independent deployment and scaling
- Clear separation of concerns (UI vs API logic)
- Parallel development (frontend and backend teams)
- Technology-specific tooling (npm for frontend, pip for backend)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations detected. All principles satisfied:
- Decoupled architecture preserved (separate services)
- Security requirements met (JWT verification, user isolation)
- Code quality standards aligned (types, async, Pydantic)
- TDD methodology enforced
- Data integrity guaranteed (SQLModel, migrations)
- Phased workflow followed
- Observability built-in
- Simplicity maintained (direct library usage)

**Justification**: N/A - Full compliance with constitution
