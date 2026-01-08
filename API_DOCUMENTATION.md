# AI-Powered Todo Chatbot - API Documentation

## Overview

The Chat API provides a stateless interface for natural language task management. All requests are user-isolated and require JWT authentication.

## Base URL

```
POST /api/{user_id}/chat
```

## Authentication

All requests must include a Bearer token in the Authorization header:

```
Authorization: Bearer <session_token>
```

The token is obtained via Better Auth and stored in `sessionStorage` (key: `better-auth.session_token`).

**Security**:
- Token expiration is validated on each request
- URL path `user_id` must match JWT `sub` claim
- Returns 401 Unauthorized if token is invalid/expired
- Returns 403 Forbidden if user IDs don't match

## Request Schema

```typescript
POST /api/{user_id}/chat

Content-Type: application/json
Authorization: Bearer <token>

{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000" | null,
  "message": "add buy groceries",
  "include_context": false
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `conversation_id` | UUID \| null | No | Existing conversation ID, or null to create new |
| `message` | string | Yes | User message (1-5000 characters) |
| `include_context` | boolean | No | Include Contact-7 & Context-7 enrichment (default: false) |

## Response Schema

```typescript
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "assistant_message": "✅ Created task: buy groceries",
  "tool_calls": [
    {
      "tool": "add_task",
      "parameters": {
        "user_id": "usr_123",
        "title": "buy groceries"
      }
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `conversation_id` | UUID | Conversation ID (newly created or provided) |
| `assistant_message` | string | Natural language response from agent |
| `tool_calls` | Array | Tools invoked during request (empty if no tools called) |

## Error Responses

### 400 Bad Request

Invalid input (empty message, invalid format)

```json
{
  "detail": "Message cannot be empty"
}
```

### 401 Unauthorized

Missing or invalid authentication

```json
{
  "detail": "Invalid authentication token"
}
```

### 403 Forbidden

User ID in path doesn't match authenticated user

```json
{
  "detail": "Access denied: cannot access another user's resources"
}
```

### 404 Not Found

Conversation doesn't exist or doesn't belong to user

```json
{
  "detail": "Conversation not found"
}
```

### 500 Internal Server Error

Server error during processing

```json
{
  "detail": "An unexpected error occurred processing your message"
}
```

## Usage Examples

### Example 1: Create New Conversation

```bash
curl -X POST http://localhost:8000/api/usr_123/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "add buy groceries"
  }'
```

Response:
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "assistant_message": "✅ Created task: buy groceries",
  "tool_calls": [
    {
      "tool": "add_task",
      "parameters": {
        "user_id": "usr_123",
        "title": "buy groceries"
      }
    }
  ]
}
```

### Example 2: Continue Conversation

```bash
curl -X POST http://localhost:8000/api/usr_123/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
    "message": "show all tasks"
  }'
```

### Example 3: With Context Enrichment

```bash
curl -X POST http://localhost:8000/api/usr_123/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
    "message": "complete task 1",
    "include_context": true
  }'
```

## Supported Intents

The agent supports the following natural language intents:

| Intent | Examples | Tool | Result |
|--------|----------|------|--------|
| **Add Task** | "add buy groceries", "create task", "remember milk" | `add_task` | Creates new task |
| **List Tasks** | "show all tasks", "what tasks do i have", "list tasks" | `list_tasks` | Returns all user tasks |
| **Complete Task** | "complete task 1", "mark done", "finish task 1" | `complete_task` | Marks task as completed |
| **Update Task** | "change task 1 to buy milk", "update task" | `update_task` | Updates task title/description |
| **Delete Task** | "delete task 1", "remove task 1" | `delete_task` | Permanently deletes task |
| **Get Task** | "show task 1", "tell me about task 1" | `get_task` | Retrieves single task details |

## MCP Tools (Task Management)

The agent invokes these MCP tools for task operations:

### add_task

Creates a new task.

```json
{
  "tool": "add_task",
  "parameters": {
    "user_id": "usr_123",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread"
  }
}
```

**Returns**: Task object with id, title, description, is_completed, timestamps

**Errors**: 400 (invalid input), 403 (unauthorized), 500 (server error)

### list_tasks

Lists all tasks for user.

```json
{
  "tool": "list_tasks",
  "parameters": {
    "user_id": "usr_123",
    "include_completed": true
  }
}
```

**Returns**: Array of task objects

### get_task

Retrieves a single task.

```json
{
  "tool": "get_task",
  "parameters": {
    "user_id": "usr_123",
    "task_id": "123"
  }
}
```

**Returns**: Task object or 404 if not found

### update_task

Updates task title or description.

```json
{
  "tool": "update_task",
  "parameters": {
    "user_id": "usr_123",
    "task_id": "123",
    "title": "Buy milk",
    "description": "2% milk from store"
  }
}
```

**Returns**: Updated task object

### delete_task

Permanently deletes a task.

```json
{
  "tool": "delete_task",
  "parameters": {
    "user_id": "usr_123",
    "task_id": "123"
  }
}
```

**Returns**: Success message

### complete_task

Marks task as completed or uncompleted.

```json
{
  "tool": "complete_task",
  "parameters": {
    "user_id": "usr_123",
    "task_id": "123",
    "completed": true
  }
}
```

**Returns**: Updated task object with is_completed=true

## Data Models

### Conversation

```typescript
{
  id: UUID;              // Unique conversation ID
  user_id: string;       // Owner user ID
  created_at: DateTime;  // Creation timestamp
  updated_at: DateTime;  // Last update timestamp
}
```

### Message

```typescript
{
  id: UUID;              // Unique message ID
  conversation_id: UUID; // Parent conversation
  user_id: string;       // Message owner
  sender: "user" | "assistant";
  content: string;       // Message text (1-5000 chars)
  tool_calls?: {
    tools: Array<{
      tool: string;
      parameters: Record<string, any>;
    }>;
  };
  created_at: DateTime;  // Message timestamp
}
```

### Task

```typescript
{
  id: number;
  user_id: string;
  title: string;         // 1-200 characters
  description?: string;  // Optional, max 2000 characters
  is_completed: boolean;
  created_at: DateTime;
  updated_at: DateTime;
}
```

## Rate Limiting

Currently no rate limiting is enforced. Production deployments should implement:
- Per-user rate limits (e.g., 100 requests/minute)
- Per-IP rate limits
- Burst protection

## Observability

### Structured Logging

All requests are logged with structured JSON including:
- Request ID / Conversation ID
- User ID
- Intent extracted
- Tool calls executed
- Response time
- Error details

Example log:
```json
{
  "timestamp": "2026-01-07T12:34:56.789Z",
  "level": "INFO",
  "message": "Chat request processed successfully",
  "user_id": "usr_123",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "intent": "add_task",
  "confidence": 1.0,
  "tool_count": 1,
  "response_time_ms": 145
}
```

### Metrics to Monitor

- Request latency (p50, p95, p99)
- Success rate (200 responses / total)
- Error rate by type (401, 403, 404, 500)
- Intent distribution
- Tool invocation rate
- Average conversation length
- Database query performance

## FAQ

**Q: Can I create multiple conversations?**
A: Yes, just omit `conversation_id` on each new request or provide different conversation IDs.

**Q: Are conversations stored permanently?**
A: Yes, in PostgreSQL. They're associated with your user_id and can be retrieved by conversation_id.

**Q: Can I see my task history?**
A: Yes, by referencing the same `conversation_id` in subsequent requests, or by listing all tasks with the `list_tasks` tool.

**Q: What happens if a tool fails?**
A: The user message is still persisted, but no assistant message is created. You'll receive an error response. You can retry with the same message.

**Q: Is the API stateless?**
A: Yes. Conversation history is reconstructed from the database on each request. No server-side session state is maintained.

**Q: How is user data isolated?**
A: All requests must include user_id in the path and valid JWT token. Server validates both match before processing.
