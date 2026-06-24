from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse

from app.schemas.common import ApiResponse
from app.services.scientific.visualization_service import VisualizationService

router = APIRouter()

@router.get("/{file_id}/variables", response_model=ApiResponse)
async def get_variables(file_id: str):
    # ... (code same rahega) ...
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
    # ... (code same rahega) ...
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

# 🚨 FIX: Error map wale route ko upar move kar diya!
@router.get("/error-map/layer")
async def get_error_map_layer(
    actual_file_id: str = Query(..., description="The File ID of the Ground Truth dataset"),
    ai_file_id: str = Query(..., description="The File ID of the AI Generated dataset"),
    variable: str = Query("C13", description="The variable to extract")
):
    """
    Generates a heatmap PNG comparing Ground Truth and AI prediction.
    """
    try:
        img_buffer = VisualizationService.get_error_map_layer(actual_file_id, ai_file_id, variable)
        return StreamingResponse(
            img_buffer, 
            media_type="image/png",
            headers={
                "Cache-Control": "public, max-age=86400",
                "Content-Disposition": f"inline; filename=error_{actual_file_id}_{ai_file_id}.png"
            } 
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Yeh dynamic route ab neeche aayega
@router.get("/{file_id}/layer")
async def get_map_layer(
    file_id: str, 
    variable: str = Query("C13", description="The variable to extract")
):
    """
    Returns a fast, transparent PNG image overlay for Leaflet Map.
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
