from fastapi import APIRouter

from app.api.v1.endpoints.health import router as health_router
from app.modules.registry import register_v1_modules

router = APIRouter()
router.include_router(health_router)
register_v1_modules(router)

