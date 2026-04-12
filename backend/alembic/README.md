# Alembic Starter

This migration setup is intentionally business-agnostic.
No domain tables are defined yet.

## Command strategy

Run commands from the `backend/` directory.

1. Create a new revision after adding models:

```bash
alembic revision --autogenerate -m "describe change"
```

2. Apply migrations:

```bash
alembic upgrade head
```

3. Roll back one migration:

```bash
alembic downgrade -1
```

## Connection assumptions

- Docker Compose runtime: `DATABASE_URL` should target `db` host.
- Host/local runtime: set `DATABASE_URL` to `localhost`-reachable Postgres.

Example local value:

```bash
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/selfsite
```
