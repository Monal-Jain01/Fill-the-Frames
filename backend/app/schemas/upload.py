from pydantic import BaseModel, Field

class UploadResponse(BaseModel):
    success: bool = True
    fileId: str = Field(..., alias="fileId")
    filename: str
    status: str

    class Config:
        populate_by_name = True
