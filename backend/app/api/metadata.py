from fastapi import APIRouter, HTTPException
from app.schemas.common import ApiResponse
from app.services.scientific.metadata_service import MetadataService
import os

router = APIRouter()

# Note: Depending on where uploads are stored, we assume a storage path.
# Assuming standard backend/storage/uploads based on previous contexts.
STORAGE_DIR = os.path.join(os.getcwd(), "storage", "uploads")

@router.get("/{file_id}", response_model=ApiResponse)
async def get_metadata(file_id: str):
    # Search for the file in the storage directory
    file_path = None
    for ext in [".nc", ".h5", ".hdf5"]:
        possible_path = os.path.join(STORAGE_DIR, f"{file_id}{ext}")
        if os.path.exists(possible_path):
            file_path = possible_path
            break
            
    if not file_path:
        raise HTTPException(status_code=404, detail="File not found")
        
    try:
        metadata_response = MetadataService.extract_metadata(file_id, file_path)
        return ApiResponse(
            success=True,
            message="Metadata retrieved successfully",
            data=metadata_response
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract metadata: {str(e)}")

