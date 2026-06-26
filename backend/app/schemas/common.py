from pydantic import BaseModel
from datetime import datetime
from typing import Any, Generic, TypeVar, Optional

T = TypeVar("T")

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: Optional[T] = None

class FrameData(BaseModel):
    frame_id: str
    timestamp: datetime
    variable: str
    width: int
    height: int
    min_value: float
    max_value: float
    source: str
