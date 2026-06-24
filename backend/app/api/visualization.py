from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse

from app.schemas.common import ApiResponse
from app.services.scientific.visualization_service import VisualizationService

router = APIRouter()

@router.get("/{file_id}/variables", response_model=ApiResponse)
async def get_variables(file_id: str):
    """
    Get a list of available variables/channels in the uploaded dataset.
    """
    try:
        variables_data = VisualizationService.get_variables(file_id)
        return ApiResponse(
            success=True,
            message="Variables successfully retrieved.",
            data=variables_data.model_dump(),
        )
    except Exception as e:
        return ApiResponse(
            success=False, message=f"Failed to retrieve variables: {str(e)}", data=None
        )


@router.get("/{file_id}/bounds", response_model=ApiResponse)
async def get_map_bounds(
    file_id: str, 
    variable: str = Query("C13", description="The variable to extract bounds for")
):
    """
    Get the geographical bounding box coordinates for Leaflet Map.
    """
    try:
        bounds_data = VisualizationService.get_map_bounds(file_id, variable)
        return ApiResponse(
            success=True,
            message="Map bounds extracted successfully.",
            data=bounds_data,
        )
    except Exception as e:
        return ApiResponse(
            success=False, message=f"Failed to extract bounds: {str(e)}", data=None
        )


@router.get("/{file_id}/layer")
async def get_map_layer(
    file_id: str, 
    variable: str = Query("C13", description="The variable to extract")
):
    """
    Returns a fast, transparent PNG image overlay for Leaflet Map.
    Frontend Leaflet will use this URL directly in L.imageOverlay().
    """
    try:
        img_buffer = VisualizationService.get_map_layer_image(file_id, variable)
        return StreamingResponse(
            img_buffer, 
            media_type="image/png",
            headers={
                "Cache-Control": "public, max-age=86400",
                "Content-Disposition": f"inline; filename={file_id}_{variable}.png"
            } 
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
