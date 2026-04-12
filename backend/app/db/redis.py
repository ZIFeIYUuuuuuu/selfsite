import os
from typing import Any, Optional

import redis

DEFAULT_REDIS_URL = "redis://redis:6379/0"

_redis_client: Optional[redis.Redis] = None


def get_redis_url() -> str:
    try:
        from app.core.config import get_settings

        return get_settings().redis_url
    except Exception:
        return os.getenv("REDIS_URL", DEFAULT_REDIS_URL)


def get_redis_client() -> redis.Redis:
    global _redis_client

    if _redis_client is None:
        _redis_client = redis.Redis.from_url(get_redis_url(), decode_responses=True)

    return _redis_client


def close_redis() -> None:
    global _redis_client

    if _redis_client is not None:
        _redis_client.close()
        _redis_client = None


def startup(app: Any) -> None:
    state = getattr(app, "state", None)
    if state is None:
        return
    setattr(state, "redis", get_redis_client())


def shutdown(app: Any) -> None:
    close_redis()
