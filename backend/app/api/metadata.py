import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.schemas.common import ApiResponse
from app.services.scientific.metadata_service import MetadataService
from app.services.scientific.visualization_service import VisualizationService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/{file_id}", response_model=ApiResponse)
async def get_metadata(file_id: str):
    try:
        # Use our smart unified fetcher to resolve the file from the organized buckets
        local_file_path = VisualizationService._get_file_path(file_id)

        # Local cached file path pass karo MetadataService ko
        metadata_response = MetadataService.extract_metadata(
            file_id, str(local_file_path)
        )

        return ApiResponse(
            success=True,
            message="Metadata retrieved successfully",
            data=metadata_response,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to extract metadata: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to extract metadata: {str(e)}"
        )
