from fastapi import APIRouter
from app.schemas.common import ApiResponse
from app.schemas.metrics import MetricsRequest, MetricsResponse

router = APIRouter()

@router.post("/compare", response_model=ApiResponse)
async def compare_frames(request: MetricsRequest):
    # Placeholder
    return ApiResponse(
        success=True,
        message="Metrics computed",
        data=None
    )
