# Todo App - Full-Stack Task Management

A modern, secure, multi-user todo application built with Next.js, FastAPI, and Better Auth.

## Features

- **Secure Authentication**: JWT-based authentication with Better Auth
- **User Isolation**: Each user can only access their own tasks
- **Real-time Updates**: Instant task creation, updates, and deletion
- **Responsive Design**: Optimized for mobile (320px+), tablet, and desktop
- **Loading States**: Skeleton screens and spinners for better UX
- **Toast Notifications**: Real-time feedback for all user actions
- **Type Safety**: Full TypeScript on frontend, Python type hints on backend
- **Modern Stack**: Next.js 16+, FastAPI async, PostgreSQL

## Tech Stack

### Frontend
- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Authentication**: Better Auth
- **Icons**: Lucide React
- **Notifications**: react-hot-toast
- **HTTP Client**: Fetch API with automatic JWT injection

### Backend
- **Framework**: FastAPI (async)
- **Language**: Python 3.11+
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Database**: PostgreSQL with asyncpg driver
- **Validation**: Pydantic schemas
- **Testing**: pytest with pytest-asyncio
- **Migrations**: Alembic

### Database
- **Primary**: PostgreSQL (Neon recommended)
- **Connection Pooling**: Built-in with SQLAlchemy
- **Migrations**: Alembic for schema versioning

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py           # FastAPI dependencies (auth)
│   │   │   └── routes/
│   │   │       └── tasks.py      # Task CRUD endpoints
│   │   ├── core/
│   │   │   ├── config.py         # Pydantic settings
│   │   │   ├── database.py       # Async SQLModel engine
│   │   │   └── security.py       # JWT verification
│   │   ├── models/
│   │   │   └── task.py           # Task SQLModel entity
│   │   ├── schemas/
│   │   │   └── task.py           # Pydantic request/response schemas
│   │   └── main.py               # FastAPI app with CORS
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── test_database.py
│   │   │   └── test_models.py
│   │   └── integration/
│   ├── alembic/                  # Database migrations
│   ├── requirements.txt          # Python dependencies
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── signin/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── page.tsx              # Landing page
│   │   └── layout.tsx
│   ├── components/
│   │   ├── task-form.tsx         # Task creation form
│   │   ├── task-list.tsx         # Task list with actions
│   │   ├── skeleton.tsx          # Loading skeletons
│   │   └── toast-provider.tsx   # Toast notification setup
│   ├── lib/
│   │   ├── auth.ts               # Better Auth config
│   │   ├── api.ts                # API client with JWT
│   │   └── types.ts              # TypeScript interfaces
│   ├── package.json
│   └── .env.local.example
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL database (local or Neon)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd to-do-app
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database URL and secrets
```

**Backend .env**:
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/todoapp
BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
```

```bash
# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

Backend will run on http://localhost:8000

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local
# Edit .env.local with API URL and database connection
```

**Frontend .env.local**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
DATABASE_URL=postgresql://user:password@localhost:5432/todoapp
BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars
```

```bash
# Start development server
npm run dev
```

Frontend will run on http://localhost:3000

### 4. Access the Application

1. Visit http://localhost:3000
2. Click "Sign Up" to create an account
3. Sign in and start managing tasks!

## API Endpoints

### Authentication
- Handled by Better Auth (automatic)

### Tasks API

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

#### List Tasks
```
GET /api/{user_id}/tasks
```

#### Create Task
```
POST /api/{user_id}/tasks
Content-Type: application/json

{
  "title": "Task title",
  "description": "Optional description"
}
```

#### Get Task
```
GET /api/{user_id}/tasks/{task_id}
```

#### Update Task
```
PUT /api/{user_id}/tasks/{task_id}
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description"
}
```

#### Delete Task
```
DELETE /api/{user_id}/tasks/{task_id}
```

#### Toggle Task Completion
```
PATCH /api/{user_id}/tasks/{task_id}/complete
```

## Development

### Backend Development

```bash
cd backend
source venv/bin/activate

# Run tests
pytest tests/ -v

# Run with auto-reload
uvicorn app.main:app --reload

# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Frontend Development

```bash
cd frontend

# Run development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Run production build
npm start
```

## Testing

### Backend Tests

```bash
cd backend
source venv/bin/activate
pytest tests/ -v --cov=app
```

Test coverage includes:
- Database connection and session management
- Task model validation
- Security functions (JWT decoding, user verification)
- API endpoint integration tests

### Frontend Tests

```bash
cd frontend
npm test
```

## Security Features

- **JWT Authentication**: Stateless authentication with HS256 algorithm
- **User Isolation**: Users can only access their own tasks (verified at API level)
- **Password Hashing**: Handled automatically by Better Auth
- **Input Validation**: Multi-layer validation (Pydantic + TypeScript)
- **CORS Protection**: Configured to allow only frontend domain
- **SQL Injection Protection**: Parameterized queries via SQLModel
- **XSS Protection**: React's built-in escaping

## Performance Optimizations

- **Async/Await**: All database operations are async
- **Connection Pooling**: SQLAlchemy connection pool configured
- **React Suspense**: Loading states with skeleton screens
- **Lazy Loading**: Dynamic imports for route-based code splitting
- **Optimistic Updates**: Immediate UI updates with rollback on error
- **Index Optimization**: Database indexes on user_id for fast queries

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions including:
- Environment variable configuration
- Database setup with Neon
- Backend deployment (Railway, Render, Docker)
- Frontend deployment (Vercel, Netlify, Docker)
- CORS configuration
- Health checks
- Monitoring setup

## Responsive Design

Fully responsive across all devices:
- **Mobile**: 320px+ (iPhone SE and up)
- **Tablet**: 640px+ (iPad and up)
- **Desktop**: 1024px+ (Laptops and desktops)

See [frontend/RESPONSIVE_DESIGN.md](./frontend/RESPONSIVE_DESIGN.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Troubleshooting

### Common Issues

**Database Connection Error**
- Verify DATABASE_URL format
- Check database is running
- Ensure asyncpg is installed

**CORS Error**
- Verify FRONTEND_URL in backend .env
- Check browser console for exact origin
- Ensure credentials are included in requests

**Authentication Not Working**
- Verify BETTER_AUTH_SECRET matches in both .env files
- Check users table exists in database
- Verify JWT token is being sent in Authorization header

**Tasks Not Loading**
- Check browser console for errors
- Verify API is running on correct port
- Check JWT token is valid and not expired

For more help, see [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section.

## Acknowledgments

- Next.js team for the amazing framework
- FastAPI for the high-performance API framework
- Better Auth for simplified authentication
- Tailwind CSS for utility-first styling
