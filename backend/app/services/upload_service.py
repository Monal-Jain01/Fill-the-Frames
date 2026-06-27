import os
import shutil
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile
from huggingface_hub import HfFileSystem

# 🚨 UPLOAD_DIR is completely removed. Using HF configs and Temp Storage.
from app.core.config import HF_BUCKET_ID, HF_TOKEN, TEMP_STORAGE_DIR
from app.schemas.upload import UploadData

ALLOWED_EXTENSIONS = {".nc", ".h5", ".hdf5"}
ALLOWED_MIME_TYPES = {
    "application/x-netcdf",
    "application/netcdf",
    "application/x-hdf5",
    "application/x-hdf",
    "application/octet-stream",  # Octet-stream isliye kyuki frontend kabhi-kabhi binary bhejta hai
}

# 1 GB file size limit (Satellite files heavy hoti hain)
MAX_FILE_SIZE = 1024 * 1024 * 1024

# Initialize the Hugging Face File System globally for this service
fs = HfFileSystem(token=HF_TOKEN)


class UploadService:
    @staticmethod
    async def process_upload(file: UploadFile) -> UploadData:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Filename missing")

        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File extension {ext} not allowed. Supported: .nc, .h5, .hdf5",
            )

        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=400, detail=f"Invalid MIME type: {file.content_type}"
            )

        # File size validation (Cursor ko last me le jaakar size check kiya)
        file.file.seek(0, os.SEEK_END)
        file_size = file.file.tell()
        file.file.seek(0)

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400, detail="File size exceeds maximum allowed limit (1GB)"
            )

        # UUID Generate karo
        file_id = str(uuid.uuid4())
        clean_original_name = file.filename.replace(" ", "_")

        # 🚨 NAYA LOGIC: Serverless TEMP_STORAGE_DIR me folder banao
        local_dir = Path(TEMP_STORAGE_DIR) / file_id
        local_dir.mkdir(parents=True, exist_ok=True)

        # Temp file path
        local_file_path = local_dir / clean_original_name

        # 1. Heavy file ko safely chunks me serverless disk cache par copy kiya
        with open(local_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2. Hugging Face Bucket me Cloud Upload karo (Organized into /uploads folder)
        remote_path = (
            f"hf://buckets/{HF_BUCKET_ID}/uploads/{file_id}/{clean_original_name}"
        )

        try:
            # fs.put automatically handles transferring the local file to the remote bucket
            fs.put(str(local_file_path), remote_path)
        except Exception as e:
            # Agar cloud upload fail ho jaye, toh local cache clean kar do taaki space na bhare
            if local_file_path.exists():
                os.remove(local_file_path)
            raise HTTPException(
                status_code=500, detail=f"Cloud upload failed: {str(e)}"
            )

        # Seedha Pydantic Model return kiya
        return UploadData(
            fileId=file_id,
            filename=file.filename,
            status="uploaded",
            size_bytes=file_size,
        )
