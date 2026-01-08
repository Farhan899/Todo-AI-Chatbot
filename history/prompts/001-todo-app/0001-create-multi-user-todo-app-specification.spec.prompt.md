---
id: 0001
title: Create Multi-User Todo App Specification
stage: spec
date: 2025-12-28
surface: agent
model: claude-opus-4-5-20251101
feature: 001-todo-app
branch: 001-todo-app
user: pc
command: /sp.specify
labels: ["spec", "authentication", "todo", "multi-user", "jwt", "crud"]
links:
  spec: specs/001-todo-app/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-todo-app/spec.md
  - specs/001-todo-app/checklists/requirements.md
tests:
  - none
---

## Prompt

Project Specification: Neon-FastAPI-Next-Todo

1. Project Overview
   Name: neon-fastapi-next-todo
   Type: Full-Stack Web Application
   Goal: Build a secure, user-isolated Todo application. The system decouples the Frontend (Next.js) from the Backend (Python FastAPI) but secures the connection using a shared-secret JWT flow via Better Auth.

2. Technology Stack
   Frontend: Next.js 16+ (App Router), TypeScript, Tailwind CSS
   Authentication: Better Auth (running on Next.js) with JWT Plugin enabled
   Backend: Python FastAPI (Async), Pydantic
   Database: Neon Serverless PostgreSQL
   ORM: SQLModel (SQLAlchemy + Pydantic)
   Environment Management: .env files sharing BETTER_AUTH_SECRET across services

3. The Constitution (System Invariants)
   These rules must be strictly followed during code generation and architecture planning.

   Rule 1: The "Stateless Bridge" Authentication Strategy
   We are bridging a Node.js Auth library with a Python Backend without shared sessions.
   - Frontend: Better Auth handles the UI and user management. It must be configured to issue a JWT token upon login.
   - Transmission: The Frontend must attach the JWT to every request sent to the Python backend via the Authorization: Bearer <token> header.
   - Backend: FastAPI must have a generic Dependency/Middleware that:
     * Decodes the JWT using the shared BETTER_AUTH_SECRET.
     * Validates the signature (HS256).
     * Extracts the sub (User ID).
     * Crucial: Rejects the request (403) if the sub in the token does not match the {user_id} in the requested URL path.

   Rule 2: API Contract & User Isolation
   All API routes must be prefixed with /api/{user_id}/ to enforce ownership at the routing level.
   - GET /api/{user_id}/tasks (List)
   - POST /api/{user_id}/tasks (Create)
   - GET /api/{user_id}/tasks/{id} (Read Detail)
   - PUT /api/{user_id}/tasks/{id} (Update)
   - DELETE /api/{user_id}/tasks/{id} (Delete)
   - PATCH /api/{user_id}/tasks/{id}/complete (Toggle Status)

   Rule 3: Database & ORM
   - Use SQLModel for defining the schema.
   - The Todo table must include a user_id column (indexed) to allow efficient filtering by user.
   - Database connection string must be loaded from DATABASE_URL (Neon connection).

4. Feature Requirements
   Core Features:
   - Add Task: Create a task with title and optional description.
   - View List: Fetch and display tasks, strictly filtered by the logged-in user.
   - Update Task: Edit task details.
   - Delete Task: Remove a task permanently.
   - Mark Complete: Toggle the is_completed boolean.

   Frontend UI:
   - Responsive layout using Tailwind CSS.
   - Login/Signup page using Better Auth components.
   - Protected Dashboard route (redirects to Login if no session exists).

5. Directory Structure Preference
   frontend/: Next.js application
   backend/: FastAPI application
   - app/models.py: SQLModel definitions
   - app/auth.py: JWT verification logic
   - app/main.py: App entry point and route definitions
   - app/database.py: Neon connection logic

## Response snapshot

Successfully created feature specification for Multi-User Todo Application on branch 001-todo-app.

Specification includes:
- 4 prioritized user stories (P1: Authentication, P2: Task Creation/Viewing, P3: Completion Tracking, P4: Editing/Deletion)
- Each user story is independently testable and deliverable as MVP increment
- 23 functional requirements organized by category (Authentication, Task Management, Data Isolation, UI)
- 3 key entities defined (User, Task, JWT Token)
- 8 measurable success criteria (technology-agnostic, user-focused)
- 7 edge cases covering security, availability, and error scenarios
- 9 assumptions documented (browser support, connectivity, future features)

Quality validation checklist created at specs/001-todo-app/checklists/requirements.md:
- All validation items passed (content quality, requirement completeness, feature readiness)
- No [NEEDS CLARIFICATION] markers remain
- Requirements are testable and unambiguous
- Success criteria are measurable and technology-agnostic
- Specification ready for /sp.plan phase

Key architectural requirements captured:
- JWT-based stateless authentication with shared secret
- User isolation enforced at API routing level (/api/{user_id}/)
- Strict authorization checks (token user_id must match URL user_id)
- HTTPS for production, password hashing, input validation

## Outcome

- ✅ Impact: Created comprehensive feature specification defining 4 user stories, 23 functional requirements, and 8 success criteria for secure multi-user todo application
- 🧪 Tests: No tests created (specification phase only)
- 📁 Files: Created specs/001-todo-app/spec.md (158 lines), specs/001-todo-app/checklists/requirements.md (quality validation)
- 🔁 Next prompts: /sp.plan to create implementation plan with technical architecture, /sp.clarify if any requirements need refinement
- 🧠 Reflection: Specification successfully balances business requirements with security constraints. User isolation and JWT verification requirements are clearly defined without leaking implementation details. Prioritized user stories enable incremental delivery (P1 auth → P2 CRUD → P3 completion → P4 editing).

## Evaluation notes (flywheel)

- Failure modes observed: None - specification completed without clarification needs
- Graders run and results (PASS/FAIL): Quality checklist validation: PASS (all 16 items satisfied)
- Prompt variant (if applicable): Standard specification creation with detailed security requirements
- Next experiment (smallest change to try): N/A (specification complete and validated, ready for planning phase)
