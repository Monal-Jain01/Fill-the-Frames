from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

# Hum apna smart fetcher reuse karenge
from app.services.scientific.visualization_service import VisualizationService

router = APIRouter()

@router.get("/download/{file_id}")
async def download_interpolated_file(file_id: str):
    """
    Directly streams the generated .nc file from Hugging Face Bucket to the user.
    """
    try:
        # Ye function automatically check karega ki file cache me hai ya cloud se lani hai
        file_path = VisualizationService._get_file_path(file_id)
        
        # FileResponse browser ko batata hai ki is file ko download karna hai, open nahi
        return FileResponse(
            path=file_path, 
            media_type="application/x-netcdf", # NetCDF files ka standard mime type
            filename=f"INSAT_AI_Interpolated_{file_id}.nc" # User ko jo naam dikhega
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")
