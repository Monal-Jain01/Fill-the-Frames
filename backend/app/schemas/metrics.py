from pydantic import BaseModel, Field
from typing import Optional

class MetricsRequest(BaseModel):
    generated_file_id: str = Field(..., description="ID of the AI Generated Dataset")
    ground_truth_file_id: str = Field(..., description="ID of the Actual Ground Truth Dataset")
    variable: str = Field(default="C13", description="Variable to compare (e.g., C13)")

class MetricsResponse(BaseModel):
    ssim: float = Field(..., description="Structural Similarity Index")
    psnr: float = Field(..., description="Peak Signal-to-Noise Ratio")
    mse: float = Field(..., description="Mean Squared Error")
    fsim: Optional[float] = Field(default=None, description="Feature Similarity Index (Placeholder)")
    issm: Optional[float] = Field(default=None, description="Information-Theoretic Similarity Measure (Placeholder)")
    quality_score: float = Field(..., description="Aggregated backend quality score")
    summary: str = Field(..., description="Summary of the quality assessment")
