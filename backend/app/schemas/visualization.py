from typing import List, Optional

from pydantic import BaseModel, Field


class FrameDataResponse(BaseModel):
    file_id: str = Field(..., description="ID of the associated file")
    variable: str = Field(..., description="Variable name")
    time_index: int = Field(..., description="Time index")
    timestamp: Optional[str] = Field(None, description="ISO timestamp")
    shape: List[int] = Field(..., description="Dimensions of the data [height, width]")
    min: float = Field(..., description="Minimum value")
    max: float = Field(..., description="Maximum value")
    mean: float = Field(..., description="Mean value")
    std: float = Field(..., description="Standard deviation")
    z: List[List[float]] = Field(..., description="2D matrix of pixel values")

class VariableMetadata(BaseModel):
    name: str = Field(..., description="Name of the scientific variable")
    shape: List[int] = Field(..., description="Dimensions of the variable")
    datatype: str = Field(..., description="Data type of the variable")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "C13",
                "shape": [512, 512],
                "datatype": "float32"
            }
        }

class VariablesResponse(BaseModel):
    variables: List[VariableMetadata] = Field(..., description="List of available variables")

    class Config:
        json_schema_extra = {
            "example": {
                "variables": [
                    {
                        "name": "C13",
                        "shape": [512, 512],
                        "datatype": "float32"
                    }
                ]
            }
        }

class MapBoundsResponse(BaseModel):
    bounds: List[List[float]] = Field(..., description="Geographical bounds for Leaflet map overlay [[South, West], [North, East]]")

    class Config:
        json_schema_extra = {
            "example": {
                "bounds": [[8.0, 68.0], [37.0, 97.0]]
            }
        }
