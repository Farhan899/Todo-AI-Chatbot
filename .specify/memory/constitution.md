<!--
SYNC IMPACT REPORT
==================
Version: 1.0.0 → 2.0.0 (MAJOR: Complete architectural redefinition)
Date: 2026-01-07

MAJOR CHANGES:
- Architectural Shift: Traditional Next.js/FastAPI/PostgreSQL todo app → AI-Native chatbot with MCP tool orchestration
- New Primary UX: Embedded chat widget (ChatKit SDK) replacing traditional dashboard
- New Reasoning Layer: OpenAI Agents SDK as sole decision authority
- New Execution Layer: Three MCP servers (Task, Contact-7, Context-7) replacing direct API calls
- New State Model: Database remains source of truth; conversation context reconstructed per request

PRINCIPLES CHANGED:
1. Decoupled Architecture → Expanded to include ChatKit (presentation) / Agents SDK (reasoning) / MCP (execution)
2. Security First → Enhanced with user_id propagation across chat widget, agent, and MCP boundaries
3. Code Quality Standards → New requirements for agent-consistent behavior and tool parameter schemas
4. Test-Driven Development → Remains; now extended to agent behavior and MCP tool contracts
5. Data Integrity → Unchanged; PostgreSQL remains source of truth; conversation history now persisted
6. Development Workflow → Restructured around agent/MCP/widget integration phases
7. Observability → Enhanced with agent decision logging, tool execution metrics, and cross-layer tracing
8. Simplicity & YAGNI → New principle: Stateless Design (conversation reconstruction, not session memory)

PRINCIPLES ADDED:
9. AI Agent Behavior Norms (Intent Mapping, Confirmation, Error Handling)
10. Embedded Chat Widget (Dashboard Integration, Security, Observability)
11. MCP Server Governance (Task, Contact-7, Context-7 separation of concerns and decision hierarchy)
12. Stateless Platform Architecture (Conversation reconstruction, no server memory)

Templates Status:
✅ spec-template.md - Requires review for chatbot feature specifications
✅ plan-template.md - Requires agent behavior and MCP integration planning
✅ tasks-template.md - Requires task categorization for agent/MCP testing
⚠️  Command files - Manual review for agent-specific command structure
⚠️  phr-template.md - Verify PHR routing for agent-specific (agentic) stages

Deferred Items: None
-->

# AI-Native Taskify (Todo Chatbot) Constitution

## Vision and Purpose

Taskify is a natural-language interface for todo task management that empowers users to converse naturally without technical syntax or GUI operations. Every user intent maps unambiguously to one or more MCP tool calls. The system is stateless, deterministic, auditable, and secure.

**Core Invariant:**
```
Users talk to the dashboard chat widget.
The agent decides.
MCP tools act.
The database remembers.
```

---

## Core Principles

### I. User-Centric Natural-Language Interaction

Users MUST be able to manage todos through natural conversation without learning technical syntax or GUI operations:

- **Natural-Language Intent**: User messages are interpreted by the AI Agent (OpenAI Agents SDK) to extract actionable intent
- **No Technical Barriers**: Users never directly invoke tools; the agent interprets and orchestrates MCP tool calls
- **Unambiguous Mapping**: Every natural-language intent MUST map to a consistent sequence of MCP tool calls (e.g., "add task → add_task MCP call with parameters)
- **Confirmation and Communication**: The AI assistant MUST always confirm tool results in natural language (e.g., "Task added: Buy groceries")

**Rationale**: Natural-language interfaces lower adoption barriers and enable conversational workflows. Unambiguous intent-to-tool mapping ensures predictable, testable behavior.

### II. Deterministic Task Management

All state mutations (create, update, complete, delete tasks) MUST be strictly deterministic and auditable:

- **Explicit Tool Calls**: Task operations MUST only occur via Task MCP tool calls with strongly-typed parameters
- **Database Persistence**: All task mutations MUST be persisted to PostgreSQL immediately
- **Idempotence Where Applicable**: Tool calls that modify state MUST be designed to handle retries safely
- **Audit Trail**: Every tool invocation MUST be logged with user_id, conversation_id, timestamp, tool name, parameters, and result

**Rationale**: Determinism enables reliable tool behavior, testability, and auditability. Immediate database persistence ensures no task changes are lost even if the agent crashes.

### III. Stateless Platform Architecture

The backend MUST remain stateless; all user context MUST be reconstructed per request:

- **No Server Memory**: The API layer and agent MUST NOT store session state between requests
- **Conversation Reconstruction**: Per each user message, the backend MUST load full conversation history from PostgreSQL
- **Context Windowing**: For long conversations, context windowing MAY optimize history retrieval (paginated, selective) without sacrificing completeness
- **Idempotent Message Processing**: The same user message submitted twice MUST produce identical agent decisions (given identical database state)

**Rationale**: Stateless design enables horizontal scaling, simplifies deployment, and ensures recovery is implicit. No data is lost if a service instance crashes.

### IV. Robustness and Reliability

Agent decisions and tool executions MUST be auditable, testable, and recoverable:

- **Error Handling**: If a tool call fails, the agent MUST gracefully handle the error and communicate it to the user in natural language (e.g., "Task not found; did you mean one of these?")
- **Ambiguity Resolution**: Ambiguous user requests MUST prompt minimal clarifying questions rather than making incorrect tool calls
- **Tool Validation**: MCP tool parameters MUST be validated before invocation (schema compliance, ownership, constraints)
- **Recovery Without Replay**: Users MUST be able to continue the conversation naturally after errors; no manual retry mechanics required

**Rationale**: Robust error handling prevents cascade failures. User-friendly error messages maintain trust. Graceful degradation ensures usability even when tools fail.

### V. Security and Access Control

User authentication and authorization MUST be enforced at every boundary:

- **Authentication Mechanism**: Better Auth MUST issue JWT tokens to the frontend; all API requests MUST include the JWT in the Authorization header
- **Per-Request Verification**: FastAPI MUST decode and verify the JWT on every request using HS256 with the shared BETTER_AUTH_SECRET
- **User Isolation**: All MCP tool calls MUST include user_id (extracted from JWT); Task MCP MUST validate ownership before returning or mutating tasks
- **Chat Widget Security**: The embedded chat widget MUST receive user_id from Better Auth session; it MUST NOT accept user_id from client input
- **Token Propagation**: When the FastAPI backend invokes MCP servers, it MUST propagate user_id explicitly; MCP servers MUST NOT infer identity

**Rationale**: Multi-user systems require strict isolation. JWT verification at the API layer prevents unauthorized access. Explicit user_id propagation prevents accidental cross-user data leakage.

### VI. AI Agent Behavior Norms

The AI Agent (OpenAI Agents SDK) MUST follow deterministic intent mapping and communication rules:

**Intent-to-Tool Mapping:**
- **add_task / create_task**: "add", "create", "remember", "save" → `Task MCP: add_task(title, description, user_id)`
- **list_tasks**: "show", "list", "what", "display", "list my tasks" → `Task MCP: list_tasks(user_id)`
- **get_task**: "get", "show details", "tell me about" → `Task MCP: get_task(task_id, user_id)`
- **update_task**: "update", "edit", "change", "modify" → `Task MCP: update_task(task_id, title, description, user_id)`
- **delete_task**: "delete", "remove", "discard" → `Task MCP: delete_task(task_id, user_id)`
- **complete_task**: "complete", "done", "mark complete", "check off" → `Task MCP: complete_task(task_id, user_id)`

**Confirmation and Communication:**
- After every tool invocation, the agent MUST confirm the result in natural language
- Success example: "✓ Task created: 'Buy groceries' added to your list"
- Error example: "I couldn't find task 42. Would you like me to show your pending tasks?"

**Error Handling:**
- If task_id is not found, explain and optionally list relevant tasks
- If request is ambiguous (e.g., "delete it" without context), ask a clarifying question
- If a tool call fails, communicate the error in user-friendly language; never expose internal error stacks

**Rationale**: Consistent intent mapping ensures predictable behavior. Natural-language confirmation maintains user confidence. Proactive error handling prevents user frustration.

### VII. Embedded Chat Widget

The chat widget is the primary interaction surface for task management:

**Purpose and Role:**
- The dashboard chat widget IS the primary control plane for todos; it is not a side feature
- The widget enables users to manage all tasks via natural conversation
- All task mutations flow through: chat input → agent reasoning → MCP tools → database
- Non-chat controls (e.g., task list sidebar) MUST NOT bypass the chat; they MUST internally invoke the same MCP tools

**Frontend Responsibilities (ChatKit SDK):**
- The widget MUST be embedded as a persistent UI component in the dashboard layout
- The widget MUST manage:
  - Message rendering and scrolling
  - User input handling
  - Conversation continuity via conversation_id (stored in localStorage or returned by backend)
  - Streaming or incremental assistant responses (if ChatKit supports)
- The widget MUST remain logic-light:
  - NO task parsing or intent inference
  - NO business rules or validation
  - NO state that affects correctness (all authoritative state is server-side)

**Backend Contract with Chat Widget:**
- Each widget message is processed independently (stateless)
- Conversation context is reconstructed from the database per message
- Assistant responses are suitable for direct rendering without post-processing
- Tool calls are optional metadata; responses MUST NOT require knowledge of which tools were invoked
- The widget MUST NOT assume which MCP tools the agent called

**Dashboard Integration:**
- The chat widget MUST coexist with task lists, analytics, and other dashboard panels
- The chat widget is authoritative: manual UI actions (buttons, checkboxes) MUST NOT bypass MCP tools
- If present, non-chat controls MUST internally call the same MCP tools to maintain a single source of truth

**Security and Identity:**
- The widget operates only for authenticated users (Better Auth session required)
- user_id MUST be derived from Better Auth context, not client input
- The widget MUST never embed credentials or secrets
- The widget MUST not assume user_id; it must receive it from the server or session

**Observability:**
- All messages originating from the dashboard chat widget MUST be logged identically to any other chat client
- Logs MUST be traceable by: user_id, conversation_id, timestamp, originating surface = "dashboard_widget"
- This ensures analytics and debugging parity across all chat surfaces

**Rationale**: A single control plane (the chat widget) prevents dual logic paths and ensures consistency. ChatKit remains presentation-only; all business logic resides in the agent and MCP tools.

### VIII. MCP Server Governance

The system MUST use three specialized MCP servers with strict separation of concerns:

**8.1 Task MCP Server (Authoritative Task State)**

Task MCP is the single source of truth for all task data:

- **Tool Set**: add_task, list_tasks, get_task, update_task, delete_task, complete_task
- **Parameters**: All tools receive user_id (for ownership validation); tool schemas are strongly typed
- **Ownership Validation**: All operations MUST validate task ownership (task.user_id == request.user_id) before returning or mutating
- **Error Responses**: Return clear error messages (404 for not found, 403 for unauthorized, 400 for invalid input)
- **Database Backend**: SQLModel with Neon PostgreSQL; all mutations are persisted immediately

**8.2 Contact-7 MCP Server (Identity and SDK Orchestration)**

Contact-7 coordinates user identity and AI SDK interactions:

- **Purpose**: Provide session information, user metadata, and authentication context
- **When Used**: When the agent needs to validate identity or coordinate multiple SDK layers
- **NOT Used For**: Task operations (delegated to Task MCP), context enrichment (delegated to Context-7)
- **Ownership Validation**: Always validate user_id matches request context

**8.3 Context-7 MCP Server (Ephemeral Contextual Intelligence)**

Context-7 provides non-authoritative contextual support for agent reasoning:

- **Purpose**: Supply transient context for conversation optimization and agent reasoning
- **Use Cases**: Conversation summarization, context window optimization, UI-specific context, cross-turn reasoning
- **NOT Authoritative**: Context-7 outputs are advisory only; they MUST NOT override Task MCP or Contact-7 results
- **Stateless**: All outputs are computed per request; nothing is persisted
- **When MUST NOT Be Used**:
  - Task creation, update, deletion (use Task MCP)
  - Persistence of user data (Context-7 is read-only and ephemeral)
  - As source of truth for tasks (Task MCP is authoritative)
  - To replace database-backed conversation history

### IX. Agent Decision Hierarchy

When processing a user message, the agent MUST follow this strict sequence:

1. **Load Conversation History**: Retrieve conversation and all prior messages from PostgreSQL
2. **Interpret User Intent**: Analyze the natural-language message to extract task intent
3. **Task Operations**: Call Task MCP for task mutations (create, update, delete, complete)
4. **Identity Coordination**: Call Contact-7 MCP if user identity validation or SDK coordination is required
5. **Contextual Enrichment**: Call Context-7 MCP if conversation optimization or reasoning support is needed
6. **Generate Response**: Compose natural-language confirmation of tool results and any agent reasoning
7. **Persist Response**: Write the assistant message to PostgreSQL conversation history
8. **Return to Widget**: Return the assistant response to the chat widget for rendering

**No step may be skipped or reordered.** This ensures deterministic behavior and correct tool sequencing.

**Rationale**: Strict ordering prevents race conditions, ensures conversation history consistency, and makes agent behavior predictable and auditable.

### X. Context-7 Usage Governance

Context-7 MUST be used carefully and only when necessary:

**When Context-7 MAY Be Used:**
- Session-level conversation summarization (summarize first N messages for context window optimization)
- Context window optimization for long conversations (select most relevant messages)
- UI-specific context augmentation for ChatKit widgets (prepare context for streaming responses)
- Cross-turn reasoning assistance (highlight prior task references to assist agent reasoning)
- Temporary memory compression or expansion (manage context window size)

**Agent MUST NOT Invoke Context-7 By Default:** Use Context-7 only when the above use cases apply; avoid gratuitous context enrichment.

**Persistence Rules:**
- Context-7 output MUST NOT be written directly to the database
- Context-7 output may only be persisted if transformed into a user message or assistant message
- This preserves database primacy and prevents ephemeral data leakage

**Observability:**
- Every Context-7 invocation MUST be logged with: user_id, conversation_id, tool name, invocation reason (agent-provided), input/output payloads
- Logging enables auditing and prevents silent overuse

**Rationale**: Context-7 is a performance and reasoning aid, not a data store. Careful governance prevents misuse while enabling optimization.

### XI. Code Quality Standards

All code MUST meet these quality requirements:

**Backend (Python/FastAPI):**
- **Type Hints**: Strict Python type hints required for all functions, parameters, and return values
- **Async Operations**: All database operations MUST be async (async/await pattern)
- **Pydantic Models**: All request/response schemas MUST use Pydantic models for validation
- **Error Handling**: Raise HTTPException with clear detail messages (404 for Not Found, 401/403 for auth errors)
- **Import Organization**: Standard library → Third-party → Local imports with blank line separation

**MCP Tools:**
- **Parameter Schemas**: All tool parameters MUST be strongly typed and documented
- **Tool Registration**: Tools MUST be explicitly registered with the agent with complete schemas
- **Error Responses**: Tools MUST return structured error messages with appropriate error codes
- **Determinism**: Identical tool invocations MUST produce identical results (given identical database state)

**Frontend (Next.js/TypeScript):**
- **TypeScript Strict Mode**: No implicit any; all types explicitly defined
- **Component Separation**: Server Components for static content, Client Components ("use client") for chat widget
- **API Abstraction**: Dedicated API client helper (lib/api.ts) that automatically injects JWT tokens
- **Error Boundaries**: Graceful error handling with user-friendly messages

**Rationale**: Type safety prevents runtime errors. Consistent patterns reduce cognitive load. Strong tool schemas enable predictable agent behavior.

### XII. Test-Driven Development

TDD methodology MUST be followed for all feature development:

- **Red Phase**: Write tests that define expected behavior → Tests MUST fail initially
- **Green Phase**: Implement minimal code to make tests pass
- **Refactor Phase**: Improve code quality while keeping tests green
- **Test Categories**:
  - **Unit Tests**: Test individual MCP tools and agent intent-mapping rules in isolation
  - **Integration Tests**: Test agent-to-MCP-to-database workflows
  - **Contract Tests**: Verify MCP tool schemas and agent decision sequences match specifications
  - **Agent Behavior Tests**: Verify agent produces consistent tool call sequences for identical intents

**Rationale**: TDD ensures code meets requirements before implementation. Agent behavior tests ensure consistent, predictable interaction patterns.

### XIII. Data Integrity

Database operations MUST follow these principles:

**Schema (SQLModel / Neon PostgreSQL):**
- **Tasks Table**: id (UUID PK), user_id (String, Indexed), title (String), description (String, Optional), is_completed (Boolean, Default: False), created_at (DateTime), updated_at (DateTime)
- **Conversations Table**: id (UUID PK), user_id (String, Indexed), created_at (DateTime), updated_at (DateTime)
- **Messages Table**: id (UUID PK), conversation_id (UUID, FK), user_id (String, Indexed), sender (String: "user" or "assistant"), content (Text), tool_calls (JSON, Optional), created_at (DateTime)
- **Migrations**: All schema changes MUST use migration scripts (never direct DDL in application code)
- **Indexing**: user_id and conversation_id MUST be indexed for query performance
- **Timestamps**: created_at/updated_at MUST be automatically managed

**Data Operations:**
- **Isolation**: All queries MUST filter by user_id from JWT to prevent cross-user data leakage
- **Transactions**: Multi-step operations MUST use database transactions for atomicity
- **Validation**: SQLModel field validators MUST enforce constraints (title length, user ownership, etc.)
- **Conversation Reconstruction**: Messages MUST be retrievable in order by created_at for deterministic history

**Rationale**: Data integrity ensures system reliability and user trust. Indexed queries optimize stateless message reconstruction. Timestamps provide audit trails.

### XIV. Observability

Monitoring and debugging capabilities are mandatory:

- **Structured Logging**: All errors, authentication failures, agent decisions, and tool invocations MUST be logged with structured context (user_id, conversation_id, tool_name, timestamp)
- **Request Tracing**: Include request IDs (or conversation_id) in logs to trace requests across frontend/backend/MCP
- **Agent Decision Logging**: Log every agent intent extraction and tool call sequence (with parameters)
- **Tool Execution Metrics**: Log MCP tool execution times and error codes to detect performance issues
- **Error Messages**: User-facing errors MUST be sanitized (no stack traces, SQL errors, or internal details exposed)
- **Developer Errors**: Internal logs MUST include full error context for debugging

**Rationale**: Observability enables rapid issue diagnosis. Structured logs support automated alerting. Agent decision logging is critical for debugging intent mismatches.

### XV. Simplicity & YAGNI

Start with the simplest solution that meets requirements:

- **No Premature Optimization**: Optimize only when performance issues are measured
- **No Unused Features**: Build only what the specification requires
- **No Unnecessary Abstractions**: Avoid repository patterns, service layers, or additional wrappers unless complexity justifies them
- **Direct Dependencies**: Use well-maintained libraries (FastAPI, SQLModel, OpenAI SDK) rather than custom implementations
- **Agent Simplicity**: Agent logic MUST be straightforward intent mapping; avoid complex multi-step reasoning unless required

**Rationale**: Simplicity reduces maintenance burden, speeds development, and minimizes bugs. Straightforward agent logic is more testable and predictable.

### XVI. Long-Term Extensibility

New features MUST be designed to extend the system without breaking existing contracts:

**Modular Tool Expansion:**
- New features (due dates, tags, reminders) MUST be added via additional MCP tools
- New tools MUST follow the same stateless, typed, ownership-validated paradigm as Task MCP
- New tools MUST integrate with the agent decision hierarchy (sequenced after primary operations)

**Multi-Model Support:**
- The architecture MUST allow swapping or adding language models without reworking core tooling or state logic
- Agent logic MUST be model-agnostic; intent mapping rules are a layer above model selection

**Rationale**: Modular design enables feature growth without architectural churn. Model-agnostic design future-proofs the system.

---

## Technology Stack (Strict)

These technology choices are mandatory and MUST NOT be substituted:

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend Framework | Next.js | 16+ | UI rendering, routing, SSR |
| Frontend Language | TypeScript | Latest | Type safety |
| Frontend Styling | Tailwind CSS | Latest | Responsive design |
| Chat Widget SDK | ChatKit (OpenAI) | Latest | Chat UI and message rendering |
| Frontend Auth | Better Auth | Latest | JWT token generation |
| AI Reasoning | OpenAI Agents SDK | Latest | Natural-language intent interpretation |
| Backend Framework | FastAPI | Latest | Async REST API and MCP orchestration |
| Backend Language | Python | 3.11+ | Application logic |
| ORM | SQLModel | Latest | Type-safe database models |
| Database | Neon PostgreSQL | Serverless | Persistent conversation and task storage |
| Auth Method | JWT (HS256) | N/A | Stateless authentication |
| MCP Tool Hosting | Python MCP Server | Latest | Task, Contact-7, Context-7 tool hosting |
| Development Tool | Claude Code + Spec-Kit Plus | Latest | AI-assisted development |

**CORS Configuration**: Backend MUST allow requests only from the Next.js frontend origin (configured via environment variable `FRONTEND_URL`).

---

## API Contract (REST)

### Chat Endpoint

The primary interaction surface is the chat endpoint:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/{user_id}/chat | Send message to agent; receive response | Yes |

**Request Body**:
```json
{
  "conversation_id": "string (UUID or null for new conversation)",
  "message": "string (user natural-language input)",
  "include_context": "boolean (optional; whether to include Context-7 enrichment)"
}
```

**Response Body**:
```json
{
  "conversation_id": "string (UUID; created if new)",
  "assistant_message": "string (natural-language confirmation and response)",
  "tool_calls": [
    {
      "tool": "string (MCP tool name: add_task, list_tasks, etc.)",
      "parameters": "object (tool invocation parameters)",
      "result": "object or string (tool execution result)"
    }
  ]
}
```

**Error Responses**: 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 500 (Internal Server Error)
- Error body format: `{"detail": "Human-readable error message"}`

### Task MCP Tools (Backend Only)

The following tools are exposed to the agent via Task MCP (not directly to frontend):

| Tool | Parameters | Returns | Notes |
|------|-----------|---------|-------|
| add_task | user_id, title, description | task object (id, title, created_at, is_completed) | Creates a new task |
| list_tasks | user_id | array of task objects | Returns all tasks for user |
| get_task | user_id, task_id | task object | Returns single task with full details |
| update_task | user_id, task_id, title, description | task object | Updates task; validates ownership |
| delete_task | user_id, task_id | success message | Deletes task; validates ownership |
| complete_task | user_id, task_id | task object | Toggles is_completed flag |

---

## Development Workflow

### Implementation Phases

**Phase 1: Database and Conversation Persistence**
- Initialize Neon PostgreSQL project
- Configure DATABASE_URL in environment
- Create SQLModel tables: Conversations, Messages, Tasks
- Create migration scripts for schema

**Phase 2: Backend Core and MCP Task Server**
- Setup FastAPI application with CORS configuration
- Implement JWT verification dependency using pyjwt
- Create shared BETTER_AUTH_SECRET environment variable
- Implement Task MCP server with all 6 tools (add, list, get, update, delete, complete)
- Implement Contact-7 MCP server stub (identity validation)

**Phase 3: Agent and Chat Endpoint**
- Initialize OpenAI Agents SDK
- Implement agent intent-mapping logic (intent string → tool call sequence)
- Implement /api/{user_id}/chat endpoint
- Implement conversation loading and message persistence
- Add structured logging for agent decisions and tool calls

**Phase 4: Frontend Setup and Chat Widget**
- Initialize Next.js project with App Router
- Configure Better Auth with JWT plugin
- Setup BETTER_AUTH_SECRET environment variable
- Build ChatKit-based chat widget for dashboard

**Phase 5: Integration and Context-7**
- Integrate chat widget with /api/{user_id}/chat endpoint
- Implement conversation_id tracking in widget
- Implement optional Context-7 MCP server for conversation optimization
- Add streaming response support (if ChatKit supports)

**Phase 6: Testing and Observability**
- Write agent behavior tests (intent → tool sequences)
- Write contract tests for MCP tools
- Implement structured logging and request tracing
- Implement observability dashboards for tool execution metrics

**Rationale**: Phased approach reduces integration risks. Early phases establish stateless infrastructure; later phases add AI reasoning and UX polish.

---

## Governance

**Constitution Authority**: This constitution supersedes all other development practices, coding standards, and architectural decisions unless explicitly amended.

**Amendment Process**:
1. Proposed changes MUST be documented with rationale and impact analysis
2. Changes MUST be approved before implementation
3. Migration plan required for changes affecting existing code
4. Version MUST be updated following semantic versioning

**Compliance Review**:
- All pull requests MUST verify compliance with security principles (Sections V)
- All new features MUST follow TDD methodology (Section XII)
- All code MUST pass type checking (Section XI)
- Agent behavior MUST be tested for intent-to-tool consistency (Section XII)
- Constitution violations MUST be justified in plan.md Complexity Tracking section

**Versioning Policy**:
- **MAJOR** (X.0.0): Backward-incompatible principle changes, removed requirements, architectural shifts
- **MINOR** (0.X.0): New principles added, expanded guidance, new tool integrations
- **PATCH** (0.0.X): Clarifications, typo fixes, non-semantic changes

**Runtime Guidance**: See `CLAUDE.md` for agent-specific development instructions, PHR creation, and ADR workflows.

---

**Version**: 2.0.0 | **Ratified**: 2025-12-28 | **Last Amended**: 2026-01-07
