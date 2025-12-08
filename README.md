# Tasky

A small production-like Todo application built with:
- Backend: ASP.NET Core 8 + EF Core + PostgreSQL
- Frontend: React + TypeScript (Vite) + TailwindCSS
- Orchestration: Docker Compose
- Tests: xUnit (backend), React Testing Library + Jest (frontend)
- CI: GitHub Actions running tests

## Features
- Create tasks (title + description)
- Show only most recent 5 non-completed tasks
- Mark task as completed to hide it
- Input validation, logging, health endpoint
- DB table named `task`

## Repo Structure
- `backend/src/Tasky.Api`: ASP.NET Core API
- `backend/tests/Tasky.Tests`: xUnit tests
- `frontend`: React app
- `docker-compose.yml`: Orchestration
- `.env.example`: environment variables template

## Environment
Copy `.env.example` to `.env` and adjust as needed.

## Running with Docker
```powershell
# From repo root
Copy-Item .env.example .env
# Build and start
docker compose build; docker compose up -d
# Check health
Invoke-WebRequest http://localhost:8080/health
```
Frontend at `http://localhost:5173`, API at `http://localhost:8080`.

## API
- `GET /api/tasks?limit=5`
- `POST /api/tasks` with `{ title, description? }`
- `PATCH /api/tasks/{id}/complete`

## Backend: local build/test
```powershell
# Build API
dotnet build backend/src/Tasky.Api/Tasky.Api.csproj
# Run tests
dotnet test backend/tests/Tasky.Tests/Tasky.Tests.csproj
```

## Frontend: local dev/test
```powershell
# Install deps
cd frontend; npm install
# Run dev server
$env:VITE_API_BASE_URL="http://localhost:8080"; npm run dev
# Run tests
npm test
```

## CI
A GitHub Actions workflow runs both backend and frontend tests.
