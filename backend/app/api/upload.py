from fastapi import APIRouter, UploadFile, File
from app.schemas.upload import UploadResponse
from app.services.upload_service import UploadService

router = APIRouter()

@router.post("", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    result = await UploadService.process_upload(file)
    return result
