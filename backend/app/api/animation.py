from fastapi import APIRouter
from app.schemas.common import ApiResponse
from app.schemas.animation import AnimationSequenceResponse

router = APIRouter()

@router.get("/{file_id}/sequence", response_model=ApiResponse)
async def get_sequence(file_id: str, start_time: str = "", end_time: str = "", fps: int = 10):
    # Placeholder
    return ApiResponse(
        success=True,
        message="Animation sequence retrieved",
        data=None
    )
