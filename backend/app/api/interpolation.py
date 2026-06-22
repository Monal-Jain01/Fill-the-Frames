from fastapi import APIRouter
from app.schemas.common import ApiResponse
from app.schemas.interpolation import InterpolationRequest, JobResponse, JobStatusResponse

router = APIRouter()

@router.post("/generate", response_model=ApiResponse)
async def generate_interpolation(request: InterpolationRequest):
    # Placeholder
    return ApiResponse(
        success=True, 
        message="Job queued", 
        data=JobResponse(job_id="dummy-job", status="queued")
    )

@router.get("/status/{job_id}", response_model=ApiResponse)
async def get_status(job_id: str):
    # Placeholder
    return ApiResponse(
        success=True,
        message="Status retrieved",
        data=JobStatusResponse(status="processing", progress=50.0)
    )

@router.get("/events/{job_id}")
async def get_events(job_id: str):
    # Placeholder for SSE
    return {"message": "SSE endpoint placeholder"}
