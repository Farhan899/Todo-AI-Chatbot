# Data Models Documentation

Complete reference for all database entities and their relationships in the AI-Powered Todo Chatbot.

## Overview

The application uses PostgreSQL with SQLModel (Pydantic + SQLAlchemy) for type-safe, async ORM operations. All models enforce ownership validation to ensure user data isolation.

```
┌─────────────────────────────────────────────┐
│            Database Schema                   │
├─────────────────────────────────────────────┤
│  users (via Better Auth)                     │
│  ├─ id: string (PK)                          │
│  ├─ email: string                            │
│  └─ emailVerified: boolean                   │
├─────────────────────────────────────────────┤
│  conversations ←┐                            │
│  ├─ id: UUID (PK)│                           │
│  ├─ user_id: string (FK → users)             │
│  └─ created_at, updated_at                   │
├─────────────────────────────────────────────┤
│  messages ←┐                                 │
│  ├─ id: UUID (PK)│                           │
│  ├─ conversation_id: UUID (FK)               │
│  ├─ user_id: string (FK)                     │
│  ├─ sender: "user" | "assistant"             │
│  ├─ content: string                          │
│  ├─ tool_calls: JSON (optional)              │
│  └─ created_at                               │
├─────────────────────────────────────────────┤
│  tasks                                       │
│  ├─ id: integer (PK)                         │
│  ├─ user_id: string (FK)                     │
│  ├─ title: string                            │
│  ├─ description: string (optional)           │
│  ├─ is_completed: boolean                    │
│  └─ created_at, updated_at                   │
└─────────────────────────────────────────────┘
```

## Entity: Conversation

### SQLModel Definition

```python
from uuid import UUID
from datetime import datetime
from sqlmodel import SQLModel, Field
from typing import Optional

class Conversation(SQLModel, table=True):
    """
    Represents a conversation thread between user and AI agent.

    Conversations group related messages and enable multi-turn interactions.
    Each conversation belongs to exactly one user (enforced via user_id FK).
    """

    # Primary Key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        description="Unique conversation identifier (UUID v4)"
    )

    # Foreign Key
    user_id: str = Field(
        foreign_key="user.id",
        index=True,
        description="Owner of this conversation (Better Auth user ID)"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="When conversation was created"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
        description="When conversation was last updated"
    )
```

### Database Schema

```sql
CREATE TABLE conversation (
    id UUID PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);
```

### Key Properties

| Property | Type | Required | Constraints | Notes |
|----------|------|----------|-------------|-------|
| `id` | UUID | Yes | PK, unique | Auto-generated v4 UUID |
| `user_id` | string | Yes | FK, indexed | Links to Better Auth user |
| `created_at` | datetime | Yes | Default now | UTC timestamp |
| `updated_at` | datetime | Yes | Default now | UTC, auto-updates on change |

### Access Patterns

- **By ID**: `Conversation.get(id)` → O(1) primary key lookup
- **By User**: `Conversation.filter(user_id)` → O(log n) with index
- **By Created Time**: `Conversation.filter(created_at).order_by()` → O(log n)

### Ownership Validation

```python
# Verify conversation belongs to user before access
def verify_conversation_access(
    conversation_id: UUID,
    user_id: str,
    session: AsyncSession
) -> Conversation:
    conversation = session.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id  # CRITICAL: User isolation
    ).first()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return conversation
```

### Example Queries

```python
# Create new conversation
async def create_conversation(user_id: str, session: AsyncSession):
    conversation = Conversation(user_id=user_id)
    session.add(conversation)
    await session.commit()
    return conversation

# Load conversation with history
async def load_conversation(
    conversation_id: UUID,
    user_id: str,
    session: AsyncSession
):
    result = await session.execute(
        select(Conversation)
        .where(Conversation.id == conversation_id)
        .where(Conversation.user_id == user_id)  # Ownership validation
        .options(selectinload(Conversation.messages))
    )
    return result.scalars().first()

# List user's conversations (paginated)
async def list_user_conversations(
    user_id: str,
    skip: int = 0,
    limit: int = 50,
    session: AsyncSession = None
):
    result = await session.execute(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()
```

---

## Entity: Message

### SQLModel Definition

```python
from uuid import UUID
from datetime import datetime
from sqlmodel import SQLModel, Field
from typing import Optional, List
from enum import Enum

class MessageSender(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"

class Message(SQLModel, table=True):
    """
    Represents a single message in a conversation.

    Messages are atomic units of communication that can include:
    - User input (sender="user")
    - Agent responses (sender="assistant")
    - Tool invocation metadata (via tool_calls JSON)

    Messages are immutable after creation (no updates).
    """

    # Primary Key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        description="Unique message identifier"
    )

    # Foreign Keys
    conversation_id: UUID = Field(
        foreign_key="conversation.id",
        index=True,
        description="Parent conversation"
    )
    user_id: str = Field(
        index=True,
        description="Message owner (for user-scoped queries)"
    )

    # Content
    sender: MessageSender = Field(
        description="Who sent this message (user or assistant)"
    )
    content: str = Field(
        min_length=1,
        max_length=5000,
        description="Message text content (1-5000 characters)"
    )

    # Tool Invocation Data
    tool_calls: Optional[dict] = Field(
        default=None,
        sa_column=Column(JSON),
        description="Array of tool invocations (JSON)"
    )

    # Timestamp
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="When message was sent"
    )
```

### Database Schema

```sql
CREATE TABLE message (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL,
    user_id VARCHAR NOT NULL,
    sender VARCHAR NOT NULL CHECK (sender IN ('user', 'assistant')),
    content VARCHAR(5000) NOT NULL,
    tool_calls JSON,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversation(id),
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);
```

### Key Properties

| Property | Type | Required | Constraints | Notes |
|----------|------|----------|-------------|-------|
| `id` | UUID | Yes | PK, unique | Auto-generated |
| `conversation_id` | UUID | Yes | FK, indexed | Links to conversation |
| `user_id` | string | Yes | Indexed | Denormalized for queries |
| `sender` | enum | Yes | "user" \| "assistant" | Controls styling |
| `content` | string | Yes | 1-5000 chars | Validated on insert |
| `tool_calls` | JSON | No | Optional object array | See schema below |
| `created_at` | datetime | Yes | Default now | UTC, immutable |

### Tool Calls JSON Schema

```typescript
// tool_calls structure (stored as JSON)
{
  "tools": [
    {
      "tool": "add_task" | "list_tasks" | "get_task" | "update_task" | "delete_task" | "complete_task",
      "parameters": {
        "user_id": string,
        "title"?: string,
        "description"?: string,
        "task_id"?: string | number,
        "completed"?: boolean,
        "include_completed"?: boolean
      }
    }
  ]
}
```

### Example

```json
{
  "tools": [
    {
      "tool": "add_task",
      "parameters": {
        "user_id": "usr_123",
        "title": "Buy groceries",
        "description": "Milk, eggs, bread"
      }
    }
  ]
}
```

### Access Patterns

- **By Conversation**: `Message.filter(conversation_id).order_by(created_at)` → O(log n)
- **By User**: `Message.filter(user_id).order_by(created_at)` → O(log n)
- **Conversation History**: Load all messages for conversation ID

### Ownership Validation

```python
# Messages inherit conversation ownership
# Verify before returning message content
if message.conversation_id not in user_conversations:
    raise HTTPException(status_code=403, detail="Unauthorized")
```

### Example Queries

```python
# Persist user message
async def persist_user_message(
    conversation_id: UUID,
    user_id: str,
    content: str,
    session: AsyncSession
):
    message = Message(
        conversation_id=conversation_id,
        user_id=user_id,
        sender=MessageSender.USER,
        content=content
    )
    session.add(message)
    await session.flush()  # Get ID without commit
    return message

# Persist assistant response with tool calls
async def persist_assistant_message(
    conversation_id: UUID,
    user_id: str,
    content: str,
    tool_calls: Optional[list] = None,
    session: AsyncSession = None
):
    message = Message(
        conversation_id=conversation_id,
        user_id=user_id,
        sender=MessageSender.ASSISTANT,
        content=content,
        tool_calls={"tools": tool_calls} if tool_calls else None
    )
    session.add(message)
    await session.flush()
    return message

# Load conversation history
async def load_conversation_history(
    conversation_id: UUID,
    user_id: str,
    session: AsyncSession
) -> List[Message]:
    result = await session.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .where(Message.user_id == user_id)  # Ownership check
        .order_by(Message.created_at.asc())
    )
    return result.scalars().all()

# Get last N messages (context window)
async def get_last_n_messages(
    conversation_id: UUID,
    user_id: str,
    n: int = 50,
    session: AsyncSession = None
) -> List[Message]:
    result = await session.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .where(Message.user_id == user_id)
        .order_by(Message.created_at.desc())
        .limit(n)
    )
    messages = result.scalars().all()
    return list(reversed(messages))  # Reverse to get chronological order
```

---

## Entity: Task

### SQLModel Definition

```python
from datetime import datetime
from sqlmodel import SQLModel, Field
from typing import Optional

class Task(SQLModel, table=True):
    """
    Represents a user task created through the chat interface.

    Tasks are the primary domain objects managed by the agent.
    All CRUD operations enforce user ownership via user_id.
    """

    # Primary Key
    id: int = Field(
        primary_key=True,
        description="Task identifier (auto-incrementing)"
    )

    # Foreign Key
    user_id: str = Field(
        foreign_key="user.id",
        index=True,
        description="Task owner (Better Auth user ID)"
    )

    # Content
    title: str = Field(
        min_length=1,
        max_length=200,
        description="Task title (1-200 characters)"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Optional task details (max 2000 chars)"
    )

    # Status
    is_completed: bool = Field(
        default=False,
        description="Whether task is marked complete"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="When task was created"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
        description="When task was last modified"
    )
```

### Database Schema

```sql
CREATE TABLE task (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(2000),
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    INDEX idx_user_id (user_id),
    INDEX idx_is_completed (is_completed),
    INDEX idx_created_at (created_at)
);
```

### Key Properties

| Property | Type | Required | Constraints | Notes |
|----------|------|----------|-------------|-------|
| `id` | integer | Yes | PK, auto-inc | Sequence-based |
| `user_id` | string | Yes | FK, indexed | Links to user |
| `title` | string | Yes | 1-200 chars | Task name |
| `description` | string | No | Max 2000 chars | Optional details |
| `is_completed` | boolean | Yes | Default false | Completion status |
| `created_at` | datetime | Yes | Default now | UTC timestamp |
| `updated_at` | datetime | Yes | Default now | UTC, auto-updates |

### Access Patterns

- **By User**: `Task.filter(user_id)` → O(log n)
- **By Status**: `Task.filter(user_id, is_completed=True/False)` → O(log n)
- **By ID**: `Task.get(id, user_id)` → O(1)
- **By Creation**: `Task.filter(user_id).order_by(created_at)` → O(log n)

### Ownership Validation

```python
# All task operations must validate ownership
def verify_task_access(
    task_id: int,
    user_id: str,
    session: AsyncSession
) -> Task:
    task = session.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id  # CRITICAL: User isolation
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task
```

### Example Queries

```python
# Create new task
async def create_task(
    user_id: str,
    title: str,
    description: Optional[str] = None,
    session: AsyncSession = None
) -> Task:
    task = Task(
        user_id=user_id,
        title=title,
        description=description
    )
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task

# Get task by ID (with ownership check)
async def get_task(
    task_id: int,
    user_id: str,
    session: AsyncSession
) -> Task:
    result = await session.execute(
        select(Task)
        .where(Task.id == task_id)
        .where(Task.user_id == user_id)  # Ownership check
    )
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

# List user's tasks
async def list_user_tasks(
    user_id: str,
    include_completed: bool = True,
    session: AsyncSession = None
) -> List[Task]:
    query = select(Task).where(Task.user_id == user_id)

    if not include_completed:
        query = query.where(Task.is_completed == False)

    query = query.order_by(Task.created_at.desc())

    result = await session.execute(query)
    return result.scalars().all()

# Update task
async def update_task(
    task_id: int,
    user_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    session: AsyncSession = None
) -> Task:
    task = await get_task(task_id, user_id, session)

    if title is not None:
        task.title = title
    if description is not None:
        task.description = description

    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task

# Complete task
async def complete_task(
    task_id: int,
    user_id: str,
    completed: bool = True,
    session: AsyncSession = None
) -> Task:
    task = await get_task(task_id, user_id, session)
    task.is_completed = completed

    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task

# Delete task
async def delete_task(
    task_id: int,
    user_id: str,
    session: AsyncSession
) -> None:
    task = await get_task(task_id, user_id, session)
    await session.delete(task)
    await session.commit()
```

---

## Relationships

### Conversation → Message (1:N)

```
Conversation (1) ─────→ (N) Message
  id (PK)              conversation_id (FK)
  user_id              user_id
  created_at           created_at
  updated_at           sender
                       content
```

- **Cascading**: Delete conversation cascades to delete all messages
- **Orphan Protection**: No orphaned messages (FK constraint)
- **Loading Strategy**: Use eager loading with `selectinload()` for performance

```python
# Load conversation with all messages
result = await session.execute(
    select(Conversation)
    .where(Conversation.id == conv_id)
    .options(selectinload(Conversation.messages))  # Eager load
)
```

### User → Conversation (1:N)

```
User (1) ─────→ (N) Conversation
  id (PK)          user_id (FK)
                   id (PK)
                   created_at
```

- **Ownership**: Each conversation belongs to exactly one user
- **Isolation**: All queries filter by user_id
- **Cascading**: Delete user cascades to delete all conversations

### User → Task (1:N)

```
User (1) ─────→ (N) Task
  id (PK)        user_id (FK)
                 id (PK)
                 title
                 is_completed
```

- **Ownership**: Each task belongs to exactly one user
- **Isolation**: All task queries filter by user_id
- **Cascading**: Delete user cascades to delete all tasks

---

## Constraints and Validation

### Data Type Constraints

| Entity | Field | Type | Min/Max | Validation |
|--------|-------|------|---------|------------|
| Conversation | id | UUID | - | Unique, non-null |
| Conversation | user_id | string | - | FK, non-null |
| Message | content | string | 1-5000 | Non-empty, max length |
| Message | sender | enum | - | "user" \| "assistant" |
| Task | title | string | 1-200 | Non-empty, max length |
| Task | description | string | 0-2000 | Optional, max length |

### Database Constraints

```sql
-- NOT NULL constraints
ALTER TABLE conversation ADD CONSTRAINT nn_user_id NOT NULL;
ALTER TABLE message ADD CONSTRAINT nn_conversation_id NOT NULL;
ALTER TABLE message ADD CONSTRAINT nn_user_id NOT NULL;
ALTER TABLE message ADD CONSTRAINT nn_sender NOT NULL;
ALTER TABLE message ADD CONSTRAINT nn_content NOT NULL;
ALTER TABLE task ADD CONSTRAINT nn_user_id NOT NULL;
ALTER TABLE task ADD CONSTRAINT nn_title NOT NULL;

-- CHECK constraints
ALTER TABLE message ADD CONSTRAINT check_sender
  CHECK (sender IN ('user', 'assistant'));

ALTER TABLE message ADD CONSTRAINT check_content_length
  CHECK (LENGTH(content) >= 1 AND LENGTH(content) <= 5000);

ALTER TABLE task ADD CONSTRAINT check_title_length
  CHECK (LENGTH(title) >= 1 AND LENGTH(title) <= 200);

-- Foreign Key constraints
ALTER TABLE conversation
  ADD CONSTRAINT fk_conversation_user
  FOREIGN KEY (user_id) REFERENCES user(id);

ALTER TABLE message
  ADD CONSTRAINT fk_message_conversation
  FOREIGN KEY (conversation_id) REFERENCES conversation(id);

ALTER TABLE task
  ADD CONSTRAINT fk_task_user
  FOREIGN KEY (user_id) REFERENCES user(id);
```

---

## Indexes

### Optimization Indexes

```sql
-- Conversation indexes
CREATE INDEX idx_conversation_user_id ON conversation(user_id);
CREATE INDEX idx_conversation_created_at ON conversation(created_at);
CREATE INDEX idx_conversation_user_created ON conversation(user_id, created_at DESC);

-- Message indexes
CREATE INDEX idx_message_conversation_id ON message(conversation_id);
CREATE INDEX idx_message_user_id ON message(user_id);
CREATE INDEX idx_message_created_at ON message(created_at);
CREATE INDEX idx_message_conv_created ON message(conversation_id, created_at ASC);

-- Task indexes
CREATE INDEX idx_task_user_id ON task(user_id);
CREATE INDEX idx_task_is_completed ON task(is_completed);
CREATE INDEX idx_task_created_at ON task(created_at);
CREATE INDEX idx_task_user_completed ON task(user_id, is_completed);
```

### Index Usage

- **User Queries**: `idx_*_user_id` for per-user filtering
- **History Loading**: `idx_message_conv_created` for conversation history in order
- **Time-based**: `idx_created_at` for sorting/pagination
- **Status**: `idx_task_is_completed` for active/completed filtering

---

## Migrations

### Version History

- **001_initial_schema**: Creates conversations, messages tables
- **002_add_better_auth**: Better Auth user/session tables (auto-managed)
- **003_add_tasks**: Creates tasks table with proper indexes

### Running Migrations

```bash
# View current version
alembic current

# Upgrade to latest
alembic upgrade head

# Upgrade one version
alembic upgrade +1

# Downgrade one version
alembic downgrade -1

# View history
alembic history

# Create new migration
alembic revision --autogenerate -m "description"
```

---

## Performance Considerations

### Connection Pooling

```python
# Uses asyncpg with connection pooling
DATABASE_URL = "postgresql+asyncpg://user:pass@host/dbname"

# Pool settings:
# - min_size=5: Minimum idle connections
# - max_size=20: Maximum connections
# - max_overflow=10: Additional connections during spikes
```

### Query Optimization

```python
# ✅ Good: Use eager loading for known relations
result = await session.execute(
    select(Conversation)
    .options(selectinload(Conversation.messages))
)

# ❌ Bad: N+1 query (don't do this)
for conv in conversations:
    messages = await session.execute(
        select(Message).where(Message.conversation_id == conv.id)
    )  # 1 query per conversation

# ✅ Good: Batch filtering
result = await session.execute(
    select(Message)
    .where(Message.conversation_id.in_(conversation_ids))
)

# ✅ Good: Select only needed columns
result = await session.execute(
    select(Message.id, Message.created_at)
    .where(Message.conversation_id == conv_id)
)
```

### Scaling Strategies

- **Connection Pool Tuning**: Increase `max_size` for high concurrency
- **Read Replicas**: Route read queries to read-only replicas
- **Archival**: Move old messages to archive table
- **Caching**: Redis cache for frequently accessed conversations
- **Pagination**: Always paginate list queries (limit 50 default)

---

## Security

### User Isolation

All queries MUST include user_id filter:

```python
# ✅ Correct: User isolation enforced
async def get_user_tasks(user_id: str, session: AsyncSession):
    result = await session.execute(
        select(Task).where(Task.user_id == user_id)  # Required
    )

# ❌ Wrong: Missing user_id filter (SECURITY ISSUE)
async def get_all_tasks(session: AsyncSession):
    result = await session.execute(select(Task))  # DANGEROUS
```

### SQL Injection Prevention

```python
# ✅ Using SQLModel parameters (safe)
await session.execute(
    select(Task).where(Task.user_id == user_id)  # Parameterized
)

# ❌ String concatenation (UNSAFE - never do this)
query = f"SELECT * FROM task WHERE user_id = '{user_id}'"
```

### Field Validation

- **Lengths**: Enforced via `min_length` and `max_length` in SQLModel
- **Enums**: `sender` field restricted to "user" | "assistant"
- **Required**: Foreign keys and status fields are non-null
- **Formats**: UUIDs validated by `uuid4()` function

---

## TypeScript Types (Frontend)

Corresponding TypeScript interfaces for frontend type safety:

```typescript
// Conversation type
interface Conversation {
  id: string;          // UUID
  user_id: string;
  created_at: number;  // Timestamp
  updated_at: number;
}

// Message type
interface Message {
  id: string;          // UUID
  conversation_id: string;
  user_id: string;
  sender: "user" | "assistant";
  content: string;
  tool_calls?: {
    tools: Array<{
      tool: string;
      parameters: Record<string, any>;
    }>;
  };
  created_at: number;  // Timestamp
}

// Task type
interface Task {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  created_at: number;
  updated_at: number;
}
```

---

## FAQ

**Q: Can I update a message?**
A: No, messages are immutable. Delete and recreate if needed.

**Q: How long are conversations stored?**
A: Indefinitely, unless manually deleted. Consider archival strategy for old data.

**Q: What happens when I delete a user?**
A: All conversations, messages, and tasks are cascaded and deleted.

**Q: How do I query across user boundaries?**
A: You shouldn't. Always filter by user_id first for security.

**Q: Can I have multiple conversations?**
A: Yes, unlimited. Each has unique UUID.

**Q: What's the max message size?**
A: 5000 characters (enforced at database level).

**Q: Can tasks exist without conversations?**
A: Yes, tasks are independent from conversations.

**Q: How do I backup the database?**
A: Use `pg_dump` for PostgreSQL, or native Neon backups.

