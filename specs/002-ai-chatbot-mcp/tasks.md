# Implementation Tasks: AI-Powered Todo Chatbot with MCP Architecture

**Feature Branch**: `002-ai-chatbot-mcp`
**Created**: 2026-01-07
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## Task Organization

Tasks are organized by implementation phase with clear dependencies. Each task includes:
- **Objective**: What needs to be done
- **Acceptance Criteria**: Testable conditions for completion
- **Dependencies**: Must-complete-first tasks
- **Test Coverage**: Unit/Integration/Contract test requirements
- **Estimated Effort**: Relative complexity (S/M/L)

---

## Phase 1: Database & Stateless Chat API

### Task 1.1: Design Database Schema (SQLModel Models)
**Objective**: Define Conversation, Message, and Task SQLModel entities with proper relationships and validation.

**Acceptance Criteria**:
- ✅ Conversation entity with id (UUID), user_id (String), created_at, updated_at
- ✅ Message entity with id (UUID), conversation_id (FK), user_id, sender ("user"/"assistant"), content (Text), tool_calls (JSON), created_at
- ✅ Task entity with id (UUID), user_id (indexed), title, description (optional), is_completed (Boolean), created_at, updated_at
- ✅ All entities have user_id indexed for query performance
- ✅ Field validators enforce constraints (title not empty, user_id matches JWT)
- ✅ SQLModel models importable and testable in isolation

**Dependencies**: None

**Test Coverage**:
- Unit tests: Entity instantiation, field validation, relationship integrity
- No database required (SQLModel validation only)

**Effort**: S (Small)

---

### Task 1.2: Create Alembic Migrations
**Objective**: Generate and test database migration scripts to create all tables with proper indexes and constraints.

**Acceptance Criteria**:
- ✅ Alembic initialized in project root
- ✅ Migration script 001_initial_schema.py creates Conversations, Messages, Tasks tables
- ✅ Indexes created: (user_id) on all tables; (conversation_id) on Messages
- ✅ Foreign key constraints enforced (conversation_id → Conversation)
- ✅ Migration up/down tested against Neon PostgreSQL
- ✅ Schema verified with `alembic current` and `alembic history`

**Dependencies**: Task 1.1 (SQLModel models)

**Test Coverage**:
- Integration test: Apply migration to test database, verify schema
- Integration test: Rollback migration, verify clean state

**Effort**: M (Medium)

---

### Task 1.3: Implement JWT Verification Handler
**Objective**: Create FastAPI dependency for JWT token validation and user_id extraction.

**Acceptance Criteria**:
- ✅ JWT decoded using HS256 algorithm with BETTER_AUTH_SECRET
- ✅ Token expiration validated
- ✅ user_id extracted from JWT 'sub' claim
- ✅ Dependency validates URL parameter user_id matches token user_id
- ✅ Returns 401 for invalid/expired tokens
- ✅ Returns 403 if URL user_id ≠ token user_id
- ✅ Raises HTTPException with clear error messages (no internal details)

**Dependencies**: None

**Test Coverage**:
- Unit tests: Valid token, expired token, invalid signature, user_id mismatch
- Unit tests: Dependency injection in FastAPI context

**Effort**: S (Small)

---

### Task 1.4: Implement Conversation Service
**Objective**: Create service to load conversation history from database and persist messages atomically.

**Acceptance Criteria**:
- ✅ Load conversation by conversation_id with full message history ordered by created_at
- ✅ Create new conversation with unique UUID if conversation_id is null
- ✅ Persist user message with timestamp
- ✅ Persist assistant message with timestamp and optional tool_calls JSON
- ✅ All operations are async (async/await)
- ✅ User isolation enforced: conversation_id must belong to authenticated user_id
- ✅ Atomic persistence (both messages saved or neither)

**Dependencies**: Task 1.1 (SQLModel models), Task 1.2 (migrations)

**Test Coverage**:
- Unit tests: Load existing conversation, create new conversation, persist messages
- Integration tests: Full round-trip with test database

**Effort**: M (Medium)

---

### Task 1.5: Implement Stateless Chat Endpoint
**Objective**: Create FastAPI endpoint POST `/api/{user_id}/chat` for stateless message processing.

**Acceptance Criteria**:
- ✅ Endpoint accepts conversation_id (optional), message (required), include_context (optional)
- ✅ JWT verification applied (Task 1.3 dependency)
- ✅ Conversation history loaded (Task 1.4 dependency)
- ✅ Placeholder: calls agent service (implemented in Phase 3)
- ✅ Returns JSON: conversation_id, assistant_message, tool_calls array
- ✅ Persists both messages atomically
- ✅ Returns 401/403 for auth failures
- ✅ Returns 400 for invalid input
- ✅ No server-side session state (stateless verified)

**Dependencies**: Task 1.3 (JWT), Task 1.4 (conversation service)

**Test Coverage**:
- Unit tests: Request/response validation, JWT enforcement
- Integration tests: Full stateless flow (fresh instance produces same results)
- Integration tests: User isolation (cannot access other user's conversation)

**Effort**: M (Medium)

---

### Task 1.6: Implement Structured Logging
**Objective**: Create structured logger for agent decisions, tool calls, and errors.

**Acceptance Criteria**:
- ✅ Logs formatted as JSON with fields: timestamp, level, user_id, conversation_id, message, context
- ✅ Log agent decisions: intent extraction, tool calls
- ✅ Log tool execution: tool name, parameters, result, latency
- ✅ Log errors: full context without exposing secrets
- ✅ Logs include request IDs or conversation_id for tracing
- ✅ Logs can be piped to file or stdout

**Dependencies**: None

**Test Coverage**:
- Unit tests: Log format, field presence, secret scrubbing

**Effort**: S (Small)

---

## Phase 2: Task MCP Server

### Task 2.1: Design MCP Tool Schemas
**Objective**: Define OpenAPI/JSON schemas for 6 Task MCP tools with parameters and responses.

**Acceptance Criteria**:
- ✅ add_task: parameters (user_id, title, description), returns (task object)
- ✅ list_tasks: parameters (user_id), returns (array of tasks)
- ✅ get_task: parameters (user_id, task_id), returns (task object)
- ✅ update_task: parameters (user_id, task_id, title, description), returns (task object)
- ✅ delete_task: parameters (user_id, task_id), returns (success message)
- ✅ complete_task: parameters (user_id, task_id), returns (task object)
- ✅ All tools specify error codes (404 not found, 403 unauthorized, 400 invalid input)
- ✅ Schemas published in contracts/task_mcp_schema.json

**Dependencies**: Task 1.1 (SQLModel models)

**Test Coverage**:
- Unit tests: Schema validation, parameter types

**Effort**: S (Small)

---

### Task 2.2: Implement Task MCP Server
**Objective**: Create Python MCP server with 6 tools implementing full CRUD with ownership validation.

**Acceptance Criteria**:
- ✅ Server exposes 6 tools via MCP protocol
- ✅ All tools validate user_id ownership before returning/mutating
- ✅ add_task creates task with UUID id, created_at, is_completed=False
- ✅ list_tasks returns all tasks for user_id ordered by created_at desc
- ✅ get_task returns single task or 404 if not found or unauthorized
- ✅ update_task modifies title/description, returns updated task
- ✅ delete_task removes task from database
- ✅ complete_task toggles is_completed flag, returns updated task
- ✅ Idempotent: completing already-completed task succeeds
- ✅ All operations are async
- ✅ Error messages clear and user-friendly (no internal details)

**Dependencies**: Task 1.1 (SQLModel), Task 1.2 (migrations), Task 2.1 (schemas)

**Test Coverage**:
- Unit tests: Each tool in isolation with mock database
- Integration tests: Each tool with real test database
- Contract tests: Ownership validation, 403 for unauthorized, 404 for not found
- Contract tests: Idempotent operations

**Effort**: L (Large)

---

### Task 2.3: Create MCP Server Docker Container
**Objective**: Package Task MCP server as Docker image for deployment.

**Acceptance Criteria**:
- ✅ Dockerfile for mcp_servers/task_mcp with Python 3.11+
- ✅ Dependencies installed from requirements.txt
- ✅ Server runs on startup, exposes MCP endpoint
- ✅ Environment variables for DATABASE_URL, BETTER_AUTH_SECRET
- ✅ Image builds successfully and runs in isolation
- ✅ Health check endpoint responds (or similar verification)

**Dependencies**: Task 2.2 (Task MCP server)

**Test Coverage**:
- Integration test: Docker image builds, container runs, responds to requests

**Effort**: S (Small)

---

## Phase 3: OpenAI Agents SDK Integration

### Task 3.1: Design Agent Intent-to-Tool Mapping
**Objective**: Define deterministic intent recognition rules mapping natural language to MCP tools (Constitutional Section VI).

**Acceptance Criteria**:
- ✅ Intent mapping documented: keywords → tool (e.g., "add", "create", "remember", "save" → add_task)
- ✅ Mapping covers all 6 tools (add_task, list_tasks, get_task, update_task, delete_task, complete_task)
- ✅ Synonym intents handled consistently (e.g., "create" and "add" both → add_task)
- ✅ Ambiguous requests identified (e.g., "delete it" without context → ask clarification)
- ✅ Error cases documented (tool not found, task not found, etc.)
- ✅ Mapping published in design document for reference

**Dependencies**: Task 2.1 (MCP schemas)

**Test Coverage**:
- No code yet; documentation only

**Effort**: S (Small)

---

### Task 3.2: Implement Agent Service with Intent Mapping
**Objective**: Create FastAPI service wrapping OpenAI Agents SDK with deterministic tool invocation.

**Acceptance Criteria**:
- ✅ Agent initialized with Task MCP tools (add_task, list_tasks, get_task, update_task, delete_task, complete_task)
- ✅ Agent system prompt includes Constitution Section VI intent mapping
- ✅ User message → Agent interprets intent → Invokes correct tool(s)
- ✅ Tool results confirmed in natural language (e.g., "✓ Task created: Buy groceries")
- ✅ Errors handled gracefully: "I couldn't find task 42. Would you like me to show your tasks?"
- ✅ Ambiguous requests: Agent asks clarification ("I found 2 tasks starting with 'call'. Which one did you mean?")
- ✅ Agent respects conversation history for multi-turn context
- ✅ All tool calls logged with structured logging (Task 1.6)

**Dependencies**: Task 2.2 (Task MCP), Task 3.1 (Intent mapping), Task 1.6 (Logging)

**Test Coverage**:
- Unit tests: Agent initialization, intent parsing
- Contract tests: Intent → tool determinism ("add task: buy milk" twice → identical calls)
- Contract tests: Synonym handling (various "add" synonyms → add_task)
- Integration tests: Full agent flow with real MCP server

**Effort**: L (Large)

---

### Task 3.3: Integrate Agent Decision Hierarchy
**Objective**: Implement strict Agent Decision Hierarchy from Constitution Section IX.

**Acceptance Criteria**:
- ✅ Phase 1: Load conversation history (already done in Task 1.4)
- ✅ Phase 2: Interpret user intent via agent
- ✅ Phase 3: Invoke Task MCP tools if applicable
- ✅ Phase 4: Invoke Contact-7 MCP (stub for now, Phase 5 implements)
- ✅ Phase 5: Invoke Context-7 MCP (optional, Phase 5 implements)
- ✅ Phase 6: Generate natural-language response
- ✅ Phase 7: Persist assistant message (already done in Task 1.4)
- ✅ Ordering strictly enforced (no skipping steps)
- ✅ Each step logged (Task 1.6)

**Dependencies**: Task 1.4 (Conversation service), Task 3.2 (Agent service)

**Test Coverage**:
- Integration tests: Full agent decision flow
- Contract tests: Step ordering verified

**Effort**: M (Medium)

---

## Phase 4: ChatKit Widget Integration

### Task 4.1: Design Chat Widget Component
**Objective**: Define ChatKit widget component structure, props, and message handling.

**Acceptance Criteria**:
- ✅ Component accepts conversation_id (UUID) and user_id
- ✅ Component renders MessageList (user + assistant messages)
- ✅ Component renders InputField for user messages
- ✅ Component manages internal message state (local)
- ✅ Component calls API endpoint on send
- ✅ Component displays loading state during processing
- ✅ Component displays errors for failed requests
- ✅ No business logic in component (all server-side)

**Dependencies**: Task 1.5 (Chat endpoint)

**Test Coverage**:
- No code yet; design only

**Effort**: S (Small)

---

### Task 4.2: Implement ChatKit Widget Component
**Objective**: Create React component wrapping ChatKit SDK for chat UI.

**Acceptance Criteria**:
- ✅ Component imports ChatKit SDK (OpenAI)
- ✅ Component renders message list chronologically
- ✅ Component renders input field with send button
- ✅ Component sends POST /api/{user_id}/chat on message submit
- ✅ Component injects JWT from Better Auth session (Task 4.4)
- ✅ Component manages conversation_id in state (creates new if null)
- ✅ Component persists conversation_id in localStorage or component state
- ✅ Component re-renders on new messages
- ✅ Component displays loading state while agent processes
- ✅ Component displays error messages for failed requests

**Dependencies**: Task 1.5 (Chat endpoint), Task 4.1 (Design)

**Test Coverage**:
- Unit tests: Component rendering, state management
- Unit tests: Message handling, API calls
- Integration tests: Full chat flow with mock API

**Effort**: M (Medium)

---

### Task 4.3: Implement useChat Custom Hook
**Objective**: Create React hook for managing chat interaction logic.

**Acceptance Criteria**:
- ✅ Hook accepts conversation_id (optional)
- ✅ Hook manages messages array state
- ✅ Hook manages conversation_id state
- ✅ Hook exports sendMessage function
- ✅ Hook exports messages, loading, error state
- ✅ Hook persists conversation_id across re-renders
- ✅ Hook calls API client (Task 4.4)

**Dependencies**: Task 4.4 (API client)

**Test Coverage**:
- Unit tests: Hook initialization, state management
- Unit tests: sendMessage logic

**Effort**: M (Medium)

---

### Task 4.4: Implement API Client with JWT Injection
**Objective**: Create API client for POST /api/{user_id}/chat with automatic JWT injection.

**Acceptance Criteria**:
- ✅ Function accepts user_id, conversation_id, message
- ✅ Function retrieves JWT from Better Auth session
- ✅ Function injects JWT in Authorization header (Bearer token)
- ✅ Function POSTs to /api/{user_id}/chat
- ✅ Function returns response: conversation_id, assistant_message, tool_calls
- ✅ Function handles errors gracefully
- ✅ Function is importable and testable

**Dependencies**: Task 1.5 (Chat endpoint)

**Test Coverage**:
- Unit tests: Request construction, header injection
- Unit tests: Response parsing
- Integration tests: Real API calls with mock JWT

**Effort**: S (Small)

---

### Task 4.5: Embed ChatWidget in Dashboard
**Objective**: Integrate ChatKit widget component into dashboard layout.

**Acceptance Criteria**:
- ✅ Dashboard component imports ChatWidget
- ✅ ChatWidget embedded as persistent panel in dashboard
- ✅ ChatWidget receives user_id from Better Auth session
- ✅ ChatWidget accepts existing conversation_id from URL or state
- ✅ ChatWidget maintains state across dashboard navigation
- ✅ Dashboard remains responsive with ChatWidget (no layout issues)
- ✅ ChatWidget styled consistently with dashboard theme

**Dependencies**: Task 4.2 (ChatKit widget), Dashboard component must exist

**Test Coverage**:
- Unit tests: Dashboard rendering with ChatWidget
- Integration tests: ChatWidget interaction within dashboard

**Effort**: M (Medium)

---

## Phase 5: Contact-7 & Context-7 MCP Servers

### Task 5.1: Implement Contact-7 MCP Server
**Objective**: Create MCP server for identity coordination and user context.

**Acceptance Criteria**:
- ✅ Server exposes get_user_context tool
- ✅ Tool accepts user_id parameter
- ✅ Tool returns user metadata (id, email, created_at, etc.)
- ✅ Tool validates user_id ownership
- ✅ Tool is read-only (no mutations)
- ✅ Server runs standalone via MCP protocol

**Dependencies**: Task 1.1 (SQLModel)

**Test Coverage**:
- Unit tests: get_user_context tool
- Integration tests: Tool with real database

**Effort**: S (Small)

---

### Task 5.2: Implement Context-7 MCP Server (Read-Only)
**Objective**: Create optional MCP server for ephemeral conversation context (non-authoritative).

**Acceptance Criteria**:
- ✅ Server exposes summarize_conversation tool
- ✅ summarize_conversation accepts conversation_id, user_id, returns concise summary
- ✅ Server exposes select_relevant_messages tool
- ✅ select_relevant_messages accepts conversation_id, user_id, count, returns N most relevant messages
- ✅ All tools are read-only (no database mutations)
- ✅ All tools are stateless
- ✅ All tool invocations logged (Task 1.6)
- ✅ Outputs never override Task MCP results (advisory only)

**Dependencies**: Task 1.4 (Conversation service)

**Test Coverage**:
- Unit tests: Summarization and selection logic
- Integration tests: With real message data

**Effort**: M (Medium)

---

### Task 5.3: Integrate Contact-7 & Context-7 into Agent
**Objective**: Update agent service to optionally invoke Contact-7 and Context-7 per Decision Hierarchy.

**Acceptance Criteria**:
- ✅ Agent decision hierarchy calls Contact-7 if identity validation needed
- ✅ Agent decision hierarchy optionally calls Context-7 for context optimization
- ✅ Context-7 output never overrides Task MCP results
- ✅ All MCP invocations logged
- ✅ Agent gracefully handles Contact-7/Context-7 failures (continue without them)

**Dependencies**: Task 3.2 (Agent service), Task 5.1 (Contact-7), Task 5.2 (Context-7)

**Test Coverage**:
- Integration tests: Agent with Contact-7 and Context-7

**Effort**: M (Medium)

---

## Phase 6: Testing, Observability & Documentation

### Task 6.1: Write Unit Tests (Backend)
**Objective**: Comprehensive unit tests for FastAPI services and handlers.

**Acceptance Criteria**:
- ✅ Agent service: Intent mapping, error handling, tool confirmation
- ✅ Conversation service: Load, persist, atomic operations
- ✅ JWT handler: Valid token, expired token, invalid signature, user_id mismatch
- ✅ MCP tools: Each tool with mocks (add_task, list_tasks, get_task, update_task, delete_task, complete_task)
- ✅ Logging: JSON format, field presence, secret scrubbing
- ✅ Coverage: >80% of backend code

**Dependencies**: All Phase 1-3 tasks

**Test Coverage**:
- Pytest with async support
- Mock database
- Mock MCP servers

**Effort**: L (Large)

---

### Task 6.2: Write Integration Tests (Backend)
**Objective**: Full end-to-end tests verifying stateless chat flow and user isolation.

**Acceptance Criteria**:
- ✅ Full chat flow: User message → Agent → Task MCP → Response → Persistence
- ✅ User isolation: Verify user_id filtering prevents cross-user access
- ✅ Statelessness: Identical request sequence on fresh API instance produces same results
- ✅ Error scenarios: Tool failures, token expiration, server unavailability
- ✅ All tests against test database (Neon)

**Dependencies**: All Phase 1-3 tasks

**Test Coverage**:
- Pytest with async support
- Real test database
- Real MCP servers (or Docker containers)

**Effort**: L (Large)

---

### Task 6.3: Write Contract Tests (Agent Behavior)
**Objective**: Verify agent determinism and intent consistency.

**Acceptance Criteria**:
- ✅ Determinism: "add task: buy milk" submitted twice produces identical tool call sequence
- ✅ Intent consistency: Synonym intents map to same tool (e.g., "create", "add", "remember" → add_task)
- ✅ Error handling: All error paths handled gracefully with natural-language messages
- ✅ Tool call ordering: Agent decision hierarchy steps executed in correct order

**Dependencies**: Task 3.2 (Agent service), Task 6.1 (Unit tests)

**Test Coverage**:
- Pytest parametrized tests
- Multiple message variations for each intent

**Effort**: M (Medium)

---

### Task 6.4: Write Frontend Tests
**Objective**: Unit and integration tests for ChatKit widget and hooks.

**Acceptance Criteria**:
- ✅ ChatWidget: Component rendering, message state, input handling
- ✅ useChat hook: State management, sendMessage logic
- ✅ API client: Request construction, JWT injection, response parsing
- ✅ Integration: Full chat flow from widget through API
- ✅ Coverage: >80% of frontend code

**Dependencies**: Phase 4 tasks

**Test Coverage**:
- Jest + React Testing Library
- Mock API responses

**Effort**: M (Medium)

---

### Task 6.5: Create Data Model Documentation
**Objective**: Document database schema, relationships, and constraints.

**Acceptance Criteria**:
- ✅ Conversation table: columns, indexes, relationships
- ✅ Message table: columns, indexes, relationships, constraints
- ✅ Task table: columns, indexes, relationships, constraints
- ✅ Indexes documented with rationale
- ✅ Sample queries provided (load conversation, persist message, etc.)

**Dependencies**: Task 1.1 (SQLModel)

**Test Coverage**: None (documentation)

**Effort**: S (Small)

---

### Task 6.6: Create API Contracts Documentation
**Objective**: Document chat endpoint and MCP tool schemas.

**Acceptance Criteria**:
- ✅ Chat endpoint: POST /api/{user_id}/chat with request/response examples
- ✅ MCP tool schemas: OpenAPI specs for all 6 Task MCP tools
- ✅ Error codes: 400, 401, 403, 404 with examples
- ✅ Examples: Real request/response payloads
- ✅ Published as OpenAPI/JSON schemas in contracts/

**Dependencies**: Task 1.5 (Chat endpoint), Task 2.1 (Tool schemas)

**Test Coverage**: None (documentation)

**Effort**: M (Medium)

---

### Task 6.7: Create Quickstart Guide
**Objective**: Developer-friendly guide to setting up and running the chatbot.

**Acceptance Criteria**:
- ✅ Prerequisites: Python 3.11+, PostgreSQL/Neon, Node.js, npm
- ✅ Backend setup: Clone, install dependencies, configure environment
- ✅ Database: Run migrations, verify schema
- ✅ MCP servers: Start Task MCP server
- ✅ Frontend: Setup, npm install, npm run dev
- ✅ Testing: Run unit tests, integration tests
- ✅ Example: Complete chat conversation walkthrough

**Dependencies**: All phases

**Test Coverage**: None (documentation)

**Effort**: M (Medium)

---

### Task 6.8: Create Deployment & Operations Guide
**Objective**: Production deployment and monitoring guide.

**Acceptance Criteria**:
- ✅ Docker setup: Build images for backend and MCP servers
- ✅ Environment variables: DATABASE_URL, BETTER_AUTH_SECRET, etc.
- ✅ Monitoring: Structured logging, metrics collection, alerting
- ✅ Scaling: Horizontal scaling of stateless backend
- ✅ Health checks: Endpoint verification
- ✅ Rollback: Migration rollback procedures

**Dependencies**: All phases

**Test Coverage**: None (documentation)

**Effort**: M (Medium)

---

## Task Dependencies Map

```
Phase 1:
├── 1.1 (Schema) → 1.2 (Migrations) ✓
├── 1.3 (JWT) → 1.5 (Endpoint) ✓
├── 1.4 (Conversation) → 1.5 (Endpoint) ✓
├── 1.6 (Logging) [independent]
└── 1.5 (Endpoint) [depends on 1.3, 1.4]

Phase 2:
├── 2.1 (Schemas) [depends on 1.1]
├── 2.2 (MCP Server) [depends on 1.1, 1.2, 2.1]
└── 2.3 (Docker) [depends on 2.2]

Phase 3:
├── 3.1 (Intent Mapping) [depends on 2.1]
├── 3.2 (Agent Service) [depends on 2.2, 3.1, 1.6]
└── 3.3 (Decision Hierarchy) [depends on 1.4, 3.2]

Phase 4:
├── 4.1 (Design) [depends on 1.5]
├── 4.2 (Widget) [depends on 1.5, 4.1]
├── 4.3 (Hook) [depends on 4.4]
├── 4.4 (API Client) [depends on 1.5]
└── 4.5 (Dashboard) [depends on 4.2]

Phase 5:
├── 5.1 (Contact-7) [depends on 1.1]
├── 5.2 (Context-7) [depends on 1.4]
└── 5.3 (Integration) [depends on 3.2, 5.1, 5.2]

Phase 6:
├── 6.1 (Unit Tests) [depends on 1-3]
├── 6.2 (Integration Tests) [depends on 1-3]
├── 6.3 (Contract Tests) [depends on 3.2, 6.1]
├── 6.4 (Frontend Tests) [depends on 4]
├── 6.5 (Data Model Docs) [depends on 1.1]
├── 6.6 (API Docs) [depends on 1.5, 2.1]
├── 6.7 (Quickstart) [depends on all]
└── 6.8 (Deployment) [depends on all]
```

---

## Parallel Execution Recommendations

**Can execute in parallel** (independent dependencies):
- Phase 1: Tasks 1.1 & 1.3 & 1.6 (then 1.2 & 1.4 & 1.5)
- Phase 2: Task 2.1 (then 2.2, then 2.3)
- Phase 3: Task 3.1 (then 3.2, then 3.3)
- Phase 4: Tasks 4.1 (then 4.2, 4.3, 4.4 in parallel, then 4.5)
- Phase 5: Tasks 5.1 & 5.2 in parallel (then 5.3)
- Phase 6: Tasks 6.1 & 6.2 & 6.4 in parallel (then 6.3, then 6.5-6.8 in parallel)

---

## Definition of Done for Feature

Feature is complete when:
- ✅ All 38 tasks completed and tested
- ✅ All user stories implemented (5 stories)
- ✅ All functional requirements implemented (14 FR)
- ✅ All success criteria met (8 SC)
- ✅ All acceptance criteria for each task satisfied
- ✅ Constitutional compliance verified (16 principles)
- ✅ Agent behavior determinism proven (contract tests pass)
- ✅ User isolation verified (integration tests pass)
- ✅ Statelessness verified (service restarts don't lose state)
- ✅ Test coverage >90% (unit + integration + contract)
- ✅ Documentation complete (quickstart, API contracts, deployment)
- ✅ All code passes type checking and linting
- ✅ Ready for production deployment

---

**Next**: Run `/sp.taskstoissues` to convert tasks to GitHub issues (requires Git remote configured).
