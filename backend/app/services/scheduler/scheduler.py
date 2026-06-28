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
from app.services.scientific.visualization_service import VisualizationService


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
        """A single execution cycle: Fetch -> Download -> Interpolate -> Prebake -> Delete."""
        logger.info("--- Starting Scheduler Cycle ---")

        # 1. Login to MOSDAC
        if not await self.mosdac.login():
            logger.error("Skipping cycle due to login failure.")
            return

        # 2. Search for recent files (last 24h, exactly 45 files)
        entries = await self.mosdac.search_recent(hours_back=24, count=45)

        # 3. Filter for Target Channel (e.g., TIR1)
        target_entries = [
            e for e in entries if self.mosdac.is_tir1_file(e["identifier"])
        ]
        logger.info(
            f"Found {len(target_entries)} matching files for {ANIMATION_CHANNEL}"
        )

        # Reverse to process oldest first
        target_entries.reverse()

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

            logger.info(f"Processing new frame: {filename}")
            
            # 1. Download file asynchronously in the main event loop
            local_b_str = await self.mosdac.download_file(record_id, filename)
            if not local_b_str:
                logger.error(f"Failed to download {filename} from MOSDAC")
                continue

            # 2. Run CPU-heavy interpolation and pre-baking in a separate thread
            try:
                await asyncio.to_thread(
                    self._process_single_frame_cpu, filename, timestamp, local_b_str
                )
                self.state.save()
            except Exception as e:
                logger.error(f"Pipeline failed for {filename}: {e}")

        # Trim state to WINDOW_SIZE and delete old PNGs
        self.state.trim_to_window(WINDOW_SIZE)
        self.state.set_last_check(datetime.utcnow().isoformat() + "Z")
        self.state.save()

        logger.info("--- Scheduler Cycle Complete ---")

    def _process_single_frame_cpu(self, filename: str, timestamp: str, local_b_str: str):
        """Runs synchronously in a thread. Handles interpolating, prebaking, and uploading."""
        tmp_dir = Path(TEMP_STORAGE_DIR) / "scheduler"
        tmp_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            local_b = Path(local_b_str)
            state_dict = self.state.get_state()
            latest_raw_path = state_dict.get("latest_raw_h5_path")
            latest_raw_filename = state_dict.get("latest_raw_h5_filename")
            
            # Upload paths
            png_b_filename = filename.replace(".h5", ".png").replace(".hdf5", ".png")
            png_b_remote = f"hf://buckets/{HF_BUCKET_ID}/animation_pngs/{png_b_filename}"
            h5_b_remote = f"hf://buckets/{HF_BUCKET_ID}/mosdac/latest_raw.h5"

            if latest_raw_path and latest_raw_filename:
                # We have a previous frame! We need to fetch it and interpolate.
                local_a = tmp_dir / "latest_raw.h5"
                if not local_a.exists():
                    logger.info("Fetching previous raw frame from bucket for AI interpolation...")
                    self.fs.get(f"hf://buckets/{HF_BUCKET_ID}/{latest_raw_path}", str(local_a))
                
                # 1. Interpolate
                clean_stem_a = latest_raw_filename.replace('.h5', '')
                clean_stem_b = filename.replace('.h5', '')
                ai_filename = f"AI_{clean_stem_a}_to_{clean_stem_b}.nc"
                local_ai = tmp_dir / ai_filename
                
                logger.info(f"Running AI Interpolation between {latest_raw_filename} and {filename}...")
                interpolated_time = self._run_interpolation_logic(str(local_a), str(local_b), str(local_ai))
                
                if interpolated_time:
                    logger.info("Interpolation successful. Prebaking AI PNG...")
                    # 2. Prebake AI Frame
                    ai_png_bytes, ai_bounds = VisualizationService.prebake_png(str(local_ai), ANIMATION_CHANNEL)
                    ai_png_filename = ai_filename.replace(".nc", ".png")
                    ai_png_remote = f"hf://buckets/{HF_BUCKET_ID}/animation_pngs/{ai_png_filename}"
                    self.fs.write_bytes(ai_png_remote, ai_png_bytes)
                    
                    ts_iso = interpolated_time.strftime("%Y-%m-%dT%H:%M:%SZ")
                    self.state.add_ai_frame(
                        ai_filename,
                        ai_png_filename,
                        ts_iso,
                        ai_bounds,
                        [latest_raw_filename, filename],
                    )
                    
                    if local_ai.exists(): local_ai.unlink()
                
                # local_a will be overwritten by local_b shortly, no need to unlink yet

            logger.info("Prebaking new Raw Frame PNG...")
            # 3. Prebake New Raw Frame (Frame B)
            b_png_bytes, b_bounds = VisualizationService.prebake_png(str(local_b), ANIMATION_CHANNEL)
            self.fs.write_bytes(png_b_remote, b_png_bytes)
            
            logger.info("Uploading new Raw Frame to bucket for next cycle...")
            # 4. Upload Frame B as the new latest raw H5
            self.fs.put(str(local_b), h5_b_remote)
            
            # 5. Save local_b as local_a for the next iteration to prevent re-downloading 500MB!
            import shutil
            shutil.copy(str(local_b), str(tmp_dir / "latest_raw.h5"))
            
            # 6. Add Frame B to state
            self.state.add_raw_frame(filename, png_b_filename, timestamp, b_bounds)
            state_dict["latest_raw_h5_path"] = "mosdac/latest_raw.h5"
            state_dict["latest_raw_h5_filename"] = filename
            
            # 7. Cleanup
            if local_b.exists(): local_b.unlink()

        except Exception as e:
            logger.error(f"CPU Processing failed: {e}")
            raise

    def _run_interpolation_logic(self, local_a_str: str, local_b_str: str, local_out_str: str):
        """Extracts matrices and runs the AI model. Returns the interpolated timestamp."""
        parser_a = None
        parser_b = None

        try:
            parser_a = MetadataService.get_parser(local_a_str)
            parser_a.load_dataset(local_a_str)
            img_a = parser_a.extract_time_slice(ANIMATION_CHANNEL, 0)
            time_a = parser_a.scene.start_time

            parser_b = MetadataService.get_parser(local_b_str)
            parser_b.load_dataset(local_b_str)
            img_b = parser_b.extract_time_slice(ANIMATION_CHANNEL, 0)
            time_b = parser_b.scene.start_time

            if img_a.shape != img_b.shape:
                raise ValueError(f"Shape mismatch: {img_a.shape} vs {img_b.shape}")

            interpolated_time = time_a + (time_b - time_a) / 2

            # AI Inference
            ai_model = SatelliteInterpolationModel(force_cpu=True)
            interpolated_img = ai_model.predict_full_disk(img_a, img_b)

            ai_model.save_to_nc(
                interpolated_img,
                parser_a.scene,
                local_out_str,
                ANIMATION_CHANNEL,
                interpolated_time=interpolated_time,
            )
            
            return interpolated_time

        except Exception as e:
            logger.error(f"Interpolation AI failed: {e}")
            return None
        finally:
            if parser_a: parser_a.close()
            if parser_b: parser_b.close()
