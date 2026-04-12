# Architecture: First Runnable Version

## Scope

This document defines the first runnable architecture for a personal-site monorepo using:

- Next.js (frontend)
- FastAPI (backend)
- PostgreSQL
- Redis
- Caddy
- Docker Compose

Goals for this phase:

1. Run locally with one command path
2. Keep boundaries clear for parallel lanes
3. Leave clean extension points without adding early complexity

---

## Repository Structure

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
|   |-- package.json
|   |-- next.config.ts
|   |-- tsconfig.json
|   |-- app/
|   |   |-- layout.tsx
|   |   `-- page.tsx
|   |-- components/
|   |   `-- ...
|   |-- lib/
|   |   `-- api.ts
|   `-- public/
`-- backend/
    |-- Dockerfile
    |-- requirements.txt
    |-- alembic.ini
    |-- alembic/
    |   |-- env.py
    |   `-- versions/
    `-- app/
        |-- main.py
        |-- api/
        |   |-- router.py
        |   |-- endpoints/
        |   |   `-- health.py
        |   `-- v1/
        |       |-- router.py
        |       `-- endpoints/
        |           `-- health.py
        |-- core/
        |   |-- config.py
        |   |-- application.py
        |   `-- integrations.py
        |-- db/
        |   |-- base.py
        |   |-- session.py
        |   `-- redis.py
        `-- modules/
            `-- registry.py
```

---

## Directory Responsibilities

- `docs/`: architecture, contracts, QA outputs. No runtime logic.
- `frontend/app/`: App Router entry, layout, pages.
- `frontend/components/`: reusable UI components only.
- `frontend/lib/`: API client and frontend-side helpers.
- `backend/app/main.py`: FastAPI bootstrap and app wiring.
- `backend/app/api/`: versioned HTTP routing and endpoint composition.
- `backend/app/core/`: configuration, startup policies, cross-cutting concerns.
- `backend/app/db/`: database engine/session bootstrap and Redis client bootstrap.
- `backend/app/modules/`: feature modules (future domain slices) with stable extension point.
- `backend/alembic/`: schema migration environment and version scripts.
- top-level infra files: container orchestration, proxy routing, developer runbook.

---

## Frontend and Backend Boundary

Frontend responsibilities:

- Render UI and call API using relative browser path
- Keep backend origin logic in one place (`frontend/lib/api.ts` + Next rewrites)
- No direct database/cache access

Backend responsibilities:

- Expose HTTP JSON API
- Own config loading, CORS, routing, data and cache initialization
- Hide data internals behind service/module boundaries

Boundary rule:

- Browser calls `GET /api/v1/health`
- Frontend runtime never hardcodes backend host in UI components
- Transport details are handled by proxy or rewrite, not by page code

---

## Configuration Management

Single source for environment contract: `.env.example`.

Runtime behavior:

- Docker Compose loads `.env` and passes required variables to services.
- Backend reads env through `core/config.py`.
- Frontend reads compile/runtime env in Next (`NEXT_PUBLIC_*` and `BACKEND_ORIGIN` for local rewrite).

Rules:

- No secrets committed to git.
- Keep variable names identical across local and container workflows.
- Add every new variable to `.env.example` first.

---

## Backend Module Organization

Minimal layered layout for first runnable version:

- `main.py`: app creation and router registration
- `api/v1/endpoints/*`: HTTP handlers
- `core/*`: settings and shared policies
- `db/*`: SQLAlchemy and Redis bootstrap
- `modules/*`: future domain modules, one folder per domain

Extension rule:

- New business features go in `app/modules/<feature>/`
- API handlers in `api/v1/endpoints/` call module services, not direct SQL in route handlers

This keeps first version small and avoids rewrite when features grow.

---

## Local Development and Deployment Modes

Mode A: local split dev

- Run backend directly on `localhost:8000`
- Run frontend directly on `localhost:3000`
- Next rewrite forwards `/api/*` to `BACKEND_ORIGIN`

Mode B: full Docker Compose (first runnable target)

- Caddy is the public entrypoint
- `/api/*` -> backend
- all other paths -> frontend
- PostgreSQL and Redis run as compose services with persistent volumes

Promotion path:

- Keep the same service boundaries and env keys from local to container
- Swap only deployment runtime details (host, TLS, scale), not app contracts

---

## Frontend to Backend Access Path

Contracted path:

- Browser request path: `/api/v1/health`

Routing by environment:

- Frontend-only local dev: Next rewrite `^/api/(.*)` -> `${BACKEND_ORIGIN}/api/$1`
- Compose/proxy mode: Caddy routes `/api/*` to backend service

Result:

- Same API path from frontend code in all environments
- No environment-specific branching inside page components

---

## Database Migration and Redis Integration Placement

Database:

- SQLAlchemy setup in `backend/app/db/session.py`
- shared model metadata in `backend/app/db/base.py`
- Alembic config in `backend/alembic.ini` and `backend/alembic/`
- Migration files in `backend/alembic/versions/`

Redis:

- Redis URL from `REDIS_URL`
- client bootstrap in `backend/app/db/redis.py`
- feature modules consume redis client through module/service layer

Placement principle:

- Infrastructure bootstrap in `db/`
- Business usage in `modules/`
- HTTP layer remains thin

---

## Interface Contracts by Lane

### Frontend lane contract

- Must call `GET /api/v1/health` using relative path
- Must provide central API helper in `frontend/lib/`
- Must support both Next dev rewrite and proxy mode without page-level URL switching
- Must not depend on backend internal hosts in components

### Backend lane contract

- Must expose:
  - `GET /health` -> `{"status":"ok","service":"backend"}`
  - `GET /api/v1/health` -> `{"status":"ok","service":"backend","version":"v1"}`
- Must keep API prefix configurable by `API_V1_PREFIX`
- Must apply base CORS from `CORS_ORIGINS`
- Must reserve module extension path under `app/modules/`

### Data lane contract

- Must provide SQLAlchemy engine/session bootstrap under `app/db/`
- Must provide Alembic bootstrap and initial migration workflow under `backend/alembic/`
- Must provide Redis client bootstrap under `app/db/redis.py`
- Must remain business-agnostic (no product-specific tables in initial scaffold)

### DevOps lane contract

- Must provide runnable `docker-compose.yml` for frontend, backend, db, redis, caddy
- Must route `/api/*` to backend and all else to frontend in `Caddyfile`
- Must include required env contract in `.env.example`
- Must document startup and verification commands in `README.md`

---

## Key Technical Decisions

### 1) Next.js App Router

Why chosen:

- Current default for new Next.js projects
- Good fit for small first runnable site

Alternative:

- Pages Router

Why not now:

- Adds legacy path without clear first-version benefit

### 2) FastAPI + SQLAlchemy + Alembic

Why chosen:

- Standard stack with clear migration lifecycle
- Matches extensibility needs with low lock-in risk

Alternative:

- SQLModel or raw SQL scripts

Why not now:

- SQLModel adds framework coupling tradeoffs
- Raw SQL slows safe schema evolution in multi-lane development

### 3) Relative `/api` calls from frontend

Why chosen:

- Same frontend code path in local and proxy environments
- Reduces config branching in UI code

Alternative:

- Environment-specific absolute API URLs

Why not now:

- Increases drift risk and per-environment behavior differences

### 4) Caddy as first proxy

Why chosen:

- Minimal config for reverse proxy needs
- Easy migration path to TLS and production hardening later

Alternative:

- Nginx

Why not now:

- More verbose config for first runnable scope

### 5) Docker Compose as primary orchestration

Why chosen:

- Lowest operational overhead for local full-stack bring-up
- Aligns all services under one environment contract

Alternative:

- Manual per-service startup scripts

Why not now:

- Harder reproducibility and weaker onboarding reliability

---

## Contract Gap Notes

- Health endpoint contract defines response shape but not error shape. For this phase, non-2xx errors may use FastAPI default error format. Standardized error envelope can be introduced in a later API hardening pass.
- Data migration ownership is clear, but migration execution point (startup hook vs manual command) is not mandated. For first runnable version, keep migrations manual via Alembic CLI to avoid hidden startup side effects.

---

## First Runnable Definition

The stack is considered first-runnable when:

1. `docker compose up --build` starts all services
2. `GET /health` and `GET /api/v1/health` return contracted JSON
3. Frontend home page can display backend health through `/api/v1/health`
4. PostgreSQL and Redis volumes persist data across restart
5. A new contributor can start the project from `README.md` without undocumented steps
