---
id: 0002
title: Create Implementation Plan for Todo App
stage: plan
date: 2025-12-28
surface: agent
model: claude-opus-4-5-20251101
feature: 001-todo-app
branch: 001-todo-app
user: pc
command: /sp.plan
labels: ["plan", "architecture", "fastapi", "nextjs", "jwt", "sqlmodel", "neon"]
links:
  spec: specs/001-todo-app/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-todo-app/plan.md
  - specs/001-todo-app/research.md
  - specs/001-todo-app/data-model.md
  - specs/001-todo-app/contracts/api.openapi.yaml
  - specs/001-todo-app/quickstart.md
tests:
  - none
---

## Prompt

Implementation Plan: Neon-FastAPI-Next-Todo

Phase 1: Environment & Database Setup
- Initialize Repository: Create a monorepo structure with /frontend and /backend directories.
- Neon Configuration: Set up the Neon PostgreSQL instance and retrieve the DATABASE_URL.
- Secret Management: Define a shared BETTER_AUTH_SECRET and DATABASE_URL in both /frontend/.env and /backend/.env.
- Backend Models: Define the Todo table using SQLModel with a specific index on user_id.

Phase 2: FastAPI Backend (The Secure API)
- JWT Dependency: Implement a Python utility to decode and verify JWTs using the shared secret. Verify alg="HS256". Extract sub (User ID).
- Auth Middleware: Create a FastAPI dependency that ensures the {user_id} in the URL matches the sub in the JWT.
- CRUD Endpoints: Implement the 6 RESTful routes (GET, POST, PUT, DELETE, PATCH). Ensure all database queries include a .where(Todo.user_id == authenticated_user_id) clause.
- CORS Configuration: Allow the Next.js origin to communicate with the FastAPI server.

Phase 3: Frontend & Authentication
- Next.js Setup: Initialize Next.js 16+ with Tailwind CSS and Lucide icons for the UI.
- Better Auth Integration: Configure Better Auth with the JWT Plugin. Ensure the token is accessible for API calls.
- API Client: Build a fetch wrapper or Axios instance that targets the FastAPI base URL and automatically pulls the JWT from the session and adds it to the Authorization header.

Phase 4: UI Development & Integration
- Auth Pages: Create Signup and Signin pages using Better Auth.
- Todo Dashboard: Display: Fetch tasks on mount/session load. Mutations: Implement "Add," "Toggle," and "Delete" with optimistic UI updates for a snappy feel.
- Protected Routes: Use Next.js Middleware to redirect unauthenticated users to the login page.

Phase 5: Validation & Testing
- Security Audit: Attempt to access User B's tasks using User A's token to ensure the backend throws a 403 Forbidden.
- Persistence Check: Verify that data persists correctly in the Neon database after page refreshes.
- Responsiveness: Test the UI on mobile and desktop viewports.

Verification Checklist for the AI Agent:
- Is the BETTER_AUTH_SECRET identical in both services?
- Does the Python backend strictly use SQLModel?
- Is every single FastAPI endpoint protected by the JWT dependency?
- Is the JWT plugin explicitly enabled in the Better Auth configuration?

## Response snapshot

Successfully created comprehensive implementation plan for Multi-User Todo Application on branch 001-todo-app.

**Plan Overview**:
Created complete technical plan with:
- Technical Context: Python 3.11+, TypeScript, FastAPI, Next.js 16+, SQLModel, Neon PostgreSQL
- Performance Goals: <60s registration, <3s login, <1s task creation, 100 concurrent users
- Constitution Check: ✅ ALL 8 PRINCIPLES PASSED (no violations or exceptions required)
- Project Structure: Web app architecture (frontend/ + backend/ directories) with detailed file tree
- Complexity Tracking: Full compliance - no constitution violations to justify

**Phase 0 - Research (research.md)**:
Documented technology stack decisions with rationale:
- Next.js 16+ App Router (Server/Client Component separation)
- Better Auth with JWT Plugin (HS256, 24-hour expiration)
- FastAPI (async/await, Pydantic validation)
- SQLModel (Pydantic + SQLAlchemy hybrid)
- Neon Serverless PostgreSQL (auto-scaling, connection pooling)
- python-jose (JWT encoding/decoding with HS256)
- Tailwind CSS (mobile-first, utility classes)
- Testing: pytest + Jest + OpenAPI schema validation

Key patterns documented:
- JWT Verification Dependency (two-stage: authentication → authorization)
- API Client with automatic token injection
- Database query pattern (always filter by user_id)
- Security considerations (shared secret generation, CORS, input validation)

**Phase 1 - Design**:

1. **Data Model (data-model.md)**:
   - User entity: id (PK), email (unique, indexed), password_hash, email_verified, timestamps
   - Task entity: id (PK), user_id (FK, indexed), title (1-200 chars), description (optional, max 2000), is_completed (bool), timestamps
   - JWT Token (logical): sub, iat, exp (24h expiration)
   - Relationships: 1 User → N Tasks (CASCADE delete)
   - Indexes: user_id (critical for query performance), user_id+created_at (sorting), user_id+is_completed (filtering)
   - Pydantic schemas: TaskCreate, TaskUpdate, TaskResponse with validators
   - Database migrations: Alembic with initial schema migration
   - Validation rules: title non-empty after trim, description max length, automatic timestamps
   - State transitions: Created (incomplete) ⇄ Complete (toggle via PATCH)

2. **API Contracts (contracts/api.openapi.yaml)**:
   - OpenAPI 3.0 specification with 6 endpoints
   - GET /api/{user_id}/tasks - List all tasks
   - POST /api/{user_id}/tasks - Create task
   - GET /api/{user_id}/tasks/{task_id} - Get task details
   - PUT /api/{user_id}/tasks/{task_id} - Update task
   - DELETE /api/{user_id}/tasks/{task_id} - Delete task
   - PATCH /api/{user_id}/tasks/{task_id}/complete - Toggle completion
   - Security: Bearer JWT authentication on all endpoints
   - Error responses: 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 422 (validation)
   - Schemas: Task, TaskCreate, TaskUpdate, Error, ValidationError
   - Complete examples for all request/response bodies

3. **Quickstart Guide (quickstart.md)**:
   - Prerequisites: Node.js 18+, Python 3.11+, Git
   - Step-by-step setup (8 steps):
     1. Clone repository
     2. Database setup (Neon project creation, connection string)
     3. Generate shared secret (openssl rand -hex 32)
     4. Backend setup (venv, pip install, .env, alembic upgrade)
     5. Frontend setup (npm install, .env.local, Better Auth config)
     6. Integration test (create user, create task, verify logs/database)
     7. Development workflow (starting services, environment validation)
     8. Running tests (pytest, npm test)
   - Common issues & solutions (5 scenarios with troubleshooting steps)
   - Project structure reference
   - Environment variables summary (backend + frontend)
   - Security checklist for production deployment
   - Resources and support information

**Architecture Highlights**:
- Decoupled frontend/backend (separate services, REST communication)
- Stateless JWT authentication (no server-side sessions)
- User isolation at routing level (/api/{user_id}/...) and database level (WHERE user_id = ?)
- Async operations throughout backend (FastAPI + SQLModel async)
- Type safety on both sides (TypeScript strict mode + Python type hints)
- Mobile-first responsive design (Tailwind CSS, 320px+ viewport)

**Security Architecture**:
- Shared BETTER_AUTH_SECRET (64-char hex, identical in both services)
- JWT verification dependency (extracts sub, validates HS256 signature)
- Authorization enforcement (JWT user_id must match URL {user_id} parameter)
- CORS restricted to frontend origin only
- Password hashing (bcrypt/argon2 via Better Auth)
- Input validation (Pydantic models + database constraints)
- Sanitized error messages (no stack traces exposed to users)

**Performance Strategy**:
- Indexed user_id for O(log n) query performance
- Connection pooling (size=20, max_overflow=10)
- Neon auto-scaling for concurrent connections
- Optimistic UI updates (frontend)
- Structured logging with slow query detection (>100ms)

## Outcome

- ✅ Impact: Created complete implementation plan with Phase 0 (research) and Phase 1 (design) artifacts for secure multi-user todo application
- 🧪 Tests: No tests created (planning phase only)
- 📁 Files: Created plan.md (222 lines), research.md (design decisions), data-model.md (entity schemas), contracts/api.openapi.yaml (OpenAPI 3.0 spec), quickstart.md (developer setup guide)
- 🔁 Next prompts: /sp.tasks to generate actionable task breakdown for implementation, /sp.implement to execute tasks
- 🧠 Reflection: Plan achieves full constitution compliance (all 8 principles passed). Architecture balances security (JWT verification, user isolation) with simplicity (direct library usage, no unnecessary abstractions). Comprehensive documentation enables independent frontend/backend development. Ready for task generation and implementation.

## Evaluation notes (flywheel)

- Failure modes observed: None - plan completed with full constitution compliance
- Graders run and results (PASS/FAIL): Constitution Check: PASS (8/8 principles), Project Structure: PASS (web app pattern), Complexity Tracking: PASS (no violations)
- Prompt variant (if applicable): Standard plan generation with user-provided phased implementation guidance
- Next experiment (smallest change to try): N/A (planning complete, proceed to task generation via /sp.tasks)
