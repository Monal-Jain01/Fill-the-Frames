import os
import uuid
import shutil
from pathlib import Path
from fastapi import UploadFile, HTTPException
from typing import Dict, Any

UPLOAD_DIR = Path("storage/uploads")

ALLOWED_EXTENSIONS = {".nc", ".h5", ".hdf5"}
ALLOWED_MIME_TYPES = {
    "application/x-netcdf",
    "application/netcdf",
    "application/x-hdf5",
    "application/x-hdf",
    "application/octet-stream",
}

MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB

class UploadService:
    @staticmethod
    async def process_upload(file: UploadFile) -> Dict[str, Any]:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Filename missing")
            
        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"File extension {ext} not allowed. Supported: .nc, .h5, .hdf5")
            
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(status_code=400, detail=f"Invalid MIME type: {file.content_type}")
            
        # File size validation
        file.file.seek(0, os.SEEK_END)
        file_size = file.file.tell()
        file.file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds maximum allowed limit (100MB)")

        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        
        file_id = str(uuid.uuid4())
        safe_filename = f"{file_id}{ext}"
        file_path = UPLOAD_DIR / safe_filename
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {
            "success": True,
            "fileId": file_id,
            "filename": file.filename,
            "status": "uploaded"
        }
