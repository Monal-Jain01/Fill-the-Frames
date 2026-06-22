from fastapi import APIRouter
from app.schemas.common import ApiResponse
from app.schemas.export import ExportRequest, ExportJobStatusResponse
from app.schemas.interpolation import JobResponse

router = APIRouter()

@router.post("/job", response_model=ApiResponse)
async def create_export_job(request: ExportRequest):
    # Placeholder
    return ApiResponse(
        success=True,
        message="Export job queued",
        data=JobResponse(job_id="dummy-export-job", status="preparing")
    )

@router.get("/status/{job_id}", response_model=ApiResponse)
async def get_export_status(job_id: str):
    # Placeholder
    return ApiResponse(
        success=True,
        message="Export status retrieved",
        data=ExportJobStatusResponse(status="processing", progress=10.0)
    )
