---
id: 0003
title: Generate Task Breakdown for Todo App
stage: tasks
date: 2025-12-28
surface: agent
model: claude-opus-4-5-20251101
feature: 001-todo-app
branch: 001-todo-app
user: pc
command: /sp.tasks
labels: ["tasks", "tdd", "user-stories", "backend", "frontend", "fastapi", "nextjs"]
links:
  spec: specs/001-todo-app/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-todo-app/tasks.md
tests:
  - none
---

## Prompt

Task Execution List: Todo Full-Stack App

Task 1: Backend Foundation & Schema
- Initialize the FastAPI project structure in /backend
- Install dependencies: fastapi, sqlmodel, uvicorn, psycopg2-binary, python-jose[cryptography], python-dotenv
- Create database.py to initialize the Neon/SQLModel engine
- Create models.py defining the Todo class with id, user_id (indexed), title, description, and is_completed

Task 2: Security & JWT Middleware
- In auth.py, create a function verify_jwt(token: str) that decodes the JWT using BETTER_AUTH_SECRET
- Create a FastAPI dependency get_current_user that extracts the Bearer token, validates it, and returns the user_id
- Implement a "User Ownership" check to ensure path_user_id == token_user_id

Task 3: API Endpoint Implementation
- Implement GET /api/{user_id}/tasks with SQLModel select filtered by user_id
- Implement POST /api/{user_id}/tasks to create a new task assigned to that user
- Implement PUT and DELETE routes with ownership verification
- Implement PATCH /api/{user_id}/tasks/{id}/complete for the toggle functionality

Task 4: Frontend Auth & Client
- Initialize Next.js in /frontend and install better-auth
- Configure auth.ts to enable the JWT Plugin
- Create a lib/api-client.ts utility that uses authClient.getSession() to grab the JWT and set the Authorization header

Task 5: UI & Integration
- Build the LoginPage and SignupPage using Better Auth's core functions
- Build the Dashboard component with state management, "Add Task" form, and list display with "Toggle" and "Delete" icons
- Connect the Dashboard to the FastAPI backend using the API client

Task 6: Final Polish
- Add "Loading" states and basic error handling (toasts) for failed API calls
- Verify that refreshing the page maintains the session and re-fetches the list correctly

## Response snapshot

Successfully generated comprehensive task breakdown for Multi-User Todo Application on branch 001-todo-app.

**Task Organization**:
Created 90 tasks organized by 7 phases:
- Phase 1 (Setup): 9 tasks - Project initialization (frontend/backend directories, configs, env templates)
- Phase 2 (Foundational): 12 tasks - Core infrastructure blocking all user stories (database, JWT verification, CORS, logging, API client)
- Phase 3 (US1 - Authentication): 16 tasks - User registration, login, logout with JWT (6 TDD tests + 10 implementation)
- Phase 4 (US2 - Task CRUD): 21 tasks - Create and view tasks with user isolation (5 TDD tests + 16 implementation)
- Phase 5 (US3 - Completion): 8 tasks - Toggle task completion status (2 TDD tests + 6 implementation)
- Phase 6 (US4 - Edit/Delete): 12 tasks - Update and delete tasks (3 TDD tests + 9 implementation)
- Phase 7 (Polish): 12 tasks - Error handling, loading states, responsive design, security audit

**TDD Approach**:
Included 16 test tasks (constitution Principle IV mandates TDD):
- Unit tests: JWT verification, Task model validation
- Integration tests: Auth endpoints, Task CRUD endpoints
- Component tests: Signup/Signin pages, TaskForm, TaskList, TaskItem
- Contract tests: OpenAPI schema validation
- All tests must be written FIRST and FAIL before implementation

**Task Format Compliance**:
All 90 tasks follow strict checklist format:
- `- [ ] [TaskID] [P?] [Story?] Description with file path`
- 43 tasks marked [P] for parallel execution within phases
- All user story phase tasks tagged with [US1], [US2], [US3], or [US4]
- Exact file paths included (backend/app/models/task.py, frontend/src/components/task-list.tsx, etc.)

**User Story Mapping**:
- US1 (P1 - Authentication): Tasks T022-T037 - Better Auth integration, JWT verification, signup/signin pages
- US2 (P2 - Task CRUD): Tasks T038-T058 - Task model, GET/POST endpoints, TaskForm/TaskList components, dashboard
- US3 (P3 - Completion): Tasks T059-T066 - PATCH endpoint for toggle, checkbox UI, persistence
- US4 (P4 - Edit/Delete): Tasks T067-T078 - PUT/DELETE endpoints, edit mode, delete confirmation

**Independent Testing**:
Each user story has clear independent test criteria:
- US1: Complete signup → logout → login cycle
- US2: Create multiple tasks, verify list displays correctly with user isolation
- US3: Toggle completion, refresh page, verify state persists
- US4: Edit task details, delete task, verify changes/removal

**Parallel Opportunities**:
- Setup phase: All 9 tasks can run in parallel (different directories, no dependencies)
- Foundational: 8 of 12 tasks parallelizable (database, security, logging, API client)
- Within each user story: Test writing can be parallelized, model creation can be parallelized
- Cross-story: All 4 user stories can be developed in parallel after Foundational phase complete

**MVP Scope**:
Defined 37-task MVP (Phases 1-3):
- Phase 1: Setup (T001-T009)
- Phase 2: Foundational (T010-T021)
- Phase 3: US1 - Authentication (T022-T037)
- Delivers: Secure user registration, login, logout with JWT authentication
- Enables immediate deployment and user testing of auth flow

**Dependencies**:
- Setup → Foundational (blocking)
- Foundational → All User Stories (blocking)
- User Stories → Independent (can develop in parallel or priority order P1→P2→P3→P4)
- User Stories → Polish (polish depends on completed stories)

**Implementation Strategy**:
Documented 3 strategies:
1. MVP First: Setup + Foundational + US1 (37 tasks) → Deploy auth-only MVP
2. Incremental Delivery: Add one story at a time, deploy after each (MVP → +US2 → +US3 → +US4 → +Polish)
3. Parallel Team: 4 developers work on different user stories simultaneously after Foundational complete

**File Structure Alignment**:
Tasks map to plan.md structure:
- Backend: backend/app/{models,schemas,api,core,utils}/
- Frontend: frontend/src/{app,components,lib}/
- Tests: backend/tests/{unit,integration,contract}/, frontend/tests/components/
- Migrations: backend/alembic/versions/

## Outcome

- ✅ Impact: Generated 90 actionable tasks organized by user story with TDD approach for secure multi-user todo application
- 🧪 Tests: 16 TDD test tasks included (unit, integration, component, contract) - tests written BEFORE implementation
- 📁 Files: Created specs/001-todo-app/tasks.md (comprehensive task breakdown with dependencies, parallel execution examples, MVP strategy)
- 🔁 Next prompts: /sp.implement to execute task breakdown, or begin manual implementation following task order
- 🧠 Reflection: Task breakdown enables independent user story delivery (P1→P2→P3→P4). 43 tasks parallelizable for team collaboration. MVP scope (37 tasks) delivers auth foundation. TDD enforced per constitution. All tasks include exact file paths for immediate execution.

## Evaluation notes (flywheel)

- Failure modes observed: None - all tasks generated with proper format and user story mapping
- Graders run and results (PASS/FAIL): Format validation: PASS (all 90 tasks follow checklist format with checkbox, ID, labels, file paths)
- Prompt variant (if applicable): Standard task generation with TDD emphasis (constitution requirement)
- Next experiment (smallest change to try): N/A (task generation complete, ready for implementation via /sp.implement or manual execution)
