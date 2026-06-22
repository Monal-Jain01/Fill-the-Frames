from fastapi import APIRouter
from app.schemas.common import ApiResponse

router = APIRouter()

@router.get("/")
async def health_check():
    return ApiResponse(success=True, message="API is healthy", data=None)

@router.get("/gpu")
async def health_gpu():
    return ApiResponse(success=True, message="GPU status", data={"cuda_available": False})

@router.get("/models")
async def health_models():
    return ApiResponse(success=True, message="Models status", data={"rife": "not_loaded"})
