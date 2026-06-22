from pydantic import BaseModel
from typing import List, Dict
from .visualization import FrameDataResponse

class MetricsRequest(BaseModel):
    frame_a_id: str
    frame_b_id: str
    metrics: List[str]

class MetricsResponse(BaseModel):
    scores: Dict[str, float]
    difference_map: FrameDataResponse
