from pydantic import BaseModel
from typing import List
from .common import FrameData

class FrameDataResponse(BaseModel):
    frame_metadata: FrameData
    z: List[List[float]]
