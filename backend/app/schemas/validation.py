from pydantic import BaseModel, Field
from typing import List, Optional, Any
from app.schemas.visualization import FrameDataResponse

class ValidationAlignmentRequest(BaseModel):
    generated_file_id: str = Field(..., description="ID of the generated T0.5 artifact")
    ground_truth_file_id: str = Field(..., description="ID of the ground truth T0.5 observation")
    variable: str = Field(default="C13", description="Name of the variable to validate")
    
class DifferenceMapDataSchema(BaseModel):
    id: str = Field(..., description="Unique ID for this difference map")
    type: str = Field(default="T0.5", description="Type of the frame")
    timestamp: str = Field(..., description="ISO timestamp")
    band: str = Field(..., description="Variable or band name")
    resolution: str = Field(default="1km", description="Spatial resolution")
    dimensions: List[int] = Field(..., description="Shape of the 2D frame (height, width)")
    data: List[List[float]] = Field(..., description="2D matrix of difference values (generated - ground_truth)")
    min: float = Field(..., description="Minimum difference value")
    max: float = Field(..., description="Maximum difference value")
    meanDifference: float = Field(default=0, description="Mean difference metric (calculated in Phase 11.9)")
    maxDifference: float = Field(default=0, description="Max absolute difference metric (calculated in Phase 11.9)")
    minDifference: float = Field(default=0, description="Min absolute difference metric (calculated in Phase 11.9)")
    stdDeviation: float = Field(default=0, description="Standard deviation metric (calculated in Phase 11.9)")
    similarityScore: float = Field(default=0, description="Overall similarity score (calculated in Phase 11.9)")

class ValidationAlignmentResponse(BaseModel):
    generated_file_id: str = Field(..., description="ID of the generated T0.5 artifact")
    ground_truth_file_id: str = Field(..., description="ID of the ground truth T0.5 observation")
    aligned_generated: FrameDataResponse = Field(..., description="Aligned generated frame data")
    aligned_ground_truth: FrameDataResponse = Field(..., description="Aligned ground truth frame data")
    difference_map: DifferenceMapDataSchema = Field(..., description="Spatial difference matrix")
    dimensions: List[int] = Field(..., description="Aligned dimensions")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Alignment metadata")
