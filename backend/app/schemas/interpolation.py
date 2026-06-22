from pydantic import BaseModel
from typing import Optional
from .visualization import FrameDataResponse

class InterpolationRequest(BaseModel):
    file_id: str
    time_ratio: float
    model: str

class JobResponse(BaseModel):
    job_id: str
    status: str

class JobStatusResponse(BaseModel):
    status: str
    progress: float
    result_frame: Optional[FrameDataResponse] = None
