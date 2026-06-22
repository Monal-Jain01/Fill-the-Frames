from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DimensionInfo(BaseModel):
    name: str
    size: int

class VariableInfo(BaseModel):
    name: str
    datatype: str
    dimensions: List[str]
    shape: List[int]
    attributes: Dict[str, Any]
    min_value: Optional[float] = None
    max_value: Optional[float] = None

class CoordinateInfo(BaseModel):
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    projection: Optional[str] = None

class TemporalInfo(BaseModel):
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    time_steps: Optional[int] = None

class DatasetSummary(BaseModel):
    file_format: str
    variable_count: int
    dimension_count: int
    coordinate_count: int
    dataset_size: int

class MetadataResponse(BaseModel):
    file_id: str
    filename: str
    size: int
    format: str
    global_attributes: Dict[str, Any]
    dimensions: List[DimensionInfo]
    variables: List[VariableInfo]
    coordinates: CoordinateInfo
    temporal_info: TemporalInfo
    summary: DatasetSummary
