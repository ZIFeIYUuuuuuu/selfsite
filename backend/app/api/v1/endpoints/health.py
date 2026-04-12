from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def v1_healthcheck() -> dict[str, str]:
    return {"status": "ok", "service": "backend", "version": "v1"}

