import json
import asyncio
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, Response
from loguru import logger
from huggingface_hub import HfFileSystem

from app.core.config import HF_BUCKET_ID, HF_TOKEN
from app.services.scheduler.state_manager import StateManager

router = APIRouter()
state_manager = StateManager()
fs = HfFileSystem(token=HF_TOKEN)


def _build_frames_response(variable: str) -> List[Dict[str, Any]]:
    """Helper to generate the current list of frames."""
    frames = state_manager.get_frames()
    if not frames:
        return []

    result = []
    for frame in frames:
        png_filename = frame.get("png_filename")
        if not png_filename:
            continue

        result.append(
            {
                "frameId": frame["filename"],
                "timestamp": frame["timestamp"],
                "imageUrl": f"/api/v1/animation/frame/{png_filename}",
                "type": frame["type"],
                "bounds": frame.get("bounds"),
                "variable": variable,
            }
        )

    # Sort by timestamp strictly
    result.sort(key=lambda x: x["timestamp"])
    return result


@router.get("/frame/{filename}")
async def get_animation_frame(filename: str):
    """Serve a pre-baked transparent PNG directly from the HF Bucket."""
    remote_path = f"hf://buckets/{HF_BUCKET_ID}/animation_pngs/{filename}"

    try:
        if not fs.exists(remote_path):
            raise HTTPException(status_code=404, detail="Frame not found in bucket")

        image_bytes = fs.read_bytes(remote_path)
        return Response(content=image_bytes, media_type="image/png")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to serve PNG {filename}: {e}")
        raise HTTPException(status_code=500, detail="Failed to serve frame")


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
