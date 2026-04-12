import inspect
import logging
from importlib import import_module
from types import ModuleType

from fastapi import FastAPI

logger = logging.getLogger(__name__)


async def setup_data_integrations(app: FastAPI) -> None:
    app.state.db_base = _safe_import("app.db.base")
    app.state.db_session = _safe_import("app.db.session")
    app.state.redis_module = _safe_import("app.db.redis")

    await _run_optional(app.state.db_session, "startup", app)
    await _run_optional(app.state.redis_module, "startup", app)
    app.state.get_db = _resolve_callable(app.state.db_session, "get_db")
    app.state.get_redis_client = _resolve_callable(
        app.state.redis_module, "get_redis_client"
    )


async def shutdown_data_integrations(app: FastAPI) -> None:
    await _run_optional(getattr(app.state, "redis_module", None), "shutdown", app)
    await _run_optional(getattr(app.state, "db_session", None), "shutdown", app)
    _call_optional(getattr(app.state, "redis_module", None), "close_redis")


def _safe_import(module_path: str) -> ModuleType | None:
    try:
        return import_module(module_path)
    except ModuleNotFoundError:
        logger.info("Optional integration module not found: %s", module_path)
    except Exception:
        logger.exception("Failed to import integration module: %s", module_path)
    return None


async def _run_optional(module: ModuleType | None, fn_name: str, app: FastAPI) -> None:
    if module is None:
        return

    fn = getattr(module, fn_name, None)
    if not callable(fn):
        return

    try:
        result = fn(app)
        if inspect.isawaitable(result):
            await result
    except Exception:
        logger.exception("Integration hook failed: %s.%s", module.__name__, fn_name)


def _call_optional(module: ModuleType | None, fn_name: str) -> None:
    if module is None:
        return

    fn = getattr(module, fn_name, None)
    if not callable(fn):
        return

    try:
        fn()
    except Exception:
        logger.exception("Integration call failed: %s.%s", module.__name__, fn_name)


def _resolve_callable(module: ModuleType | None, fn_name: str):
    if module is None:
        return None
    fn = getattr(module, fn_name, None)
    return fn if callable(fn) else None
