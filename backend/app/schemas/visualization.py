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

    class Config:
        json_schema_extra = {
            "example": {
                "bounds": [[8.0, 68.0], [37.0, 97.0]]
            }
        }
