import asyncio
import os
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any

from loguru import logger
from huggingface_hub import HfFileSystem

from app.core.config import (
    CHECK_INTERVAL,
    WINDOW_SIZE,
    ANIMATION_CHANNEL,
    HF_TOKEN,
    HF_BUCKET_ID,
    TEMP_STORAGE_DIR,
)
from app.services.scheduler.mosdac_service import MosdacService
from app.services.scheduler.state_manager import StateManager
from app.services.scientific.metadata_service import MetadataService
from app.services.inference.rife import SatelliteInterpolationModel


class AnimationScheduler:
    def __init__(self):
        self.mosdac = MosdacService()
        self.state = StateManager()
        self.fs = HfFileSystem(token=HF_TOKEN)
        self.is_running = False

    async def start(self):
        """Start the infinite background loop."""
        if self.is_running:
            return
        self.is_running = True
        logger.info("Starting Animation Scheduler background loop...")

        while self.is_running:
            try:
                await self.run_cycle()
            except Exception as e:
                logger.error(f"Error in scheduler cycle: {e}")

            # Wait for next interval
            logger.info(f"Scheduler sleeping for {CHECK_INTERVAL} seconds...")
            await asyncio.sleep(CHECK_INTERVAL)

    async def stop(self):
        """Stop the background loop."""
        self.is_running = False
        await self.mosdac.close()
        logger.info("Animation Scheduler stopped.")

    async def run_cycle(self):
        """A single execution cycle: Fetch -> Download -> Interpolate -> Clean."""
        logger.info("--- Starting Scheduler Cycle ---")

        # 1. Login to MOSDAC
        if not await self.mosdac.login():
            logger.error("Skipping cycle due to login failure.")
            return

        # 2. Search for recent files (last 24h)
        entries = await self.mosdac.search_recent(hours_back=24, count=48)

        # 3. Filter for Target Channel (e.g., TIR1)
        target_entries = [
            e for e in entries if self.mosdac.is_tir1_file(e["identifier"])
        ]
        logger.info(
            f"Found {len(target_entries)} matching files for {ANIMATION_CHANNEL}"
        )

        # Reverse to process oldest first
        target_entries.reverse()

        new_raw_added = False

        # 4. Download and register new frames
        for entry in target_entries:
            filename = entry["identifier"]
            record_id = entry["id"]

            # Skip if already in state
            if filename in self.state.get_raw_filenames():
                continue

            timestamp = self.mosdac.extract_timestamp_from_filename(filename)
            if not timestamp:
                logger.warning(f"Could not parse timestamp from {filename}, skipping.")
                continue

            logger.info(f"Downloading new frame: {filename}")
            bucket_path = await self.mosdac.download_file(record_id, filename)

            if bucket_path:
                self.state.add_raw_frame(filename, bucket_path, timestamp)
                self.state.save()
                new_raw_added = True

        # 5. Process Interpolations for Adjacent Raw Frames
        await self._process_interpolations()

        # 6. Trim state to WINDOW_SIZE
        self.state.trim_to_window(WINDOW_SIZE)
        self.state.set_last_check(datetime.utcnow().isoformat() + "Z")
        self.state.save()

        logger.info("--- Scheduler Cycle Complete ---")

    async def _process_interpolations(self):
        """Find adjacent raw frames and generate AI frames between them."""
        raw_frames = self.state.get_frames("raw")

        if len(raw_frames) < 2:
            return

        # They are sorted by timestamp in state_manager
        for i in range(len(raw_frames) - 1):
            frame_a = raw_frames[i]
            frame_b = raw_frames[i + 1]

            if self.state.has_ai_between(frame_a["filename"], frame_b["filename"]):
                continue

            logger.info(
                f"Generating AI frame between {frame_a['filename']} and {frame_b['filename']}"
            )

            try:
                # Need to run CPU-bound interpolation in a threadpool to not block asyncio
                success = await asyncio.to_thread(
                    self._run_interpolation_job, frame_a, frame_b
                )
                if success:
                    self.state.save()
            except Exception as e:
                logger.error(
                    f"Interpolation failed between {frame_a['filename']} and {frame_b['filename']}: {e}"
                )

    def _run_interpolation_job(
        self, frame_a: Dict[str, Any], frame_b: Dict[str, Any]
    ) -> bool:
        """Run RIFE interpolation synchronously (to be called via to_thread)."""
        tmp_dir = Path(TEMP_STORAGE_DIR) / "scheduler"
        tmp_dir.mkdir(parents=True, exist_ok=True)

        path_a_remote = f"hf://buckets/{HF_BUCKET_ID}/{frame_a['bucket_path']}"
        path_b_remote = f"hf://buckets/{HF_BUCKET_ID}/{frame_b['bucket_path']}"

        local_a = tmp_dir / frame_a["filename"]
        local_b = tmp_dir / frame_b["filename"]

        # Download files from bucket to local temp storage
        if not local_a.exists():
            self.fs.get(path_a_remote, str(local_a))
        if not local_b.exists():
            self.fs.get(path_b_remote, str(local_b))

        parser_a = None
        parser_b = None

        try:
            parser_a = MetadataService.get_parser(str(local_a))
            parser_a.load_dataset(str(local_a))
            img_a = parser_a.extract_time_slice(ANIMATION_CHANNEL, 0)
            time_a = parser_a.scene.start_time

            parser_b = MetadataService.get_parser(str(local_b))
            parser_b.load_dataset(str(local_b))
            img_b = parser_b.extract_time_slice(ANIMATION_CHANNEL, 0)
            time_b = parser_b.scene.start_time

            if img_a.shape != img_b.shape:
                raise ValueError(f"Shape mismatch: {img_a.shape} vs {img_b.shape}")

            interpolated_time = time_a + (time_b - time_a) / 2

            # AI Inference
            ai_model = SatelliteInterpolationModel(force_cpu=True)

            interpolated_img = ai_model.predict_full_disk(img_a, img_b)

            # Save Output
            ai_filename = f"AI_{frame_a['filename']}_to_{frame_b['filename']}.nc"
            local_out = tmp_dir / ai_filename

            ai_model.save_to_nc(
                interpolated_img,
                parser_a.scene,
                str(local_out),
                ANIMATION_CHANNEL,
                interpolated_time=interpolated_time,
            )

            # Upload to Bucket
            bucket_path = f"interpolations/scheduler/{ai_filename}"
            remote_out = f"hf://buckets/{HF_BUCKET_ID}/{bucket_path}"
            self.fs.put(str(local_out), remote_out)

            # Register in state
            ts_iso = interpolated_time.strftime("%Y-%m-%dT%H:%M:%SZ")
            self.state.add_ai_frame(
                ai_filename,
                bucket_path,
                ts_iso,
                [frame_a["filename"], frame_b["filename"]],
            )

            # Cleanup local
            if local_out.exists():
                local_out.unlink()
            if local_a.exists():
                local_a.unlink()
            if local_b.exists():
                local_b.unlink()

            return True

        finally:
            if parser_a:
                parser_a.close()
            if parser_b:
                parser_b.close()
