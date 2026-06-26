from fastapi import APIRouter, Query, HTTPException
from loguru import logger

from app.schemas.common import ApiResponse
from app.services.scientific.metrics import MetricsService

router = APIRouter()


@router.get("/compare", response_model=ApiResponse[dict])
async def compare_images(
    generated_file_id: str = Query(..., description="ID of the AI Generated Dataset"),
    truth_file_id: str = Query(
        ..., description="ID of the Actual Ground Truth Dataset"
    ),
    variable: str = Query("C13", description="Variable to compare (e.g., C13)"),
):
    """
    Compare two satellite datasets to calculate PSNR and SSIM quality metrics.
    Useful for validating AI interpolation accuracy against real data.
    """
    try:
        metrics_data = MetricsService.calculate_accuracy(
            generated_file_id=generated_file_id,
            truth_file_id=truth_file_id,
            variable=variable,
        )
        return ApiResponse(
            success=True,
            message="Quality metrics calculated successfully.",
            data=metrics_data,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to calculate metrics")
        raise HTTPException(status_code=500, detail=f"Failed to calculate metrics: {str(e)}")
