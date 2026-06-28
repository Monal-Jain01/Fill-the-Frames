import json
import asyncio
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from loguru import logger

from app.services.scheduler.state_manager import StateManager

router = APIRouter()
state_manager = StateManager()


def _build_frames_response(variable: str) -> List[Dict[str, Any]]:
    """Helper to generate the current list of frames."""
    frames = state_manager.get_frames()
    if not frames:
        return []

    result = []
    for frame in frames:
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

    # Sort by timestamp strictly
    result.sort(key=lambda x: x["timestamp"])
    return result


@router.get("/latest")
async def get_latest_animation_frames(variable: str = "TIR1") -> List[Dict[str, Any]]:
    """Get the latest sequence of frames (both raw and AI) via standard GET request."""
    try:
        return _build_frames_response(variable)
    except Exception as e:
        logger.error(f"Failed to fetch animation frames: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to fetch animation sequence"
        )


@router.get("/stream")
async def stream_animation_frames(variable: str = "TIR1"):
    """
    Server-Sent Events (SSE) endpoint.
    Streams the animation frames to the client continuously.
    Pushes an update instantly whenever the backend state changes.
    """

    async def event_generator():
        last_updated = None
        while True:
            try:
                # Force a fresh read from the cache/bucket
                state = state_manager.get_state()
                current_updated = state.get("last_updated")

                # If the state has been updated (or it's the very first connection)
                if current_updated != last_updated:
                    frames_data = _build_frames_response(variable)
                    # SSE format: data: {json_string}\n\n
                    yield f"data: {json.dumps(frames_data)}\n\n"
                    last_updated = current_updated
            except Exception as e:
                logger.error(f"SSE stream error: {e}")

            # Check for changes every 15 seconds (very lightweight)
            await asyncio.sleep(15)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
