"""
State Manager — Persists pipeline state to HF Bucket as state.json.

Since HF Spaces is serverless (local disk resets on sleep/restart),
all persistent metadata lives in the bucket at:
  hf://buckets/{HF_BUCKET_ID}/system/state.json
"""

import json
from datetime import datetime
from typing import Any, Dict, List, Optional

from huggingface_hub import HfFileSystem
from loguru import logger

from app.core.config import HF_BUCKET_ID, HF_TOKEN


class StateManager:
    def __init__(self):
        self.fs = HfFileSystem(token=HF_TOKEN)
        self.state_path = f"hf://buckets/{HF_BUCKET_ID}/system/state.json"
        self._cache: Optional[Dict[str, Any]] = None

    def _default_state(self) -> Dict[str, Any]:
        """Return a fresh empty state structure."""
        return {
            "version": 1,
            "last_updated": datetime.utcnow().isoformat() + "Z",
            "last_check": None,
            "frames": [],
            # frames[] = [
            #   {
            #     "filename": "3DIMG_..._TIR1.h5",
            #     "bucket_path": "mosdac/3DIMG_..._TIR1.h5",
            #     "timestamp": "2026-06-28T06:00:00Z",
            #     "type": "raw",              # "raw" | "ai"
            #     "status": "downloaded",      # "downloaded" | "interpolated" | "failed"
            #     "interpolated_from": null,   # only for type="ai": [filename_a, filename_b]
            #     "added_at": "2026-06-28T07:00:00Z"
            #   }
            # ]
        }

    def load(self) -> Dict[str, Any]:
        """Load state.json from HF bucket. Returns default state if not found."""
        try:
            if self.fs.exists(self.state_path):
                with self.fs.open(self.state_path, "r") as f:
                    self._cache = json.load(f)
                logger.info(
                    f"Loaded state.json: {len(self._cache.get('frames', []))} frames tracked."
                )
                return self._cache
            else:
                logger.info("No state.json found in bucket. Creating fresh state.")
                self._cache = self._default_state()
                self.save()
                return self._cache
        except Exception as e:
            logger.error(f"Failed to load state.json: {e}. Using default state.")
            self._cache = self._default_state()
            return self._cache

    def save(self) -> bool:
        """Write current state back to HF bucket."""
        if self._cache is None:
            self._cache = self._default_state()

        self._cache["last_updated"] = datetime.utcnow().isoformat() + "Z"

        try:
            with self.fs.open(self.state_path, "w") as f:
                json.dump(self._cache, f, indent=2)
            logger.debug("state.json saved to HF bucket.")
            return True
        except Exception as e:
            logger.error(f"Failed to save state.json: {e}")
            return False

    def get_state(self) -> Dict[str, Any]:
        """Get cached state (loads from bucket if not cached)."""
        if self._cache is None:
            return self.load()
        return self._cache

    def get_frames(self, frame_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all frames, optionally filtered by type ('raw' or 'ai')."""
        state = self.get_state()
        frames = state.get("frames", [])
        if frame_type:
            frames = [f for f in frames if f.get("type") == frame_type]
        return frames

    def get_raw_filenames(self) -> set:
        """Get set of all raw filenames already tracked."""
        return {f["filename"] for f in self.get_frames("raw")}

    def add_raw_frame(self, filename: str, bucket_path: str, timestamp: str) -> None:
        """Register a newly downloaded raw MOSDAC frame."""
        state = self.get_state()
        # Deduplicate
        existing = {f["filename"] for f in state["frames"]}
        if filename in existing:
            logger.debug(f"Frame {filename} already in state. Skipping.")
            return

        state["frames"].append(
            {
                "filename": filename,
                "bucket_path": bucket_path,
                "timestamp": timestamp,
                "type": "raw",
                "status": "downloaded",
                "interpolated_from": None,
                "added_at": datetime.utcnow().isoformat() + "Z",
            }
        )
        # Keep frames sorted by timestamp
        state["frames"].sort(key=lambda x: x.get("timestamp", ""))
        self._cache = state

    def add_ai_frame(
        self,
        filename: str,
        bucket_path: str,
        timestamp: str,
        interpolated_from: List[str],
    ) -> None:
        """Register an AI-interpolated frame."""
        state = self.get_state()
        existing = {f["filename"] for f in state["frames"]}
        if filename in existing:
            logger.debug(f"AI frame {filename} already in state. Skipping.")
            return

        state["frames"].append(
            {
                "filename": filename,
                "bucket_path": bucket_path,
                "timestamp": timestamp,
                "type": "ai",
                "status": "interpolated",
                "interpolated_from": interpolated_from,
                "added_at": datetime.utcnow().isoformat() + "Z",
            }
        )
        state["frames"].sort(key=lambda x: x.get("timestamp", ""))
        self._cache = state

    def mark_pair_interpolated(self, filename_a: str, filename_b: str) -> None:
        """Mark that the pair (a, b) has been interpolated (by updating status)."""
        # This is tracked implicitly by the existence of the AI frame
        # between them in the frames list. No extra field needed.
        pass

    def has_ai_between(self, filename_a: str, filename_b: str) -> bool:
        """Check if an AI frame already exists between two raw frames."""
        state = self.get_state()
        for frame in state["frames"]:
            if frame["type"] == "ai" and frame.get("interpolated_from") == [
                filename_a,
                filename_b,
            ]:
                return True
        return False

    def set_last_check(self, timestamp: str) -> None:
        """Update the last MOSDAC check timestamp."""
        state = self.get_state()
        state["last_check"] = timestamp
        self._cache = state

    def trim_to_window(self, window_size: int) -> int:
        """Remove oldest frames to keep total count within window_size.
        Returns the number of frames removed.
        """
        state = self.get_state()
        frames = state.get("frames", [])
        if len(frames) <= window_size:
            return 0

        excess = len(frames) - window_size
        removed = frames[:excess]
        state["frames"] = frames[excess:]
        self._cache = state

        logger.info(
            f"Trimmed {len(removed)} old frames to maintain window of {window_size}."
        )
        return len(removed)
