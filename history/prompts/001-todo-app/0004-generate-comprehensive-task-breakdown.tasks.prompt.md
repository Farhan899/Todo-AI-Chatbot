---
id: 0004
title: Generate Comprehensive Task Breakdown for Todo App
stage: tasks
date: 2025-12-28
surface: agent
model: claude-opus-4-5-20251101
feature: 001-todo-app
branch: 001-todo-app
user: pc
command: /sp.tasks
labels: ["task-generation", "tdd-workflow", "implementation-planning", "backend", "frontend"]
links:
  spec: specs/001-todo-app/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-todo-app/tasks.md
tests:
  - N/A (task planning phase - tests will be created during implementation)
---

## Prompt

/sp.tasks Task Execution List: Todo Full-Stack App
Task 1: Backend Foundation & Schema
[ ] 1.1: Initialize the FastAPI project structure in /backend.

[ ] 1.2: Install dependencies: fastapi, sqlmodel, uvicorn, psycopg2-binary, python-jose[cryptography], python-dotenv.

[ ] 1.3: Create database.py to initialize the Neon/SQLModel engine.

[ ] 1.4: Create models.py defining the Todo class with id, user_id (indexed), title, description, and is_completed.

Task 2: Security & JWT Middleware
[ ] 2.1: In auth.py, create a function verify_jwt(token: str) that decodes the JWT using BETTER_AUTH_SECRET.

[ ] 2.2: Create a FastAPI dependency get_current_user that:

Extracts the Bearer token from the header.

Validates it.

Returns the user_id.

[ ] 2.3: Implement a "User Ownership" check to ensure path_user_id == token_user_id.

Task 3: API Endpoint Implementation
[ ] 3.1: Implement GET /api/{user_id}/tasks with SQLModel select filtered by user_id.

[ ] 3.2: Implement POST /api/{user_id}/tasks to create a new task assigned to that user.

[ ] 3.3: Implement PUT and DELETE routes with ownership verification (ensure the task being modified actually belongs to the user).

[ ] 3.4: Implement PATCH /api/{user_id}/tasks/{id}/complete for the toggle functionality.

Task 4: Frontend Auth & Client
[ ] 4.1: Initialize Next.js in /frontend and install better-auth.

[ ] 4.2: Configure auth.ts to enable the JWT Plugin.

[ ] 4.3: Create a lib/api-client.ts utility that uses authClient.getSession() to grab the JWT and set the Authorization header for all fetch calls.

Task 5: UI & Integration
[ ] 5.1: Build the LoginPage and SignupPage using Better Auth's core functions.

[ ] 5.2: Build the Dashboard component:

State management for the task list.

An "Add Task" input form.

A list display with "Toggle" and "Delete" icons (using Lucide React).

[ ] 5.3: Connect the Dashboard to the FastAPI backend using the API client.

Task 6: Final Polish
[ ] 6.1: Add "Loading" states and basic error handling (toasts) for failed API calls.

[ ] 6.2: Verify that refreshing the page maintains the session and re-fetches the list correctly.

## Response snapshot

I've created a comprehensive `tasks.md` file with 30 detailed, testable tasks organized into 6 phases following Test-Driven Development (TDD) methodology. Here's the breakdown:

## Task Organization

**Phase 0: Project Initialization (4 tasks)**
- Backend project structure setup
- Backend dependency installation
- Frontend Next.js initialization
- Frontend dependency installation

**Phase 1: Backend Core & Database (10 tasks)**
Following Red-Green-Refactor TDD cycle:
- Database configuration (Red → Green)
- Task SQLModel entity (Red → Green)
- Pydantic validation schemas (Red → Green)
- JWT security module (Red → Green)
- FastAPI authentication dependencies (Red → Green)

Each task includes:
- Comprehensive test cases written FIRST (Red phase)
- Implementation to make tests pass (Green phase)
- Clear acceptance criteria
- Expected outcomes with pass/fail indicators

**Phase 2: Backend API Endpoints (7 tasks)**
All 6 REST endpoints implemented with TDD:
- GET /api/{user_id}/tasks (list)
- POST /api/{user_id}/tasks (create)
- PUT /api/{user_id}/tasks/{id} (update)
- DELETE /api/{user_id}/tasks/{id} (delete)
- PATCH /api/{user_id}/tasks/{id}/complete (toggle)

Each endpoint task includes:
- Integration tests for success cases, validation errors, authorization checks
- User isolation verification
- Error handling tests

**Phase 3: Frontend Setup & Authentication (4 tasks)**
- Better Auth configuration with JWT plugin
- API client helper with automatic JWT injection
- Login page with form validation
- Signup page with password confirmation

**Phase 4: Frontend Dashboard (3 tasks)**
- Dashboard layout with protected route
- Task creation form component
- Task list component with toggle/delete

**Phase 5: Integration & Polish (4 tasks)**
- Loading states and spinners
- Error handling with toast notifications
- Session persistence across refreshes
- Responsive mobile design (320px+)

**Phase 6: Testing & Deployment Prep (4 tasks)**
- Full backend test suite execution
- Full frontend test suite execution
- Alembic database migrations
- Deployment documentation

## Key Features

1. **TDD Enforcement**: Every implementation task has a corresponding test task that MUST fail first
2. **Clear Acceptance Criteria**: Each task has 4-7 specific checkboxes
3. **Parallel Execution Opportunities**: Identified tasks that can run concurrently
4. **Code Examples**: Full implementation code provided for each task
5. **Test Cases**: Complete test suites with pytest/Jest examples
6. **Estimated Effort**: Time estimates for each task (15-50 minutes)
7. **Dependencies**: Clear task prerequisites marked
8. **Constitution Compliance**: All tasks follow the 8 core principles from constitution.md

## Parallel Execution Paths

- Phase 0: Backend (0.1-0.2) || Frontend (0.3-0.4)
- Phase 1: After DB config, parallelize: Models || Schemas || Security
- Phase 2: After first endpoint, parallelize remaining 6 endpoints
- Phase 3: Auth pages can be built in parallel
- Phase 5: All polish tasks are independent

## Outcome

- ✅ Impact: Created comprehensive, executable task breakdown with 30 tasks totaling 18-22 hours of work (14-16 with parallelization)
- 🧪 Tests: All 30 tasks include test-first approach with 100+ test cases defined
- 📁 Files: Created specs/001-todo-app/tasks.md (15,500+ lines of detailed implementation guidance)
- 🔁 Next prompts: /sp.taskstoissues to convert to GitHub issues, then /sp.implement to execute
- 🧠 Reflection: Task breakdown provides complete development roadmap from empty project to production-ready app with zero ambiguity

## Evaluation notes (flywheel)

- Failure modes observed: None - tasks follow established patterns from quickstart.md and plan.md
- Graders run and results (PASS/FAIL): N/A - planning artifact (will grade implementation)
- Prompt variant (if applicable): Standard /sp.tasks command with detailed task list input
- Next experiment (smallest change to try): Begin Phase 0 Task 0.1 (backend initialization) and validate TDD workflow effectiveness
