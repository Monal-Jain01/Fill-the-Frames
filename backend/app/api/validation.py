# DEPRECATED: Validation orchestration has been moved to the frontend via the stateless Visualization and Metrics services.
# This router is unmounted and preserved for potential future architectural requirements involving raw spatial data arrays.

from fastapi import APIRouter, HTTPException, Body
from loguru import logger
from app.schemas.common import ApiResponse
from app.schemas.validation import ValidationAlignmentRequest, ValidationAlignmentResponse
from app.services.scientific.validation_service import ValidationService

router = APIRouter()

@router.post("/align", response_model=ApiResponse[ValidationAlignmentResponse])
async def align_frames(request: ValidationAlignmentRequest = Body(...)):
    """
    Aligns a generated artifact with a ground truth observation.
    Returns the aligned frames and the difference map for the frontend to render.
    """
    try:
        alignment_data = ValidationService.align_frames(
            request.generated_file_id, 
            request.ground_truth_file_id, 
            request.variable
        )
        return ApiResponse(
            success=True,
            message="Validation frames aligned successfully.",
            data=alignment_data.model_dump(),
        )
    except Exception as e:
        logger.exception("Failed to align frames")
        raise HTTPException(status_code=500, detail=f"Failed to align frames: {str(e)}")
