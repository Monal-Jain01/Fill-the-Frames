from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from loguru import logger

from app.services.scheduler.state_manager import StateManager
from app.services.scientific.visualization_service import VisualizationService

router = APIRouter()
state_manager = StateManager()


@router.get("/latest")
async def get_latest_animation_frames(variable: str = "TIR1") -> List[Dict[str, Any]]:
    """Get the latest sequence of frames (both raw and AI) for the animation player."""
    try:
        # 1. Fetch frames from state manager (which reads state.json from bucket)
        frames = state_manager.get_frames()

        if not frames:
            return []

        # 2. Build the output list
        result = []
        for frame in frames:
            # We don't filter by variable directly in state.json because Mosdac search is dataset-based,
            # but we assume the scheduler downloads TIR1 files (or full L1B STD which contain TIR1).
            # We pass the requested variable to the PNG generation URL.

            # Format the filename correctly for the PNG endpoint
            filename = frame["filename"]

            result.append(
                {
                    "frameId": filename,
                    "timestamp": frame["timestamp"],
                    "imageUrl": f"/api/v1/visualization/{filename}/layer?variable={variable}",
                    "type": frame["type"],
                    "variable": variable,
                }
            )

        # 3. Sort by timestamp strictly
        result.sort(key=lambda x: x["timestamp"])

        return result

    except Exception as e:
        logger.error(f"Failed to fetch animation frames: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to fetch animation sequence"
        )
