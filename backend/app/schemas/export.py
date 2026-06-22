from pydantic import BaseModel
from typing import Optional

class ExportRequest(BaseModel):
    target_id: str
    format: str
    resolution: str
    include_metadata: bool
    include_metrics: bool
    include_animation: bool = False

class ExportJobStatusResponse(BaseModel):
    status: str
    progress: float
    download_url: Optional[str] = None
