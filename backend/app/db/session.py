import os
from collections.abc import Generator
from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

DEFAULT_DATABASE_URL = "postgresql+psycopg://postgres:postgres@db:5432/selfsite"


def get_database_url() -> str:
    try:
        from app.core.config import get_settings

        return get_settings().database_url
    except Exception:
        return os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)


engine = create_engine(get_database_url(), pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def startup(app: Any) -> None:
    state = getattr(app, "state", None)
    if state is None:
        return
    setattr(state, "db_engine", engine)
    setattr(state, "db_sessionmaker", SessionLocal)


def shutdown(app: Any) -> None:
    engine.dispose()
