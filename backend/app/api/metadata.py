import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException
from huggingface_hub import HfFileSystem

# 🚨 UPLOAD_DIR removed, using Temp Storage and HF configs
from app.core.config import HF_BUCKET_ID, HF_TOKEN, TEMP_STORAGE_DIR
from app.schemas.common import ApiResponse
from app.services.scientific.metadata_service import MetadataService

router = APIRouter()
fs = HfFileSystem(token=HF_TOKEN)
logger = logging.getLogger(__name__)


@router.get("/{file_id}", response_model=ApiResponse)
async def get_metadata(file_id: str):
    # Local cache folder setup
    local_cache_dir = Path(TEMP_STORAGE_DIR) / file_id
    local_cache_dir.mkdir(parents=True, exist_ok=True)

    remote_dir = f"hf://buckets/{HF_BUCKET_ID}/{file_id}"

    try:
        # 1. Cloud se check karo ki folder aur file exist karte hain ya nahi
        remote_files = fs.glob(f"{remote_dir}/*")
        if not remote_files:
            raise HTTPException(
                status_code=404, detail="File not found in Hugging Face Bucket"
            )

        remote_file_path = remote_files[0]
        filename = Path(remote_file_path).name
        local_file_path = local_cache_dir / filename

        # 2. Agar cache me nahi hai toh pehle download karo
        if not local_file_path.exists():
            logger.info(f"Downloading {filename} for metadata extraction...")
            fs.get(remote_file_path, str(local_file_path))

        # 3. Local cached file path pass karo MetadataService ko
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
