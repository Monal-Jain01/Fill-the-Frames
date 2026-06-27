import os
import uuid
from pathlib import Path
from typing import Any, Dict

from loguru import logger
from huggingface_hub import HfFileSystem

# 🚨 UPLOAD_DIR removed. Imported HF Configs and Temp Storage.
from app.core.config import TEMP_STORAGE_DIR, HF_TOKEN, HF_BUCKET_ID
from app.schemas.interpolation import InterpolationRequest
from app.services.inference.rife import SatelliteInterpolationModel
from app.services.scientific.metadata_service import MetadataService
from app.services.scientific.visualization_service import VisualizationService

# Initialize Hugging Face File System
fs = HfFileSystem(token=HF_TOKEN)


class InterpolationService:
    @staticmethod
    def run_job(
        job_id: str, req: InterpolationRequest, job_store: Dict[str, Dict[str, Any]]
    ):
        """Ye function server ke background me chup-chap chalega"""
        try:
            logger.info(f"[Job {job_id}] Started interpolation process...")

            # 1. File paths resolve karo (Yeh automatically cloud se /tmp me layega agar nahi hai)
            path_1 = VisualizationService._get_file_path(req.file_id_1)
            path_2 = VisualizationService._get_file_path(req.file_id_2)
            channel = req.variable  # Default: "C13"

            job_store[job_id]["progress"] = 10.0

            # 2. SatPy se data (Matrices) nikalna
            logger.info(f"[Job {job_id}] Extracting matrices from satellite files...")

            parser1 = MetadataService.get_parser(path_1)
            parser1.load_dataset(path_1)
            img1 = parser1.extract_time_slice(channel, 0)
            time1 = parser1.scene.start_time

            parser2 = MetadataService.get_parser(path_2)
            parser2.load_dataset(path_2)
            img2 = parser2.extract_time_slice(channel, 0)
            time2 = parser2.scene.start_time

            # Timestamp Midpoint Calculation
            interpolated_time = time1 + (time2 - time1) / 2
            logger.info(f"[Job {job_id}] Interpolated Time: {interpolated_time}")

            job_store[job_id]["progress"] = 30.0

            # 3. Asli AI Inference Shuru (RIFE Engine)
            logger.info(f"[Job {job_id}] Pumping data into AI brain...")
            ai_model = SatelliteInterpolationModel()

            # Heavy task: Sliding window inference
            interpolated_img = ai_model.predict_full_disk(img1, img2)

            job_store[job_id]["progress"] = 80.0

            # 4. Result ko serverless cache me save karna
            logger.info(
                f"[Job {job_id}] AI finished. Saving interpolated image to cache..."
            )
            result_file_id = str(uuid.uuid4())

            # 🚨 TEMP_STORAGE_DIR use kiya hai serverless ke liye
            local_result_dir = Path(TEMP_STORAGE_DIR) / result_file_id
            local_result_dir.mkdir(parents=True, exist_ok=True)

            output_name = f"Interpolated_AI_{result_file_id}.nc"
            local_output_path = local_result_dir / output_name

            # Save locally to /tmp first
            ai_model.save_to_nc(
                interpolated_img,
                parser1.scene,
                str(local_output_path),
                channel,
                interpolated_time=interpolated_time,
            )

            # 🚨 4.5 NEW: Upload the generated file to Hugging Face Buckets!
            logger.info(
                f"[Job {job_id}] Pushing generated NetCDF to Hugging Face Cloud..."
            )
            remote_path = f"hf://buckets/{HF_BUCKET_ID}/interpolations/{result_file_id}/{output_name}"

            # Transfer the file
            fs.put(str(local_output_path), remote_path)

            # 5. Job Complete!
            job_store[job_id]["status"] = "completed"
            job_store[job_id]["progress"] = 100.0
            job_store[job_id]["result_file_id"] = result_file_id

            logger.success(
                f"[Job {job_id}] Interpolation successfully completed and uploaded to cloud!"
            )

            # Memory clean
            parser1.close()
            parser2.close()

            # Optional: Clean up local cache to save serverless disk space
            # if local_output_path.exists():
            #     os.remove(local_output_path)

        except Exception as e:
            logger.error(f"[Job {job_id}] Failed with error: {str(e)}")
            job_store[job_id]["status"] = "failed"
            job_store[job_id]["error"] = str(e)
