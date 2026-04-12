import logging
from importlib import import_module

from fastapi import APIRouter

logger = logging.getLogger(__name__)

# Future modules should export `router: APIRouter`.
V1_MODULE_ROUTERS: tuple[str, ...] = ()


def register_v1_modules(v1_router: APIRouter) -> None:
    for module_path in V1_MODULE_ROUTERS:
        try:
            module = import_module(module_path)
            router = getattr(module, "router", None)
            if isinstance(router, APIRouter):
                v1_router.include_router(router)
            else:
                logger.warning("Module has no APIRouter named 'router': %s", module_path)
        except Exception:
            logger.exception("Failed to register module router: %s", module_path)

