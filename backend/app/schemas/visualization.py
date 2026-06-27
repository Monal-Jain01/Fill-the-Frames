from typing import List

from pydantic import BaseModel, Field


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
    # Flat convenience fields so frontend can do res.data.min_lat directly
    min_lat: float = Field(..., description="Southern boundary (latitude)")
    min_lon: float = Field(..., description="Western boundary (longitude)")
    max_lat: float = Field(..., description="Northern boundary (latitude)")
    max_lon: float = Field(..., description="Eastern boundary (longitude)")

    class Config:
        json_schema_extra = {
            "example": {
                "bounds": [[8.0, 68.0], [37.0, 97.0]],
                "min_lat": 8.0,
                "min_lon": 68.0,
                "max_lat": 37.0,
                "max_lon": 97.0,
            }
        }

class FrameDataResponse(BaseModel):
    file_id: str
    variable: str
    time_index: int
    shape: List[int]
    min: float
    max: float
    mean: float
    std: float
    z: List[List[float]]
