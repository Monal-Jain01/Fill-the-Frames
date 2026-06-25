from fastapi import APIRouter
from app.schemas.metrics import MetricsRequest, MetricsResponse
from app.services.scientific.metrics import MetricsService

router = APIRouter()

@router.post("/compare", response_model=MetricsResponse)
async def compare_images(request: MetricsRequest):
    """
    Compare two satellite datasets to calculate SSIM, PSNR, MSE and an aggregate quality score.
    Useful for validating AI interpolation accuracy against real data.
    """
    return MetricsService.calculate_accuracy(
        generated_file_id=request.generated_file_id,
        truth_file_id=request.ground_truth_file_id,
        variable=request.variable,
    )
