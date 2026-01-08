# Task Breakdown: Multi-User Todo Application

**Feature**: 001-todo-app
**Branch**: `001-todo-app`
**Date**: 2025-12-28
**Plan**: [plan.md](./plan.md)
**Spec**: [spec.md](./spec.md)
**API Contract**: [contracts/api.openapi.yaml](./contracts/api.openapi.yaml)

## Overview

This document provides a detailed, testable task breakdown for implementing the multi-user Todo application. All tasks follow Test-Driven Development (TDD) methodology with Red-Green-Refactor cycles.

**Implementation Strategy**: Sequential phases with parallel execution within phases where possible.

**Estimated Total Tasks**: 30 tasks across 6 phases

---

## Phase 0: Project Initialization

**Goal**: Set up project structure, dependencies, and development environment.

**Prerequisites**: Neon PostgreSQL project created, BETTER_AUTH_SECRET generated.

### Task 0.1: Initialize Backend Project Structure

**Priority**: P0 (Blocker)
**Estimated Effort**: 15 minutes
**Dependencies**: None

**Description**: Create FastAPI project structure with all necessary directories and configuration files.

**Acceptance Criteria**:
- [ ] Directory structure created: `backend/app/{models,schemas,api,core,utils}`, `backend/tests/{unit,integration,contract}`, `backend/alembic`
- [ ] Files exist: `backend/app/main.py`, `backend/app/__init__.py`, `backend/requirements.txt`, `backend/pytest.ini`, `backend/alembic.ini`, `backend/.env`
- [ ] Virtual environment created: `backend/venv/`
- [ ] Git ignores `venv/`, `.env`, `__pycache__/`, `.pytest_cache/`

**Test Cases**:
```bash
# Verify structure
test -d backend/app/models && echo "✓ models directory exists"
test -d backend/app/schemas && echo "✓ schemas directory exists"
test -d backend/app/api/routes && echo "✓ api routes directory exists"
test -d backend/app/core && echo "✓ core directory exists"
test -d backend/tests && echo "✓ tests directory exists"
test -f backend/requirements.txt && echo "✓ requirements.txt exists"
test -f backend/.env && echo "✓ .env file exists"
```

**Implementation Commands**:
```bash
mkdir -p backend/{app/{models,schemas,api/routes,core,utils},tests/{unit,integration,contract},alembic/versions}
touch backend/app/{__init__.py,main.py}
touch backend/app/models/__init__.py
touch backend/app/schemas/__init__.py
touch backend/app/api/{__init__.py,deps.py}
touch backend/app/api/routes/__init__.py
touch backend/app/core/{__init__.py,config.py,database.py,security.py}
touch backend/app/utils/{__init__.py,logging.py}
touch backend/tests/{__init__.py,conftest.py}
touch backend/{requirements.txt,pytest.ini,alembic.ini,.env,.env.example}
python -m venv backend/venv
```

---

### Task 0.2: Install Backend Dependencies

**Priority**: P0 (Blocker)
**Estimated Effort**: 10 minutes
**Dependencies**: Task 0.1

**Description**: Install all required Python packages for FastAPI backend.

**Acceptance Criteria**:
- [ ] All packages installed in virtual environment
- [ ] `pip list` shows correct versions
- [ ] No dependency conflicts reported
- [ ] `requirements.txt` documents exact versions

**Dependencies to Install**:
```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlmodel==0.0.14
asyncpg==0.29.0
python-jose[cryptography]==3.3.0
python-multipart==0.0.6
python-dotenv==1.0.0
alembic==1.13.1
pydantic==2.5.3
pydantic-settings==2.1.0

# Testing
pytest==7.4.3
pytest-asyncio==0.23.2
httpx==0.26.0
pytest-cov==4.1.0
```

**Test Cases**:
```bash
# Activate venv and verify installations
source backend/venv/bin/activate
python -c "import fastapi; print(f'✓ FastAPI {fastapi.__version__}')"
python -c "import sqlmodel; print(f'✓ SQLModel {sqlmodel.__version__}')"
python -c "import jose; print('✓ python-jose installed')"
python -c "import pytest; print(f'✓ pytest {pytest.__version__}')"
```

**Implementation Commands**:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install --upgrade pip
pip install fastapi uvicorn[standard] sqlmodel asyncpg python-jose[cryptography] \
  python-multipart python-dotenv alembic pydantic pydantic-settings \
  pytest pytest-asyncio httpx pytest-cov
pip freeze > requirements.txt
```

---

### Task 0.3: Initialize Frontend Project Structure

**Priority**: P0 (Blocker)
**Estimated Effort**: 15 minutes
**Dependencies**: None

**Description**: Create Next.js project with TypeScript, Tailwind CSS, and Better Auth.

**Acceptance Criteria**:
- [ ] Next.js 16+ project initialized with App Router
- [ ] TypeScript strict mode enabled in `tsconfig.json`
- [ ] Tailwind CSS configured with `tailwind.config.js`
- [ ] Directory structure: `frontend/src/{app,components,lib}`, `frontend/tests`
- [ ] `.env.local` file created with required environment variables
- [ ] Git ignores `node_modules/`, `.next/`, `.env.local`

**Test Cases**:
```bash
# Verify structure
test -d frontend/src/app && echo "✓ app directory exists"
test -d frontend/src/components && echo "✓ components directory exists"
test -d frontend/src/lib && echo "✓ lib directory exists"
test -f frontend/package.json && echo "✓ package.json exists"
test -f frontend/tsconfig.json && echo "✓ tsconfig.json exists"
test -f frontend/tailwind.config.js && echo "✓ tailwind.config.js exists"
test -f frontend/.env.local && echo "✓ .env.local exists"
```

**Implementation Commands**:
```bash
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd frontend
mkdir -p src/{app/{auth/{signin,signup},dashboard},components/ui,lib} tests/{components,integration}
touch .env.local
```

---

### Task 0.4: Install Frontend Dependencies

**Priority**: P0 (Blocker)
**Estimated Effort**: 10 minutes
**Dependencies**: Task 0.3

**Description**: Install Better Auth, UI libraries, and testing dependencies.

**Acceptance Criteria**:
- [ ] Better Auth with JWT plugin installed
- [ ] Lucide React icons installed
- [ ] Testing libraries (Jest, React Testing Library) configured
- [ ] All packages appear in `package.json`
- [ ] `npm install` completes without errors

**Dependencies to Install**:
```json
{
  "dependencies": {
    "better-auth": "^1.0.0",
    "lucide-react": "^0.294.0",
    "next": "^16.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "typescript": "^5.3.3",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  }
}
```

**Test Cases**:
```bash
# Verify installations
cd frontend
npm list better-auth --depth=0
npm list lucide-react --depth=0
npm list jest --depth=0
```

**Implementation Commands**:
```bash
cd frontend
npm install better-auth lucide-react
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

---

## Phase 1: Backend Core & Database

**Goal**: Set up database models, migrations, and JWT security infrastructure.

### Task 1.1: Create Database Configuration (TDD Red)

**Priority**: P0 (Blocker)
**Estimated Effort**: 20 minutes
**Dependencies**: Task 0.2

**Description**: Write tests for database connection and session management, then implement SQLModel engine configuration.

**Acceptance Criteria**:
- [ ] Test file created: `backend/tests/unit/test_database.py`
- [ ] Tests verify: engine creation, session factory, async session context manager
- [ ] Tests initially FAIL (Red phase)
- [ ] `backend/app/core/database.py` imports required but not implemented

**Test Cases** (`backend/tests/unit/test_database.py`):
```python
import pytest
from sqlmodel import SQLModel, create_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.database import get_async_engine, get_session

@pytest.mark.asyncio
async def test_get_async_engine():
    """Test async engine creation"""
    engine = get_async_engine()
    assert engine is not None
    assert "postgresql+asyncpg" in str(engine.url)

@pytest.mark.asyncio
async def test_get_session():
    """Test async session creation"""
    async for session in get_session():
        assert isinstance(session, AsyncSession)
        break

def test_database_url_from_env(monkeypatch):
    """Test DATABASE_URL is read from environment"""
    test_url = "postgresql+asyncpg://test:test@localhost/testdb"
    monkeypatch.setenv("DATABASE_URL", test_url)
    # Re-import to pick up new env var
    from importlib import reload
    import app.core.database as db_module
    reload(db_module)
    engine = db_module.get_async_engine()
    assert test_url in str(engine.url)
```

**Expected Outcome**: Run `pytest tests/unit/test_database.py` → All tests FAIL ❌

---

### Task 1.2: Implement Database Configuration (TDD Green)

**Priority**: P0 (Blocker)
**Estimated Effort**: 25 minutes
**Dependencies**: Task 1.1

**Description**: Implement `backend/app/core/database.py` to make tests pass.

**Acceptance Criteria**:
- [ ] `get_async_engine()` returns SQLModel async engine
- [ ] `get_session()` yields async session with proper lifecycle
- [ ] Environment variable `DATABASE_URL` is read via `pydantic-settings`
- [ ] All tests from Task 1.1 PASS (Green phase)

**Implementation** (`backend/app/core/database.py`):
```python
from typing import AsyncGenerator
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession, AsyncEngine
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create async engine
async_engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.ENVIRONMENT == "development",
    future=True,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Session factory
async_session_maker = sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)

def get_async_engine() -> AsyncEngine:
    """Get async database engine"""
    return async_engine

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting async database session"""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def create_db_and_tables():
    """Create database tables (for testing/init)"""
    async with async_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
```

**Configuration** (`backend/app/core/config.py`):
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    BETTER_AUTH_SECRET: str
    FRONTEND_URL: str = "http://localhost:3000"
    ENVIRONMENT: str = "development"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

**Expected Outcome**: Run `pytest tests/unit/test_database.py` → All tests PASS ✅

---

### Task 1.3: Create Task Model (TDD Red)

**Priority**: P0 (Blocker)
**Estimated Effort**: 20 minutes
**Dependencies**: Task 1.2

**Description**: Write tests for Task SQLModel entity, then define the model.

**Acceptance Criteria**:
- [ ] Test file created: `backend/tests/unit/test_models.py`
- [ ] Tests verify: field types, constraints, default values, timestamp behavior
- [ ] Tests initially FAIL (Red phase)

**Test Cases** (`backend/tests/unit/test_models.py`):
```python
import pytest
from datetime import datetime
from app.models.task import Task

def test_task_model_creation():
    """Test Task model instantiation"""
    task = Task(
        user_id="usr_123",
        title="Test Task",
        description="Test description",
    )
    assert task.user_id == "usr_123"
    assert task.title == "Test Task"
    assert task.description == "Test description"
    assert task.is_completed is False
    assert isinstance(task.created_at, datetime)
    assert isinstance(task.updated_at, datetime)

def test_task_model_without_description():
    """Test Task model with optional description"""
    task = Task(user_id="usr_123", title="Test Task")
    assert task.description is None

def test_task_model_title_required():
    """Test that title is required"""
    with pytest.raises(ValueError):
        Task(user_id="usr_123")  # Missing title

def test_task_model_user_id_required():
    """Test that user_id is required"""
    with pytest.raises(ValueError):
        Task(title="Test Task")  # Missing user_id

def test_task_model_title_max_length():
    """Test title max length constraint"""
    long_title = "x" * 201
    with pytest.raises(ValueError):
        Task(user_id="usr_123", title=long_title)

def test_task_model_description_max_length():
    """Test description max length constraint"""
    long_desc = "x" * 2001
    with pytest.raises(ValueError):
        Task(user_id="usr_123", title="Test", description=long_desc)
```

**Expected Outcome**: Run `pytest tests/unit/test_models.py` → All tests FAIL ❌

---

### Task 1.4: Implement Task Model (TDD Green)

**Priority**: P0 (Blocker)
**Estimated Effort**: 20 minutes
**Dependencies**: Task 1.3

**Description**: Implement `backend/app/models/task.py` to make tests pass.

**Acceptance Criteria**:
- [ ] Task model defined with all fields from data-model.md
- [ ] Field constraints enforced (title 1-200 chars, description max 2000 chars)
- [ ] Timestamps auto-populate on creation
- [ ] All tests from Task 1.3 PASS (Green phase)

**Implementation** (`backend/app/models/task.py`):
```python
from sqlmodel import Field, SQLModel
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    """Task entity representing a todo item"""
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**Expected Outcome**: Run `pytest tests/unit/test_models.py` → All tests PASS ✅

---

### Task 1.5: Create Pydantic Schemas (TDD Red)

**Priority**: P0 (Blocker)
**Estimated Effort**: 25 minutes
**Dependencies**: Task 1.4

**Description**: Write tests for TaskCreate, TaskUpdate, TaskResponse Pydantic schemas.

**Acceptance Criteria**:
- [ ] Test file created: `backend/tests/unit/test_schemas.py`
- [ ] Tests verify: validation rules, whitespace handling, null normalization
- [ ] Tests initially FAIL (Red phase)

**Test Cases** (`backend/tests/unit/test_schemas.py`):
```python
import pytest
from pydantic import ValidationError
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

class TestTaskCreate:
    def test_valid_task_create(self):
        """Test valid TaskCreate schema"""
        data = {"title": "Test Task", "description": "Test desc"}
        task = TaskCreate(**data)
        assert task.title == "Test Task"
        assert task.description == "Test desc"

    def test_task_create_title_required(self):
        """Test that title is required"""
        with pytest.raises(ValidationError) as exc_info:
            TaskCreate(description="Test")
        assert "title" in str(exc_info.value)

    def test_task_create_trims_whitespace(self):
        """Test that title whitespace is trimmed"""
        task = TaskCreate(title="  Test Task  ")
        assert task.title == "Test Task"

    def test_task_create_rejects_empty_title(self):
        """Test that empty/whitespace-only title is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            TaskCreate(title="   ")
        assert "whitespace" in str(exc_info.value).lower()

    def test_task_create_normalizes_empty_description(self):
        """Test that empty description is converted to None"""
        task = TaskCreate(title="Test", description="   ")
        assert task.description is None

class TestTaskUpdate:
    def test_valid_task_update(self):
        """Test valid TaskUpdate schema"""
        task = TaskUpdate(title="Updated", description="New desc")
        assert task.title == "Updated"

    def test_task_update_partial(self):
        """Test partial update (only title)"""
        task = TaskUpdate(title="Updated")
        assert task.title == "Updated"
        assert task.description is None

    def test_task_update_trims_whitespace(self):
        """Test that title whitespace is trimmed"""
        task = TaskUpdate(title="  Updated  ")
        assert task.title == "Updated"
```

**Expected Outcome**: Run `pytest tests/unit/test_schemas.py` → All tests FAIL ❌

---

### Task 1.6: Implement Pydantic Schemas (TDD Green)

**Priority**: P0 (Blocker)
**Estimated Effort**: 30 minutes
**Dependencies**: Task 1.5

**Description**: Implement `backend/app/schemas/task.py` with validation logic.

**Acceptance Criteria**:
- [ ] TaskCreate, TaskUpdate, TaskResponse schemas implemented
- [ ] Validators handle whitespace trimming and empty string normalization
- [ ] All tests from Task 1.5 PASS (Green phase)

**Implementation** (`backend/app/schemas/task.py`):
```python
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional

class TaskCreate(BaseModel):
    """Schema for creating a new task"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)

    @field_validator('title')
    @classmethod
    def title_not_whitespace(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace only')
        return v.strip()

    @field_validator('description')
    @classmethod
    def normalize_description(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            return None
        return v

class TaskUpdate(BaseModel):
    """Schema for updating an existing task"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)

    @field_validator('title')
    @classmethod
    def title_not_whitespace(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError('Title cannot be empty or whitespace only')
        return v.strip() if v else v

    @field_validator('description')
    @classmethod
    def normalize_description(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            return None
        return v

class TaskResponse(BaseModel):
    """Schema for task API responses"""
    id: int
    user_id: str
    title: str
    description: Optional[str]
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2 (was orm_mode in v1)
```

**Expected Outcome**: Run `pytest tests/unit/test_schemas.py` → All tests PASS ✅

---

### Task 1.7: Create JWT Security Module (TDD Red)

**Priority**: P0 (Blocker)
**Estimated Effort**: 30 minutes
**Dependencies**: Task 0.2

**Description**: Write tests for JWT decoding and user ID extraction.

**Acceptance Criteria**:
- [ ] Test file created: `backend/tests/unit/test_security.py`
- [ ] Tests verify: valid token decoding, expired token rejection, invalid signature handling, missing `sub` claim
- [ ] Tests initially FAIL (Red phase)

**Test Cases** (`backend/tests/unit/test_security.py`):
```python
import pytest
from jose import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException
from app.core.security import decode_jwt, verify_user_access

SECRET = "test_secret_key_1234567890"

def create_test_token(user_id: str, exp_delta: timedelta = timedelta(hours=1)) -> str:
    """Helper to create test JWT tokens"""
    payload = {
        "sub": user_id,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + exp_delta,
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

def test_decode_valid_jwt():
    """Test decoding a valid JWT token"""
    token = create_test_token("usr_123")
    payload = decode_jwt(token, SECRET)
    assert payload["sub"] == "usr_123"

def test_decode_expired_jwt():
    """Test that expired tokens are rejected"""
    token = create_test_token("usr_123", exp_delta=timedelta(seconds=-10))
    with pytest.raises(HTTPException) as exc_info:
        decode_jwt(token, SECRET)
    assert exc_info.value.status_code == 401
    assert "expired" in exc_info.value.detail.lower()

def test_decode_invalid_signature():
    """Test that tokens with invalid signatures are rejected"""
    token = create_test_token("usr_123")
    with pytest.raises(HTTPException) as exc_info:
        decode_jwt(token, "wrong_secret")
    assert exc_info.value.status_code == 401

def test_decode_missing_sub_claim():
    """Test that tokens without 'sub' claim are rejected"""
    payload = {"iat": datetime.utcnow(), "exp": datetime.utcnow() + timedelta(hours=1)}
    token = jwt.encode(payload, SECRET, algorithm="HS256")
    with pytest.raises(HTTPException) as exc_info:
        decode_jwt(token, SECRET)
    assert exc_info.value.status_code == 401
    assert "user ID" in exc_info.value.detail

def test_verify_user_access_allowed():
    """Test that matching user_id allows access"""
    # Should not raise exception
    verify_user_access(token_user_id="usr_123", path_user_id="usr_123")

def test_verify_user_access_denied():
    """Test that mismatched user_id denies access"""
    with pytest.raises(HTTPException) as exc_info:
        verify_user_access(token_user_id="usr_123", path_user_id="usr_456")
    assert exc_info.value.status_code == 403
    assert "access denied" in exc_info.value.detail.lower()
```

**Expected Outcome**: Run `pytest tests/unit/test_security.py` → All tests FAIL ❌

---

### Task 1.8: Implement JWT Security Module (TDD Green)

**Priority**: P0 (Blocker)
**Estimated Effort**: 35 minutes
**Dependencies**: Task 1.7

**Description**: Implement `backend/app/core/security.py` with JWT verification.

**Acceptance Criteria**:
- [ ] `decode_jwt()` decodes and validates JWT tokens
- [ ] `verify_user_access()` enforces user_id matching
- [ ] Proper HTTPExceptions raised with correct status codes
- [ ] All tests from Task 1.7 PASS (Green phase)

**Implementation** (`backend/app/core/security.py`):
```python
from jose import jwt, JWTError, ExpiredSignatureError
from fastapi import HTTPException, status
from typing import Dict, Any
from app.core.config import settings

def decode_jwt(token: str, secret: str = settings.BETTER_AUTH_SECRET) -> Dict[str, Any]:
    """
    Decode and validate JWT token.

    Args:
        token: JWT token string
        secret: Secret key for verification

    Returns:
        Decoded JWT payload

    Raises:
        HTTPException: 401 if token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )

        # Verify required claims
        if "sub" not in payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing user ID (sub claim)"
            )

        return payload

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}"
        )

def verify_user_access(token_user_id: str, path_user_id: str) -> None:
    """
    Verify that the authenticated user matches the path user_id.

    Args:
        token_user_id: User ID from JWT token (sub claim)
        path_user_id: User ID from URL path parameter

    Raises:
        HTTPException: 403 if user IDs don't match
    """
    if token_user_id != path_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: cannot access another user's resources"
        )
```

**Expected Outcome**: Run `pytest tests/unit/test_security.py` → All tests PASS ✅

---

### Task 1.9: Create FastAPI Dependencies (TDD Red)

**Priority**: P0 (Blocker)
**Estimated Effort**: 25 minutes
**Dependencies**: Task 1.8

**Description**: Write tests for `get_current_user` dependency.

**Acceptance Criteria**:
- [ ] Test file created: `backend/tests/unit/test_deps.py`
- [ ] Tests verify: token extraction from header, JWT validation, user_id extraction
- [ ] Tests initially FAIL (Red phase)

**Test Cases** (`backend/tests/unit/test_deps.py`):
```python
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from app.api.deps import get_current_user
from app.core.security import decode_jwt

def test_get_current_user_valid_token(monkeypatch):
    """Test extracting user_id from valid token"""
    # Mock the decode_jwt function
    def mock_decode(token, secret):
        return {"sub": "usr_123"}

    monkeypatch.setattr("app.api.deps.decode_jwt", mock_decode)

    # Simulate Authorization header
    from fastapi import Request
    request = Request(scope={
        "type": "http",
        "headers": [(b"authorization", b"Bearer valid_token_here")]
    })

    user_id = get_current_user(authorization="Bearer valid_token_here")
    assert user_id == "usr_123"

def test_get_current_user_missing_header():
    """Test that missing Authorization header raises 401"""
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(authorization=None)
    assert exc_info.value.status_code == 401

def test_get_current_user_invalid_scheme():
    """Test that non-Bearer scheme raises 401"""
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(authorization="Basic invalid")
    assert exc_info.value.status_code == 401
    assert "bearer" in exc_info.value.detail.lower()
```

**Expected Outcome**: Run `pytest tests/unit/test_deps.py` → All tests FAIL ❌

---

### Task 1.10: Implement FastAPI Dependencies (TDD Green)

**Priority**: P0 (Blocker)
**Estimated Effort**: 20 minutes
**Dependencies**: Task 1.9

**Description**: Implement `backend/app/api/deps.py` with authentication dependency.

**Acceptance Criteria**:
- [ ] `get_current_user()` extracts and validates JWT from Authorization header
- [ ] Returns user_id (sub claim) for use in endpoints
- [ ] All tests from Task 1.9 PASS (Green phase)

**Implementation** (`backend/app/api/deps.py`):
```python
from typing import Annotated
from fastapi import Depends, HTTPException, status, Header
from app.core.security import decode_jwt

def get_current_user(
    authorization: Annotated[str | None, Header()] = None
) -> str:
    """
    FastAPI dependency for extracting authenticated user ID from JWT.

    Args:
        authorization: Authorization header (Bearer <token>)

    Returns:
        User ID from JWT sub claim

    Raises:
        HTTPException: 401 if token is missing or invalid
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract token from "Bearer <token>"
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected 'Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]
    payload = decode_jwt(token)

    return payload["sub"]  # Return user_id
```

**Expected Outcome**: Run `pytest tests/unit/test_deps.py` → All tests PASS ✅

---

## Phase 2: Backend API Endpoints

**Goal**: Implement all 6 API endpoints with full CRUD operations.

### Task 2.1: Create List Tasks Endpoint (TDD Red)

**Priority**: P1 (High)
**Estimated Effort**: 30 minutes
**Dependencies**: Task 1.10

**Description**: Write integration tests for `GET /api/{user_id}/tasks` endpoint.

**Acceptance Criteria**:
- [ ] Test file created: `backend/tests/integration/test_tasks.py`
- [ ] Tests verify: authenticated access, user isolation, empty list handling
- [ ] Tests initially FAIL (Red phase)

**Test Cases** (`backend/tests/integration/test_tasks.py`):
```python
import pytest
from httpx import AsyncClient
from app.main import app
from app.core.database import get_session, create_db_and_tables
from app.models.task import Task

@pytest.fixture
async def client():
    """Test client fixture"""
    await create_db_and_tables()
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
def auth_headers():
    """Mock JWT authentication headers"""
    # In real tests, use proper JWT generation
    return {"Authorization": "Bearer mock_token_usr_123"}

@pytest.mark.asyncio
async def test_list_tasks_empty(client, auth_headers):
    """Test listing tasks when user has none"""
    response = await client.get("/api/usr_123/tasks", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []

@pytest.mark.asyncio
async def test_list_tasks_with_data(client, auth_headers, db_session):
    """Test listing tasks when user has tasks"""
    # Create test tasks
    task1 = Task(user_id="usr_123", title="Task 1")
    task2 = Task(user_id="usr_123", title="Task 2")
    db_session.add(task1)
    db_session.add(task2)
    await db_session.commit()

    response = await client.get("/api/usr_123/tasks", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["title"] == "Task 1"

@pytest.mark.asyncio
async def test_list_tasks_user_isolation(client, auth_headers, db_session):
    """Test that users only see their own tasks"""
    # Create tasks for different users
    task1 = Task(user_id="usr_123", title="User 123 Task")
    task2 = Task(user_id="usr_456", title="User 456 Task")
    db_session.add_all([task1, task2])
    await db_session.commit()

    response = await client.get("/api/usr_123/tasks", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "User 123 Task"

@pytest.mark.asyncio
async def test_list_tasks_unauthorized(client):
    """Test that missing auth returns 401"""
    response = await client.get("/api/usr_123/tasks")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_list_tasks_forbidden(client, auth_headers):
    """Test that accessing another user's tasks returns 403"""
    # Token is for usr_123 but trying to access usr_456
    response = await client.get("/api/usr_456/tasks", headers=auth_headers)
    assert response.status_code == 403
```

**Expected Outcome**: Run `pytest tests/integration/test_tasks.py::test_list_tasks*` → All tests FAIL ❌

---

### Task 2.2: Implement List Tasks Endpoint (TDD Green)

**Priority**: P1 (High)
**Estimated Effort**: 35 minutes
**Dependencies**: Task 2.1

**Description**: Implement `GET /api/{user_id}/tasks` in `backend/app/api/routes/tasks.py`.

**Acceptance Criteria**:
- [ ] Endpoint returns array of tasks for authenticated user
- [ ] Enforces user_id matching between JWT and URL
- [ ] Tasks ordered by created_at DESC
- [ ] All tests from Task 2.1 PASS (Green phase)

**Implementation** (`backend/app/api/routes/tasks.py`):
```python
from typing import List, Annotated
from fastapi import APIRouter, Depends, Path
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models.task import Task
from app.schemas.task import TaskResponse
from app.api.deps import get_current_user
from app.core.database import get_session
from app.core.security import verify_user_access

router = APIRouter(prefix="/api/{user_id}", tags=["tasks"])

@router.get("/tasks", response_model=List[TaskResponse])
async def list_tasks(
    user_id: Annotated[str, Path()],
    current_user: Annotated[str, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> List[Task]:
    """
    List all tasks for the authenticated user.

    Returns tasks ordered by creation date (most recent first).
    """
    # Verify user can access this resource
    verify_user_access(token_user_id=current_user, path_user_id=user_id)

    # Query tasks filtered by user_id
    statement = (
        select(Task)
        .where(Task.user_id == user_id)
        .order_by(Task.created_at.desc())
    )
    result = await session.execute(statement)
    tasks = result.scalars().all()

    return tasks
```

**Main App** (`backend/app/main.py`):
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import tasks
from app.core.config import settings

app = FastAPI(
    title="Neon-FastAPI-Next-Todo API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks.router)

@app.get("/")
async def root():
    return {"message": "Neon-FastAPI-Next-Todo API", "version": "1.0.0"}
```

**Expected Outcome**: Run `pytest tests/integration/test_tasks.py::test_list_tasks*` → All tests PASS ✅

---

### Task 2.3: Create Task Creation Endpoint (TDD Red)

**Priority**: P1 (High)
**Estimated Effort**: 25 minutes
**Dependencies**: Task 2.2

**Description**: Write integration tests for `POST /api/{user_id}/tasks` endpoint.

**Acceptance Criteria**:
- [ ] Tests verify: task creation, validation errors, user_id assignment
- [ ] Tests initially FAIL (Red phase)

**Test Cases** (add to `backend/tests/integration/test_tasks.py`):
```python
@pytest.mark.asyncio
async def test_create_task_success(client, auth_headers):
    """Test creating a task successfully"""
    payload = {"title": "New Task", "description": "Test description"}
    response = await client.post("/api/usr_123/tasks", json=payload, headers=auth_headers)

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "New Task"
    assert data["description"] == "Test description"
    assert data["user_id"] == "usr_123"
    assert data["is_completed"] is False
    assert "id" in data
    assert "created_at" in data

@pytest.mark.asyncio
async def test_create_task_without_description(client, auth_headers):
    """Test creating a task without optional description"""
    payload = {"title": "Minimal Task"}
    response = await client.post("/api/usr_123/tasks", json=payload, headers=auth_headers)

    assert response.status_code == 201
    data = response.json()
    assert data["description"] is None

@pytest.mark.asyncio
async def test_create_task_missing_title(client, auth_headers):
    """Test that missing title returns 422 validation error"""
    payload = {"description": "No title provided"}
    response = await client.post("/api/usr_123/tasks", json=payload, headers=auth_headers)

    assert response.status_code == 422

@pytest.mark.asyncio
async def test_create_task_empty_title(client, auth_headers):
    """Test that empty/whitespace title returns 422"""
    payload = {"title": "   "}
    response = await client.post("/api/usr_123/tasks", json=payload, headers=auth_headers)

    assert response.status_code == 422
    assert "whitespace" in response.json()["detail"][0]["msg"].lower()

@pytest.mark.asyncio
async def test_create_task_title_too_long(client, auth_headers):
    """Test that title exceeding 200 chars returns 422"""
    payload = {"title": "x" * 201}
    response = await client.post("/api/usr_123/tasks", json=payload, headers=auth_headers)

    assert response.status_code == 422
```

**Expected Outcome**: Run `pytest tests/integration/test_tasks.py::test_create_task*` → All tests FAIL ❌

---

### Task 2.4: Implement Task Creation Endpoint (TDD Green)

**Priority**: P1 (High)
**Estimated Effort**: 30 minutes
**Dependencies**: Task 2.3

**Description**: Implement `POST /api/{user_id}/tasks`.

**Acceptance Criteria**:
- [ ] Endpoint creates new task with validated data
- [ ] Assigns user_id from path to task
- [ ] Returns 201 Created with task data
- [ ] All tests from Task 2.3 PASS (Green phase)

**Implementation** (add to `backend/app/api/routes/tasks.py`):
```python
from fastapi import status
from app.schemas.task import TaskCreate

@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: Annotated[str, Path()],
    task_data: TaskCreate,
    current_user: Annotated[str, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Task:
    """
    Create a new task for the authenticated user.
    """
    # Verify user can access this resource
    verify_user_access(token_user_id=current_user, path_user_id=user_id)

    # Create task with validated data
    task = Task(
        user_id=user_id,
        title=task_data.title,
        description=task_data.description,
    )

    session.add(task)
    await session.commit()
    await session.refresh(task)

    return task
```

**Expected Outcome**: Run `pytest tests/integration/test_tasks.py::test_create_task*` → All tests PASS ✅

---

### Task 2.5: Create Update Task Endpoint (TDD Red → Green)

**Priority**: P2 (Medium)
**Estimated Effort**: 45 minutes
**Dependencies**: Task 2.4

**Description**: Implement `PUT /api/{user_id}/tasks/{task_id}` with TDD.

**Acceptance Criteria**:
- [ ] Tests written for update scenarios (full update, partial update, not found, forbidden)
- [ ] Endpoint implementation handles all test cases
- [ ] Updated timestamp is automatically updated
- [ ] All tests PASS

**Test Cases** (add to `backend/tests/integration/test_tasks.py`):
```python
@pytest.mark.asyncio
async def test_update_task_success(client, auth_headers, db_session):
    """Test updating a task successfully"""
    # Create task
    task = Task(user_id="usr_123", title="Original", description="Original desc")
    db_session.add(task)
    await db_session.commit()
    await db_session.refresh(task)

    # Update task
    payload = {"title": "Updated", "description": "Updated desc"}
    response = await client.put(f"/api/usr_123/tasks/{task.id}", json=payload, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated"
    assert data["description"] == "Updated desc"
    assert data["updated_at"] != data["created_at"]

@pytest.mark.asyncio
async def test_update_task_partial(client, auth_headers, db_session):
    """Test partial update (only title)"""
    task = Task(user_id="usr_123", title="Original", description="Keep this")
    db_session.add(task)
    await db_session.commit()
    await db_session.refresh(task)

    payload = {"title": "Updated Only"}
    response = await client.put(f"/api/usr_123/tasks/{task.id}", json=payload, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Only"
    assert data["description"] == "Keep this"

@pytest.mark.asyncio
async def test_update_task_not_found(client, auth_headers):
    """Test updating non-existent task returns 404"""
    payload = {"title": "Updated"}
    response = await client.put("/api/usr_123/tasks/99999", json=payload, headers=auth_headers)

    assert response.status_code == 404

@pytest.mark.asyncio
async def test_update_task_forbidden(client, auth_headers, db_session):
    """Test updating another user's task returns 403"""
    task = Task(user_id="usr_456", title="Other User Task")
    db_session.add(task)
    await db_session.commit()
    await db_session.refresh(task)

    payload = {"title": "Trying to update"}
    response = await client.put(f"/api/usr_123/tasks/{task.id}", json=payload, headers=auth_headers)

    assert response.status_code == 403
```

**Implementation** (add to `backend/app/api/routes/tasks.py`):
```python
from fastapi import HTTPException

@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: Annotated[str, Path()],
    task_id: Annotated[int, Path()],
    task_data: TaskUpdate,
    current_user: Annotated[str, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Task:
    """
    Update an existing task.
    """
    verify_user_access(token_user_id=current_user, path_user_id=user_id)

    # Fetch task
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = await session.execute(statement)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Update fields if provided
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description

    task.updated_at = datetime.utcnow()

    session.add(task)
    await session.commit()
    await session.refresh(task)

    return task
```

**Expected Outcome**: Run `pytest tests/integration/test_tasks.py::test_update_task*` → All tests PASS ✅

---

### Task 2.6: Create Delete Task Endpoint (TDD Red → Green)

**Priority**: P2 (Medium)
**Estimated Effort**: 35 minutes
**Dependencies**: Task 2.5

**Description**: Implement `DELETE /api/{user_id}/tasks/{task_id}` with TDD.

**Acceptance Criteria**:
- [ ] Tests written for delete scenarios (success, not found, forbidden)
- [ ] Endpoint returns 204 No Content on success
- [ ] All tests PASS

**Test Cases** (add to `backend/tests/integration/test_tasks.py`):
```python
@pytest.mark.asyncio
async def test_delete_task_success(client, auth_headers, db_session):
    """Test deleting a task successfully"""
    task = Task(user_id="usr_123", title="To Delete")
    db_session.add(task)
    await db_session.commit()
    await db_session.refresh(task)

    response = await client.delete(f"/api/usr_123/tasks/{task.id}", headers=auth_headers)

    assert response.status_code == 204

    # Verify task no longer exists
    result = await db_session.execute(select(Task).where(Task.id == task.id))
    assert result.scalar_one_or_none() is None

@pytest.mark.asyncio
async def test_delete_task_not_found(client, auth_headers):
    """Test deleting non-existent task returns 404"""
    response = await client.delete("/api/usr_123/tasks/99999", headers=auth_headers)
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_delete_task_forbidden(client, auth_headers, db_session):
    """Test deleting another user's task returns 403"""
    task = Task(user_id="usr_456", title="Other User Task")
    db_session.add(task)
    await db_session.commit()
    await db_session.refresh(task)

    response = await client.delete(f"/api/usr_123/tasks/{task.id}", headers=auth_headers)
    assert response.status_code == 403
```

**Implementation** (add to `backend/app/api/routes/tasks.py`):
```python
@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: Annotated[str, Path()],
    task_id: Annotated[int, Path()],
    current_user: Annotated[str, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> None:
    """
    Delete a task permanently.
    """
    verify_user_access(token_user_id=current_user, path_user_id=user_id)

    # Fetch task
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = await session.execute(statement)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await session.delete(task)
    await session.commit()
```

**Expected Outcome**: Run `pytest tests/integration/test_tasks.py::test_delete_task*` → All tests PASS ✅

---

### Task 2.7: Create Toggle Completion Endpoint (TDD Red → Green)

**Priority**: P2 (Medium)
**Estimated Effort**: 40 minutes
**Dependencies**: Task 2.6

**Description**: Implement `PATCH /api/{user_id}/tasks/{task_id}/complete` with TDD.

**Acceptance Criteria**:
- [ ] Tests written for toggle scenarios (incomplete→complete, complete→incomplete)
- [ ] Endpoint toggles `is_completed` field
- [ ] All tests PASS

**Test Cases** (add to `backend/tests/integration/test_tasks.py`):
```python
@pytest.mark.asyncio
async def test_toggle_task_to_complete(client, auth_headers, db_session):
    """Test toggling task from incomplete to complete"""
    task = Task(user_id="usr_123", title="To Complete", is_completed=False)
    db_session.add(task)
    await db_session.commit()
    await db_session.refresh(task)

    response = await client.patch(f"/api/usr_123/tasks/{task.id}/complete", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["is_completed"] is True

@pytest.mark.asyncio
async def test_toggle_task_to_incomplete(client, auth_headers, db_session):
    """Test toggling task from complete to incomplete"""
    task = Task(user_id="usr_123", title="To Uncomplete", is_completed=True)
    db_session.add(task)
    await db_session.commit()
    await db_session.refresh(task)

    response = await client.patch(f"/api/usr_123/tasks/{task.id}/complete", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["is_completed"] is False

@pytest.mark.asyncio
async def test_toggle_task_not_found(client, auth_headers):
    """Test toggling non-existent task returns 404"""
    response = await client.patch("/api/usr_123/tasks/99999/complete", headers=auth_headers)
    assert response.status_code == 404
```

**Implementation** (add to `backend/app/api/routes/tasks.py`):
```python
@router.patch("/tasks/{task_id}/complete", response_model=TaskResponse)
async def toggle_task_completion(
    user_id: Annotated[str, Path()],
    task_id: Annotated[int, Path()],
    current_user: Annotated[str, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Task:
    """
    Toggle task completion status (complete ↔ incomplete).
    """
    verify_user_access(token_user_id=current_user, path_user_id=user_id)

    # Fetch task
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = await session.execute(statement)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Toggle completion status
    task.is_completed = not task.is_completed
    task.updated_at = datetime.utcnow()

    session.add(task)
    await session.commit()
    await session.refresh(task)

    return task
```

**Expected Outcome**: Run `pytest tests/integration/test_tasks.py::test_toggle_task*` → All tests PASS ✅

---

## Phase 3: Frontend Setup & Authentication

**Goal**: Set up Next.js with Better Auth and create authentication pages.

### Task 3.1: Configure Better Auth

**Priority**: P0 (Blocker)
**Estimated Effort**: 30 minutes
**Dependencies**: Task 0.4

**Description**: Configure Better Auth with JWT plugin and Neon database.

**Acceptance Criteria**:
- [ ] File created: `frontend/src/lib/auth.ts`
- [ ] Better Auth configured with PostgreSQL adapter
- [ ] JWT plugin enabled with 24-hour expiration
- [ ] BETTER_AUTH_SECRET loaded from environment
- [ ] Database connection tested

**Implementation** (`frontend/src/lib/auth.ts`):
```typescript
import { betterAuth } from "better-auth";
import { Pool } from "pg";

// Initialize PostgreSQL pool for Better Auth
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const auth = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours (in seconds)
  },
  plugins: [
    // JWT Plugin for token generation
    {
      id: "jwt",
      hooks: {
        async onSignIn({ user, session }) {
          // Generate JWT with user ID in sub claim
          return {
            ...session,
            jwt: generateJWT(user.id),
          };
        },
      },
    },
  ],
});

export type Auth = typeof auth;
```

**Test**: Run `npm run dev` and verify no configuration errors.

---

### Task 3.2: Create API Client Helper

**Priority**: P0 (Blocker)
**Estimated Effort**: 35 minutes
**Dependencies**: Task 3.1

**Description**: Create `frontend/src/lib/api.ts` for API communication with JWT injection.

**Acceptance Criteria**:
- [ ] File created: `frontend/src/lib/api.ts`
- [ ] All CRUD methods implemented (listTasks, createTask, updateTask, deleteTask, toggleTask)
- [ ] JWT automatically injected from Better Auth session
- [ ] Error handling with user-friendly messages
- [ ] TypeScript interfaces for Task model

**Implementation** (`frontend/src/lib/types.ts`):
```typescript
export interface Task {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
}
```

**Implementation** (`frontend/src/lib/api.ts`):
```typescript
import { auth } from "./auth";
import { Task, TaskCreate, TaskUpdate } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Get Authorization header with JWT from Better Auth session
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await auth.getSession();

  if (!session?.user?.id || !session?.jwt) {
    throw new Error("Not authenticated");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.jwt}`,
  };
}

/**
 * Get current user ID from session
 */
async function getCurrentUserId(): Promise<string> {
  const session = await auth.getSession();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  return session.user.id;
}

/**
 * Handle API response errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * List all tasks for the authenticated user
 */
export async function listTasks(): Promise<Task[]> {
  const userId = await getCurrentUserId();
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks`, {
    method: "GET",
    headers,
  });

  return handleResponse<Task[]>(response);
}

/**
 * Create a new task
 */
export async function createTask(data: TaskCreate): Promise<Task> {
  const userId = await getCurrentUserId();
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  return handleResponse<Task>(response);
}

/**
 * Update an existing task
 */
export async function updateTask(taskId: number, data: TaskUpdate): Promise<Task> {
  const userId = await getCurrentUserId();
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks/${taskId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  return handleResponse<Task>(response);
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: number): Promise<void> {
  const userId = await getCurrentUserId();
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks/${taskId}`, {
    method: "DELETE",
    headers,
  });

  return handleResponse<void>(response);
}

/**
 * Toggle task completion status
 */
export async function toggleTaskCompletion(taskId: number): Promise<Task> {
  const userId = await getCurrentUserId();
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks/${taskId}/complete`, {
    method: "PATCH",
    headers,
  });

  return handleResponse<Task>(response);
}
```

**Test**: Create simple test page to verify API methods compile without errors.

---

### Task 3.3: Create Login Page

**Priority**: P1 (High)
**Estimated Effort**: 40 minutes
**Dependencies**: Task 3.1

**Description**: Build login page at `/auth/signin` using Better Auth.

**Acceptance Criteria**:
- [ ] File created: `frontend/src/app/auth/signin/page.tsx`
- [ ] Form with email and password fields
- [ ] Form validation (email format, password min length)
- [ ] Better Auth `signIn` function integrated
- [ ] Redirect to `/dashboard` on success
- [ ] Error messages displayed for failed login
- [ ] Link to signup page

**Implementation** (`frontend/src/app/auth/signin/page.tsx`):
```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await auth.signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="text-sm text-center">
            <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
```

**Test**: Navigate to `http://localhost:3000/auth/signin` and verify form renders correctly.

---

### Task 3.4: Create Signup Page

**Priority**: P1 (High)
**Estimated Effort**: 40 minutes
**Dependencies**: Task 3.3

**Description**: Build signup page at `/auth/signup` using Better Auth.

**Acceptance Criteria**:
- [ ] File created: `frontend/src/app/auth/signup/page.tsx`
- [ ] Form with email, password, and password confirmation
- [ ] Form validation (passwords match, min 8 characters)
- [ ] Better Auth `signUp` function integrated
- [ ] Auto-login and redirect to `/dashboard` on success
- [ ] Error messages for existing email, validation failures
- [ ] Link to login page

**Implementation** (`frontend/src/app/auth/signup/page.tsx`):
```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await auth.signUp("credentials", {
        email,
        password,
      });

      // Auto sign-in after successful registration
      await auth.signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </div>

          <div className="text-sm text-center">
            <Link href="/auth/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
```

**Test**: Navigate to `http://localhost:3000/auth/signup` and verify form validation works.

---

## Phase 4: Frontend Dashboard

**Goal**: Build the task dashboard with full CRUD functionality.

### Task 4.1: Create Dashboard Layout

**Priority**: P1 (High)
**Estimated Effort**: 45 minutes
**Dependencies**: Task 3.4

**Description**: Build the main dashboard page structure with header and task container.

**Acceptance Criteria**:
- [ ] File created: `frontend/src/app/dashboard/page.tsx`
- [ ] Protected route (redirects to login if not authenticated)
- [ ] Header with app title and logout button
- [ ] Task list container (empty state message)
- [ ] Loading state while fetching tasks
- [ ] Mobile-responsive layout

**Implementation** (`frontend/src/app/dashboard/page.tsx`):
```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { auth } from "@/lib/auth";
import { listTasks } from "@/lib/api";
import { Task } from "@/lib/types";
import TaskList from "@/components/task-list";
import TaskForm from "@/components/task-form";

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuthAndLoadTasks();
  }, []);

  async function checkAuthAndLoadTasks() {
    try {
      const session = await auth.getSession();

      if (!session?.user) {
        router.push("/auth/signin");
        return;
      }

      // Load tasks
      const fetchedTasks = await listTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await auth.signOut();
    router.push("/auth/signin");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Task Form (will be implemented in next task) */}
        <div className="mb-8">
          <TaskForm onTaskCreated={(newTask) => setTasks([newTask, ...tasks])} />
        </div>

        {/* Task List (will be implemented in next task) */}
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No tasks yet. Create your first task above!</p>
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            onTaskUpdated={(updatedTask) => {
              setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
            }}
            onTaskDeleted={(taskId) => {
              setTasks(tasks.filter((t) => t.id !== taskId));
            }}
          />
        )}
      </main>
    </div>
  );
}
```

**Test**: Navigate to `/dashboard` while not logged in → should redirect to `/auth/signin`.

---

### Task 4.2: Create Task Form Component

**Priority**: P1 (High)
**Estimated Effort**: 35 minutes
**Dependencies**: Task 4.1

**Description**: Build task creation form component.

**Acceptance Criteria**:
- [ ] File created: `frontend/src/components/task-form.tsx`
- [ ] Form with title (required) and description (optional) fields
- [ ] Client-side validation (title 1-200 chars, description max 2000 chars)
- [ ] Calls `createTask` API on submit
- [ ] Shows loading state during creation
- [ ] Clears form after successful creation
- [ ] Emits `onTaskCreated` event with new task

**Implementation** (`frontend/src/components/task-form.tsx`):
```typescript
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createTask } from "@/lib/api";
import { Task } from "@/lib/types";

interface TaskFormProps {
  onTaskCreated: (task: Task) => void;
}

export default function TaskForm({ onTaskCreated }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validate title
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (title.length > 200) {
      setError("Title must be 200 characters or less");
      return;
    }

    if (description.length > 2000) {
      setError("Description must be 2000 characters or less");
      return;
    }

    setLoading(true);

    try {
      const newTask = await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
      });

      onTaskCreated(newTask);

      // Clear form
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Add New Task</h2>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">{title.length}/200 characters</p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            rows={3}
            maxLength={2000}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">{description.length}/2000 characters</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          <Plus size={20} />
          {loading ? "Adding..." : "Add Task"}
        </button>
      </div>
    </form>
  );
}
```

**Test**: Fill form and submit → verify task appears in database via backend `/docs` endpoint.

---

### Task 4.3: Create Task List Component

**Priority**: P1 (High)
**Estimated Effort**: 50 minutes
**Dependencies**: Task 4.2

**Description**: Build task list display with toggle and delete functionality.

**Acceptance Criteria**:
- [ ] File created: `frontend/src/components/task-list.tsx`
- [ ] Displays tasks with title, description, completion status
- [ ] Checkbox to toggle completion (calls `toggleTaskCompletion`)
- [ ] Delete button (calls `deleteTask`)
- [ ] Completed tasks visually differentiated (strikethrough, different color)
- [ ] Emits `onTaskUpdated` and `onTaskDeleted` events
- [ ] Responsive grid layout

**Implementation** (`frontend/src/components/task-list.tsx`):
```typescript
"use client";

import { Check, Trash2, X } from "lucide-react";
import { toggleTaskCompletion, deleteTask } from "@/lib/api";
import { Task } from "@/lib/types";

interface TaskListProps {
  tasks: Task[];
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: number) => void;
}

export default function TaskList({ tasks, onTaskUpdated, onTaskDeleted }: TaskListProps) {
  async function handleToggle(task: Task) {
    try {
      const updatedTask = await toggleTaskCompletion(task.id);
      onTaskUpdated(updatedTask);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to toggle task");
    }
  }

  async function handleDelete(taskId: number) {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await deleteTask(taskId);
      onTaskDeleted(taskId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete task");
    }
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`bg-white rounded-lg shadow p-4 flex items-start gap-4 ${
            task.is_completed ? "opacity-75" : ""
          }`}
        >
          {/* Checkbox */}
          <button
            onClick={() => handleToggle(task)}
            className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center ${
              task.is_completed
                ? "bg-green-500 border-green-500"
                : "border-gray-300 hover:border-green-500"
            }`}
          >
            {task.is_completed && <Check size={16} className="text-white" />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={`text-lg font-medium ${
                task.is_completed ? "line-through text-gray-500" : "text-gray-900"
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="mt-1 text-sm text-gray-600">{task.description}</p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              Created {new Date(task.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Delete Button */}
          <button
            onClick={() => handleDelete(task.id)}
            className="flex-shrink-0 text-red-500 hover:text-red-700"
            title="Delete task"
          >
            <Trash2 size={20} />
          </button>
        </div>
      ))}
    </div>
  );
}
```

**Test**: Create tasks via form → verify they appear in list → toggle and delete to test functionality.

---

## Phase 5: Integration & Polish

**Goal**: Connect frontend to backend and add polish features.

### Task 5.1: Add Loading States

**Priority**: P2 (Medium)
**Estimated Effort**: 30 minutes
**Dependencies**: Task 4.3

**Description**: Add loading spinners and skeleton screens during API calls.

**Acceptance Criteria**:
- [ ] Loading spinner on dashboard while fetching tasks
- [ ] Button disabled states during API operations
- [ ] Optimistic UI updates (immediate feedback before API response)
- [ ] Skeleton placeholders for task list

**Implementation**: Update existing components with loading states (details omitted for brevity - standard React patterns).

---

### Task 5.2: Add Error Handling & Toasts

**Priority**: P2 (Medium)
**Estimated Effort**: 40 minutes
**Dependencies**: Task 5.1

**Description**: Implement toast notifications for success/error feedback.

**Acceptance Criteria**:
- [ ] Toast component for success/error messages
- [ ] API errors display user-friendly messages
- [ ] Success toasts for create/update/delete operations
- [ ] Auto-dismiss after 3 seconds

**Implementation**: Install `react-hot-toast` or similar and integrate into API client.

---

### Task 5.3: Add Session Persistence

**Priority**: P2 (Medium)
**Estimated Effort**: 25 minutes
**Dependencies**: Task 3.2

**Description**: Ensure session persists across page refreshes.

**Acceptance Criteria**:
- [ ] Session stored in secure cookie or localStorage
- [ ] Dashboard checks session on mount
- [ ] Auto-redirect to login if session expired
- [ ] Session refresh mechanism (if token near expiration)

**Implementation**: Configure Better Auth session storage settings.

---

### Task 5.4: Add Responsive Mobile Design

**Priority**: P2 (Medium)
**Estimated Effort**: 35 minutes
**Dependencies**: Task 4.3

**Description**: Ensure all pages work on mobile devices (320px+).

**Acceptance Criteria**:
- [ ] All pages render correctly on mobile (320px, 375px, 425px)
- [ ] Touch-friendly buttons (min 44px tap targets)
- [ ] Mobile navigation (hamburger menu if needed)
- [ ] Forms stack vertically on mobile

**Implementation**: Use Tailwind responsive classes (`sm:`, `md:`, `lg:`).

---

## Phase 6: Testing & Deployment Prep

**Goal**: Ensure all tests pass and prepare for deployment.

### Task 6.1: Run Full Backend Test Suite

**Priority**: P0 (Blocker)
**Estimated Effort**: 20 minutes
**Dependencies**: Task 2.7

**Description**: Run all backend tests and ensure 100% pass rate.

**Acceptance Criteria**:
- [ ] All unit tests pass (`pytest tests/unit/`)
- [ ] All integration tests pass (`pytest tests/integration/`)
- [ ] Code coverage >80% for core modules
- [ ] No linting errors (`ruff check` or `pylint`)

**Commands**:
```bash
cd backend
source venv/bin/activate
pytest tests/ -v --cov=app --cov-report=html
ruff check app/
```

---

### Task 6.2: Run Full Frontend Test Suite

**Priority**: P0 (Blocker)
**Estimated Effort**: 20 minutes
**Dependencies**: Task 5.4

**Description**: Run all frontend tests and ensure pass rate.

**Acceptance Criteria**:
- [ ] All component tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)

**Commands**:
```bash
cd frontend
npm test
npm run type-check
npm run lint
npm run build
```

---

### Task 6.3: Create Database Migrations

**Priority**: P0 (Blocker)
**Estimated Effort**: 30 minutes
**Dependencies**: Task 1.4

**Description**: Create Alembic migration for initial schema.

**Acceptance Criteria**:
- [ ] Alembic configured in `backend/alembic.ini`
- [ ] Initial migration created: `001_initial_schema.py`
- [ ] Migration creates `users` and `tasks` tables
- [ ] Migration applies successfully to test database
- [ ] Downgrade works correctly

**Commands**:
```bash
cd backend
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
alembic downgrade -1  # Test rollback
alembic upgrade head  # Re-apply
```

---

### Task 6.4: Write Deployment Documentation

**Priority**: P1 (High)
**Estimated Effort**: 45 minutes
**Dependencies**: Task 6.3

**Description**: Document deployment process for production.

**Acceptance Criteria**:
- [ ] File created: `specs/001-todo-app/deployment.md`
- [ ] Environment variable requirements documented
- [ ] Database migration instructions included
- [ ] Frontend build and deployment steps
- [ ] Backend deployment steps (Docker or direct)
- [ ] HTTPS configuration notes
- [ ] Monitoring and logging setup

---

## Summary

**Total Tasks**: 30 tasks across 6 phases

**Phase Breakdown**:
- Phase 0: Project Initialization (4 tasks)
- Phase 1: Backend Core & Database (10 tasks)
- Phase 2: Backend API Endpoints (7 tasks)
- Phase 3: Frontend Setup & Authentication (4 tasks)
- Phase 4: Frontend Dashboard (3 tasks)
- Phase 5: Integration & Polish (4 tasks)
- Phase 6: Testing & Deployment Prep (4 tasks)

**Parallel Execution Opportunities**:
- Phase 0: Tasks 0.1-0.2 (backend) can run parallel to 0.3-0.4 (frontend)
- Phase 1: After database config (1.2), can parallelize model (1.3-1.4), schemas (1.5-1.6), and security (1.7-1.8)
- Phase 2: After first endpoint (2.2), can parallelize remaining endpoints (2.3-2.7)
- Phase 3: Auth pages (3.3-3.4) can be built in parallel
- Phase 5: Polish tasks (5.1-5.4) can be done in any order

**Estimated Total Time**: 18-22 hours (with parallel execution: 14-16 hours)

**Next Steps**:
1. Review this task breakdown with stakeholders
2. Create GitHub issues from tasks using `/sp.taskstoissues`
3. Start with Phase 0 initialization tasks
4. Follow TDD workflow: Red → Green → Refactor for each task
5. Create PHR after completing each phase
