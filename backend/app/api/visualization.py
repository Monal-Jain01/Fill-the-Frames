from fastapi import APIRouter
from app.schemas.common import ApiResponse

router = APIRouter()

@router.get("/{file_id}/frame", response_model=ApiResponse)
async def get_frame(file_id: str, time_index: int = 0, variable: str = ""):
    # Placeholder
    return ApiResponse(
        success=True, 
        message="Frame retrieved", 
        data=None
    )

@router.get("/{file_id}/thumbnail", response_model=ApiResponse)
async def get_thumbnail(file_id: str):
    # Placeholder
    return ApiResponse(
        success=True,
        message="Thumbnail retrieved",
        data={"url": "dummy_url"}
    )
