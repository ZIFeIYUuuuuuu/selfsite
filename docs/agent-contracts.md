# Agent Contracts And File Ownership

This document is the shared contract for the first runnable version of the project.
All agents must follow these boundaries before implementation.

## Repository Goal

Build a first runnable personal-site monorepo with:

- `frontend`: Next.js + TypeScript
- `backend`: FastAPI
- `PostgreSQL`
- `Redis`
- `Caddy`
- `Docker Compose`

Priority order:

1. Runnable locally
2. Clear structure
3. Easy to extend later

## File Ownership

Each lane owns a disjoint write scope during parallel execution.

### Architect

Owns:

- `docs/architecture.md`

Does not edit:

- runtime code
- Docker files
- README

### Frontend

Owns:

- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/tsconfig.json`
- `frontend/next.config.ts`
- `frontend/next-env.d.ts`
- `frontend/.gitignore`
- `frontend/app/**`
- `frontend/components/**`
- `frontend/lib/**`
- `frontend/public/**`
- `frontend/eslint.config.*`

Does not edit:

- `frontend/Dockerfile`
- top-level infra files
- backend files

### Backend

Owns:

- `backend/app/main.py`
- `backend/app/api/**`
- `backend/app/core/**`
- `backend/app/modules/**`
- `backend/requirements.txt`
- `backend/.gitignore`

Does not edit:

- `backend/app/db/**`
- `backend/alembic/**`
- `backend/Dockerfile`
- frontend files

### Data

Owns:

- `backend/app/db/**`
- `backend/alembic/**`
- `backend/alembic.ini`

Does not edit:

- FastAPI routing
- frontend files
- Docker files

### DevOps

Owns:

- `docker-compose.yml`
- `Caddyfile`
- `.env.example`
- `frontend/Dockerfile`
- `backend/Dockerfile`
- `README.md`

Does not edit:

- frontend runtime source
- backend runtime source

### QA

Owns:

- `docs/qa-report.md`

Does not edit:

- implementation files unless the lead agent explicitly reassigns ownership later

### Main Agent

Owns final integration after all specialist lanes complete.
May edit any file only after parallel work is finished.

## Service Boundaries

### Frontend

- Renders the personal site UI
- Uses browser requests to `/api/v1/health`
- Must work in local Next.js dev mode and behind Caddy

### Backend

- Exposes `GET /health`
- Exposes `GET /api/v1/health`
- Returns JSON only
- Owns config loading, CORS, and module registration

### Data Layer

- Provides SQLAlchemy session setup
- Provides Alembic migration bootstrap
- Provides Redis client bootstrap
- Must remain business-agnostic

### Proxy

- Caddy routes `/api/*` to backend
- Caddy routes all other traffic to frontend

## API Contract

### GET /health

Purpose:

- direct backend health check

Response:

```json
{
  "status": "ok",
  "service": "backend"
}
```

### GET /api/v1/health

Purpose:

- versioned public API health check used by frontend and proxy validation

Response:

```json
{
  "status": "ok",
  "service": "backend",
  "version": "v1"
}
```

## Frontend To Backend Access Contract

Use the simplest path that works in dev and production:

- Frontend browser code calls relative path `/api/v1/health`
- In local frontend-only dev, Next.js rewrites `/api/*` to `BACKEND_ORIGIN`
- In Docker Compose, Caddy proxies `/api/*` to backend

This avoids hardcoding different API URLs inside UI code.

## Environment Variable Contract

All variables must be present in `.env.example`.

### Shared / Infra

- `COMPOSE_PROJECT_NAME=selfsite`
- `CADDY_HTTP_PORT=80`

### Frontend

- `NEXT_PUBLIC_SITE_NAME=Self Site`
- `BACKEND_ORIGIN=http://localhost:8000`
- `NEXT_TELEMETRY_DISABLED=1`

### Backend

- `APP_NAME=selfsite-backend`
- `APP_ENV=development`
- `APP_DEBUG=true`
- `API_V1_PREFIX=/api/v1`
- `BACKEND_HOST=0.0.0.0`
- `BACKEND_PORT=8000`
- `CORS_ORIGINS=http://localhost,http://localhost:3000`
- `DATABASE_URL=postgresql+psycopg://postgres:postgres@db:5432/selfsite`
- `REDIS_URL=redis://redis:6379/0`

### Database

- `POSTGRES_DB=selfsite`
- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=postgres`

## Directory Contract

Top-level target layout:

```text
.
|-- .env.example
|-- Caddyfile
|-- README.md
|-- docker-compose.yml
|-- docs/
|   |-- agent-contracts.md
|   |-- architecture.md
|   `-- qa-report.md
|-- frontend/
|   |-- Dockerfile
|   |-- app/
|   |-- components/
|   `-- lib/
`-- backend/
    |-- Dockerfile
    |-- requirements.txt
    |-- alembic.ini
    |-- alembic/
    `-- app/
        |-- api/
        |-- core/
        |-- db/
        `-- modules/
```

## Technical Decisions

### Next.js App Router

Why:

- standard modern default
- small surface for first runnable version

Alternative:

- Pages Router

Why not now:

- App Router is the current default and sufficient for a fresh scaffold

### FastAPI + SQLAlchemy + Alembic

Why:

- common, extensible, well-understood stack
- easy handoff from scaffold to production features

Alternative:

- SQLModel or raw SQL

Why not now:

- SQLAlchemy + Alembic gives fewer framework-specific surprises and better migration control

### Relative `/api` access from frontend

Why:

- same browser path in dev and production
- easy proxy story

Alternative:

- expose different frontend env URLs per environment

Why not now:

- adds branching and makes the first runnable version harder to reason about
