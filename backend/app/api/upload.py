import asyncio
from pathlib import Path
from typing import List

from fastapi import APIRouter, File, HTTPException, UploadFile
from huggingface_hub import HfFileSystem

# 🚨 UPLOAD_DIR removed, using HF configs
from app.core.config import HF_BUCKET_ID, HF_TOKEN
from app.schemas.common import ApiResponse
from app.services.upload_service import UploadService

router = APIRouter()

# Initialize Hugging Face File System
fs = HfFileSystem(token=HF_TOKEN)


@router.post("", response_model=ApiResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a single satellite dataset (.nc, .h5, .hdf5) to the server.
    """
    try:
        upload_data = await UploadService.process_upload(file)

        return ApiResponse(
            success=True,
            message="Dataset uploaded successfully",
            data=upload_data.model_dump(by_alias=True),
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        return ApiResponse(success=False, message=f"Upload failed: {str(e)}", data=None)


@router.post("/batch", response_model=ApiResponse)
async def upload_multiple_files(files: List[UploadFile] = File(...)):
    """
    Upload multiple satellite datasets at once.
    """
    try:
        # Saari files ko parallel me process karenge
        tasks = [UploadService.process_upload(file) for file in files]
        results = await asyncio.gather(*tasks)

        return ApiResponse(
            success=True,
            message=f"{len(results)} files uploaded successfully",
            data=[res.model_dump(by_alias=True) for res in results],
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        return ApiResponse(
            success=False, message=f"Batch upload failed: {str(e)}", data=None
        )


@router.get("", response_model=ApiResponse)
async def list_uploaded_files():
    """
    Get a list of all uploaded dataset folders and their sizes directly from Hugging Face.
    """
    try:
        # Check remote bucket directory
        bucket_path = f"hf://buckets/{HF_BUCKET_ID}/"
        folders = fs.ls(bucket_path, detail=False)

        files_info = []

        for folder_path in folders:
            folder_name = Path(folder_path).name  # The UUID
            inner_files = fs.glob(f"{folder_path}/*")

            if inner_files:
                actual_file = inner_files[0]
                file_metadata = fs.info(actual_file)

                files_info.append(
                    {
                        "fileId": folder_name,
                        "filename": Path(actual_file).name,
                        "size_bytes": file_metadata.get("size", 0),
                    }
                )

        return ApiResponse(
            success=True,
            message="Files retrieved successfully",
            data=files_info,
        )
    except Exception as e:
        return ApiResponse(
            success=False, message=f"Failed to list files: {str(e)}", data=[]
        )


@router.delete("/{file_id}", response_model=ApiResponse)
async def delete_file(file_id: str):
    """
    Delete an uploaded dataset from Hugging Face Bucket to clear space.
    """
    remote_dir = f"hf://buckets/{HF_BUCKET_ID}/{file_id}"

    if not fs.exists(remote_dir):
        raise HTTPException(status_code=404, detail="File directory not found in cloud")

    try:
        # Poora UUID folder cloud se uda do
        fs.rm(remote_dir, recursive=True)
        return ApiResponse(
            success=True,
            message=f"File {file_id} deleted successfully from cloud",
            data=None,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not delete file: {str(e)}")
