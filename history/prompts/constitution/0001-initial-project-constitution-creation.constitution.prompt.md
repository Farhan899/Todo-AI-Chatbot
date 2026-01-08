---
id: 0001
title: Initial Project Constitution Creation
stage: constitution
date: 2025-12-28
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: master
user: pc
command: /sp.constitution
labels: ["constitution", "architecture", "security", "tdd", "fastapi", "nextjs", "neon", "jwt"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

Project Constitution: Spec-Driven Todo Full-Stack App

1. Project Identity & Goal
   Project Name: Neon-FastAPI-Next-Todo
   Role: Senior Full-Stack Architect & Developer
   Objective: Build a robust, multi-user Todo application using a specific high-performance stack. The system relies on a decoupled architecture where Next.js handles the UI and Authentication (via Better Auth), while Python FastAPI serves as a stateless REST API secured via JWT.

2. Technology Stack (Strict)
   Frontend: Next.js 16+ (App Router), TypeScript, Tailwind CSS.
   Backend: Python FastAPI (Async).
   Database: Neon Serverless PostgreSQL.
   ORM: SQLModel (Pydantic + SQLAlchemy).
   Authentication: Better Auth (Frontend generation) + JWT Verification (Backend validation).
   Tooling: Claude Code + Spec-Kit Plus.

3. Architecture & Security Protocol
   The Authentication Bridge (Critical)
   The application uses a Stateless JWT Flow. The Frontend and Backend are decoupled but share a trust relationship via a BETTER_AUTH_SECRET.

   Shared Secret: Both Next.js (env: BETTER_AUTH_SECRET) and FastAPI (env: BETTER_AUTH_SECRET) must use the exact same string.

   Frontend Responsibility:
   - Uses Better Auth to sign up/sign in users.
   - Configured with the JWT Plugin to issue tokens.
   - Retrieves the JWT session token.
   - Attaches Authorization: Bearer <token> to every request sent to the FastAPI backend.

   Backend Responsibility:
   - Middleware/Dependency: Implements a security dependency that extracts the Bearer token.
   - Verification: Decodes the JWT using the shared BETTER_AUTH_SECRET (HS256).
   - User Extraction: Extracts the sub (User ID) from the token payload.
   - Enforcement: Compare the Token User ID against the URL {user_id} parameter. If they do not match, return 403 Forbidden. If token is invalid, return 401 Unauthorized.

4. Database Schema (SQLModel)
   The database must utilize SQLModel.
   Table: Todo
   - id: UUID or Integer (Primary Key)
   - user_id: String (Indexed, Foreign Key conceptually linking to Auth User)
   - title: String
   - description: String (Optional)
   - is_completed: Boolean (Default: False)
   - created_at: DateTime (Default: now)
   - updated_at: DateTime

5. API Contract (REST)
   All endpoints are prefixed with /api/{user_id} to enforce user isolation.

   | Method | Endpoint | Description | Auth Required |
   |--------|----------|-------------|---------------|
   | GET | /api/{user_id}/tasks | List all tasks for specific user | Yes |
   | POST | /api/{user_id}/tasks | Create a new task | Yes |
   | GET | /api/{user_id}/tasks/{id} | Get task details | Yes |
   | PUT | /api/{user_id}/tasks/{id} | Update task details | Yes |
   | DELETE | /api/{user_id}/tasks/{id} | Delete a task | Yes |
   | PATCH | /api/{user_id}/tasks/{id}/complete | Toggle completion status | Yes |

6. Implementation Rules
   Frontend (Next.js):
   - Client/Server Split: Use Server Components for initial layout/data pre-fetching (if applicable via server-side API calls), but standard Client Components ("use client") for the Task Dashboard to handle real-time UI updates (toggling checkboxes, deleting).
   - API Client: Create a dedicated API helper (e.g., lib/api.ts) that automatically injects the current session token into headers.
   - Styling: Responsive UI using Tailwind CSS. Mobile-first design.

   Backend (FastAPI):
   - Async: All database operations must be async.
   - Typing: Use strict Python type hints and Pydantic models for all Request/Response schemas.
   - Error Handling: Raise HTTPException with clear detail messages for 404 (Not Found) or 401/403 (Auth issues).
   - CORS: Configure CORS to allow requests strictly from the Next.js frontend origin.

7. Step-by-Step Execution Plan
   - Database: Initialize Neon project and configure DATABASE_URL. Setup SQLModel.
   - Backend Core: Setup FastAPI, CORS, and the JWT Verification Dependency (using python-jose or pyjwt).
   - Backend CRUD: Implement the 6 endpoints defined in the API Contract.
   - Frontend Setup: Initialize Next.js + Better Auth + JWT Plugin.
   - Integration: Build the Frontend Task Dashboard and connect it to the FastAPI endpoints.

## Response snapshot

Constitution successfully created at .specify/memory/constitution.md (Version 1.0.0)

Created comprehensive constitution with 8 core principles:
1. Decoupled Architecture - Frontend/Backend separation with stateless API
2. Security First - JWT authentication and authorization enforcement
3. Code Quality Standards - Type safety, async operations, error handling
4. Test-Driven Development - TDD mandatory for all features
5. Data Integrity - Database schema and migration management
6. Development Workflow - Phased implementation approach
7. Observability - Logging, monitoring, and debugging requirements
8. Simplicity & YAGNI - Start simple, avoid over-engineering

Added mandatory Technology Stack section defining exact versions and purposes for:
- Frontend: Next.js 16+, TypeScript, Tailwind CSS, Better Auth
- Backend: FastAPI, Python 3.11+, SQLModel
- Database: Neon PostgreSQL Serverless
- Auth: JWT (HS256) with shared secret

Added Development Workflow section with:
- Complete API Contract (6 REST endpoints with /api/{user_id} pattern)
- Request/Response standards (content types, status codes, error formats)
- Implementation rules for both frontend and backend

Added Governance section with:
- Constitution authority and amendment process
- Compliance review requirements
- Semantic versioning policy (MAJOR.MINOR.PATCH)
- Reference to CLAUDE.md for runtime guidance

Sync Impact Report included at top of file showing:
- Template compatibility validation
- No breaking changes to existing templates
- All placeholders resolved

## Outcome

- ✅ Impact: Initial constitution created defining 8 core principles, mandatory tech stack, API contract, and governance rules for Neon-FastAPI-Next-Todo project
- 🧪 Tests: No tests created (constitution document only)
- 📁 Files: Created .specify/memory/constitution.md (v1.0.0, 248 lines)
- 🔁 Next prompts: /sp.specify to create feature specification, /sp.plan for implementation planning
- 🧠 Reflection: Constitution establishes strict security requirements (JWT verification, user isolation), TDD methodology, and phased implementation workflow. All principles are non-negotiable and traceable to rationale.

## Evaluation notes (flywheel)

- Failure modes observed: None - all placeholders successfully resolved from user input
- Graders run and results (PASS/FAIL): N/A (no automated graders for constitution)
- Prompt variant (if applicable): Standard constitution creation with comprehensive user input
- Next experiment (smallest change to try): N/A (initial constitution complete, await feature specifications)
