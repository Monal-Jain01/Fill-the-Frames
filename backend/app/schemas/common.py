from pydantic import BaseModel
from typing import Any
from datetime import datetime

class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Any

class FrameData(BaseModel):
    frame_id: str
    timestamp: datetime
    variable: str
    width: int
    height: int
    min_value: float
    max_value: float
    source: str
