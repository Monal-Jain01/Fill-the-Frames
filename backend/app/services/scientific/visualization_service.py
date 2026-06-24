import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

import matplotlib.pyplot as plt
import numpy as np
from fastapi import HTTPException
from huggingface_hub import HfFileSystem

# 🚨 UPLOAD_DIR is completely removed. Using HF configs and Temp Storage.
from app.core.config import HF_BUCKET_ID, HF_TOKEN, TEMP_STORAGE_DIR
from app.schemas.visualization import (FrameDataResponse, FrameStatistics,
                                       VariableMetadata, VariablesResponse)
from app.services.scientific.metadata_service import MetadataService

logger = logging.getLogger(__name__)

# Initialize the Hugging Face File System globally for this service
fs = HfFileSystem(token=HF_TOKEN)


class VisualizationService:

    @staticmethod
    def _get_file_path(file_id: str) -> str:
        """
        Smart fetcher: Checks local serverless cache first, otherwise downloads from HF Bucket.
        """
        local_cache_dir = Path(TEMP_STORAGE_DIR) / file_id
        local_cache_dir.mkdir(parents=True, exist_ok=True)

        remote_dir = f"hf://buckets/{HF_BUCKET_ID}/{file_id}"

        try:
            # Check Hugging Face Bucket for files in this UUID folder
            remote_files = fs.glob(f"{remote_dir}/*")
            if not remote_files:
                raise HTTPException(status_code=404, detail="File not found in Hugging Face Bucket")

            # Extract filename from remote path
            remote_file_path = remote_files[0]
            filename = Path(remote_file_path).name
            local_file_path = local_cache_dir / filename

            # Download from Bucket ONLY if it's not already in our temp cache
            if not local_file_path.exists():
                logger.info(f"Downloading {filename} from Hugging Face to local cache...")
                fs.get(remote_file_path, str(local_file_path))

            return str(local_file_path)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to fetch file from bucket: {str(e)}")
            raise HTTPException(status_code=500, detail="Cloud storage retrieval failed")

    @staticmethod
    def get_variables(file_id: str) -> VariablesResponse:
        file_path = VisualizationService._get_file_path(file_id)
        logger.info(f"Dataset opened for variable discovery: {file_id}")

        parser = None
        try:
            parser = MetadataService.get_parser(file_path)
            parser.load_dataset(file_path)

            metadata = parser.extract_metadata()
            variables = []

            for var in metadata["variables"]:
                variables.append(
                    VariableMetadata(
                        name=var.name, shape=var.shape, datatype=var.datatype
                    )
                )

            logger.info(f"Visualization variable request completed for {file_id}")
            return VariablesResponse(variables=variables)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Visualization variable request failed: {str(e)}")
            raise HTTPException(status_code=500, detail="Dataset Read Failure")
        finally:
            if parser is not None:
                parser.close()

    @staticmethod
    def validate_variable(parser, variable: str):
        var_names = parser.get_variable_names()
        if variable not in var_names:
            logger.error(f"Invalid variable requested: {variable}")
            raise HTTPException(status_code=400, detail="Invalid Variable")

    @staticmethod
    def validate_time_index(time_index: int):
        if time_index < 0:
            logger.error(f"Invalid time index requested: {time_index}")
            raise HTTPException(status_code=400, detail="Invalid Time Index")

    @staticmethod
    def compute_statistics(frame: np.ndarray) -> FrameStatistics:
        valid_data = frame[~np.isnan(frame)]
        if valid_data.size == 0:
            return FrameStatistics(min=0.0, max=0.0, mean=0.0, std=0.0)

        return FrameStatistics(
            min=float(np.min(valid_data)),
            max=float(np.max(valid_data)),
            mean=float(np.mean(valid_data)),
            std=float(np.std(valid_data)),
        )

    @staticmethod
    def get_frame(file_id: str, variable: str, time_index: int) -> FrameDataResponse:
        file_path = VisualizationService._get_file_path(file_id)
        logger.info(f"Dataset opened: {file_id}")

        parser = None
        try:
            parser = MetadataService.get_parser(file_path)
            parser.load_dataset(file_path)

            VisualizationService.validate_variable(parser, variable)
            VisualizationService.validate_time_index(time_index)

            try:
                frame = parser.extract_time_slice(variable, time_index)
                logger.info("Frame extracted successfully")
            except Exception as e:
                logger.error(f"Time slice extraction failed: {str(e)}")
                raise HTTPException(status_code=400, detail="Invalid Time Index")

            if len(frame.shape) != 2:
                raise HTTPException(
                    status_code=400, detail="Frame is not 2D after slicing"
                )

            timestamp = parser.extract_timestamp(time_index)
            stats = VisualizationService.compute_statistics(frame)

            frame_small = frame[::10, ::10]

            frame_clean = np.where(
                np.isnan(frame_small) | np.isinf(frame_small), -9999.0, frame_small
            ).tolist()

            response = FrameDataResponse(
                file_id=file_id,
                variable=variable,
                time_index=time_index,
                timestamp=timestamp,
                shape=list(frame_small.shape),
                min=stats.min,
                max=stats.max,
                mean=stats.mean,
                std=stats.std,
                z=frame_clean,
            )

            logger.info("Visualization request completed")
            return response

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Visualization request failed: {str(e)}")
            raise HTTPException(status_code=500, detail="Dataset Read Failure")
        finally:
            if parser is not None:
                parser.close()

    @staticmethod
    def get_thumbnail_path(file_id: str, variable: str) -> str:
        """
        File se data nikal kar JPEG image banata hai, aur serverless cache me path return karta hai.
        """
        # 🚨 Cache logic updated for Serverless TEMP_STORAGE_DIR
        target_dir = Path(TEMP_STORAGE_DIR) / file_id
        target_dir.mkdir(parents=True, exist_ok=True)

        thumb_path = target_dir / f"thumb_{variable}.jpg"

        # Agar thumbnail pehle se bani hui hai (Cache), toh seedha path do
        if thumb_path.exists():
            return str(thumb_path)

        # File path fetch karo (Yeh check karega ki file locally cached hai ya HF se lani hai)
        file_path = VisualizationService._get_file_path(file_id)

        parser = None
        try:
            parser = MetadataService.get_parser(file_path)
            parser.load_dataset(file_path)
            VisualizationService.validate_variable(parser, variable)

            # Data nikalo
            frame = parser.extract_time_slice(variable, 0)

            # Downsample for Speed (fast processing)
            frame_small = frame[::5, ::5]

            # Image banao aur serverless disk cache par save karo
            plt.figure(figsize=(8, 8))
            plt.imshow(frame_small, cmap="gray", vmin=90, vmax=313)
            plt.axis("off")

            plt.savefig(
                thumb_path, bbox_inches="tight", pad_inches=0, format="jpg", dpi=100
            )
            plt.close()

            return str(thumb_path)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Thumbnail generation failed: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to generate thumbnail")
        finally:
            if parser is not None:
                parser.close()
