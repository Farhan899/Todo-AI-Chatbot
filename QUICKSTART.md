# AI-Powered Todo Chatbot - Quickstart Guide

Get up and running with the AI-Powered Todo Chatbot in 15 minutes.

## Prerequisites

- Node.js 18+ (frontend)
- Python 3.11+ (backend)
- PostgreSQL 15+ (or Neon PostgreSQL)
- Better Auth account (for authentication)
- OpenAI API key (for future agent integration)

## Local Development Setup

### 1. Clone & Install Dependencies

```bash
# Backend dependencies
cd backend
pip install -r requirements.txt
pip install -e .

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/chatbot
BETTER_AUTH_SECRET=your-secret-here
OPENAI_API_KEY=sk-...
ENVIRONMENT=development
```

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
BETTER_AUTH_URL=http://localhost:3000/api/auth
```

### 3. Database Setup

```bash
# Run migrations
cd backend
alembic upgrade head

# Create test data (optional)
python scripts/seed_db.py
```

### 4. Start Services

**Terminal 1 - Backend API**:
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

Backend running at: `http://localhost:8000`

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

Frontend running at: `http://localhost:3000`

**Terminal 3 - Task MCP Server** (optional):
```bash
cd backend/mcp_servers/task_mcp
python -m task_mcp.main
```

## First Chat Interaction

1. **Open** http://localhost:3000 in your browser
2. **Sign in** with Better Auth
3. **Click** the chat icon (💬) in the top-right corner
4. **Type** a message:
   ```
   add buy groceries
   ```
5. **See** the agent create a task and respond

## Common Commands

### Create a Task

```
add buy milk
create meeting on Monday
remember to call mom
new task: finish report
```

### List Tasks

```
show all tasks
what tasks do i have
list my tasks
my tasks
```

### Complete a Task

```
complete task 1
mark task 1 done
finish task 1
done with task 1
```

### Update a Task

```
change task 1 to buy almond milk
update task 1
edit task 1
```

### Delete a Task

```
delete task 1
remove task 1
trash task 1
```

## Testing the API

### Using cURL

Get an auth token from the UI, then:

```bash
TOKEN="your-session-token"
USER_ID="your-user-id"

# Create a task
curl -X POST http://localhost:8000/api/$USER_ID/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "add buy groceries"}'

# Continue conversation
curl -X POST http://localhost:8000/api/$USER_ID/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
    "message": "show all tasks"
  }'
```

### Using Python

```python
import requests
import json

BASE_URL = "http://localhost:8000"
USER_ID = "your-user-id"
TOKEN = "your-session-token"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json",
}

# Create task
response = requests.post(
    f"{BASE_URL}/api/{USER_ID}/chat",
    json={"message": "add buy groceries"},
    headers=headers,
)

print(response.json())
```

## Running Tests

### Unit Tests

```bash
cd backend
pytest tests/unit/
```

### Integration Tests

```bash
cd backend
pytest tests/integration/
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Debugging

### Check Logs

**Backend logs** show structured JSON with:
- Request/conversation ID
- User ID
- Intent extracted
- Tools invoked
- Errors with full context

```bash
# Filter logs for errors
grep '"level": "ERROR"' backend.log

# Filter by conversation
grep "550e8400-e29b-41d4-a716-446655440000" backend.log
```

### Database Inspection

```bash
# Connect to PostgreSQL
psql postgresql://user:password@localhost:5432/chatbot

# View conversations
SELECT * FROM conversations;

# View messages
SELECT id, conversation_id, sender, content, created_at
FROM messages
ORDER BY created_at DESC;

# View tasks
SELECT * FROM tasks
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC;
```

### Frontend Debugging

Open DevTools (F12) to inspect:
- Network tab: Chat API calls
- Console: React errors
- Application tab: JWT token in sessionStorage

## Architecture Overview

```
Browser (ChatWidget)
    ↓ HTTP/REST
Backend FastAPI
    ├─ JWT Verification
    ├─ Conversation Service (stateless)
    ├─ Agent Service
    │   ├─ Intent Mapping
    │   ├─ Parameter Extraction
    │   └─ NLG Response Generation
    └─ Database (PostgreSQL)
        ├─ conversations
        ├─ messages
        └─ tasks
```

## Next Steps

### Phase 3-5 Features (Already Implemented)

- ✅ Intent-to-tool deterministic mapping
- ✅ Stateless architecture with conversation reconstruction
- ✅ Contact-7 MCP Server (user context)
- ✅ Context-7 MCP Server (conversation summarization)
- ✅ Responsive ChatWidget (desktop + mobile)

### Phase 6+ Features (In Development)

- 🔄 Comprehensive test coverage (unit, integration, contract)
- 🔄 Production deployment guides
- 🔄 Observability setup (logging, metrics, tracing)
- 🔄 Performance optimization

### Future Enhancements

- Rich message formatting (markdown, code)
- File attachments
- Typing indicators
- Voice input/output
- Conversation search
- Task templates
- Recurring tasks

## Troubleshooting

### "Invalid authentication token"

- Check token is from current session
- Token expires after 24 hours (configurable in Better Auth)
- Refresh page to get new token

### "Access denied: cannot access another user's resources"

- Make sure user_id in URL matches authenticated user
- Check JWT token is valid for that user

### "Conversation not found"

- Conversation IDs are per-user
- Can't access conversation from different user
- Provide null for conversation_id to create new

### Database connection error

- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Run migrations: `alembic upgrade head`

### Slow response times

- Check database query performance
- Monitor CPU/memory usage
- Consider query optimization or caching

## Getting Help

- **API Issues**: See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Architecture**: See [specs/002-ai-chatbot-mcp/plan.md](specs/002-ai-chatbot-mcp/plan.md)
- **Requirements**: See [specs/002-ai-chatbot-mcp/spec.md](specs/002-ai-chatbot-mcp/spec.md)

## Contributing

Before submitting changes:

1. Run tests: `pytest` (backend), `npm test` (frontend)
2. Check logs for errors
3. Follow the commit message style: `type: description`
4. Reference the specification and plan documents

## License

This project is licensed under the MIT License.
