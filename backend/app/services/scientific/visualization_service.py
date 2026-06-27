import io
import logging
from pathlib import Path
from typing import Dict, List

import numpy as np
from fastapi import HTTPException
from huggingface_hub import HfFileSystem
from PIL import Image

# UPLOAD_DIR is replaced with HF configs and Temp Storage.
from app.core.config import HF_BUCKET_ID, HF_TOKEN, TEMP_STORAGE_DIR
from app.schemas.visualization import VariableMetadata, VariablesResponse
from app.services.scientific.metadata_service import MetadataService

logger = logging.getLogger(__name__)

# Initialize the Hugging Face File System globally for this service
fs = HfFileSystem(token=HF_TOKEN)

class VisualizationService:

    @staticmethod
    def _get_file_path(file_id: str) -> str:
        """
        Smart fetcher: Checks local serverless cache first, otherwise downloads from HF Bucket.
        Handles both direct files (uploaded) and folder-based UUIDs (AI generated).
        """
        local_cache_dir = Path(TEMP_STORAGE_DIR) / file_id
        local_cache_dir.mkdir(parents=True, exist_ok=True)

        remote_target = f"hf://buckets/{HF_BUCKET_ID}/{file_id}"
        remote_file_path = None

        try:
            # Case 1: Check if it's a directory (AI generated file style)
            remote_files = fs.glob(f"{remote_target}/*")
            
            if remote_files:
                # Get the first file inside the folder
                remote_file_path = remote_files[0]
                
            # Case 2: Check if it's a direct file (User uploaded style)
            elif fs.exists(remote_target):
                remote_file_path = remote_target
                
            # Case 3: Check if the user forgot to add the .nc extension in the API request
            elif fs.exists(f"{remote_target}.nc"):
                remote_file_path = f"{remote_target}.nc"

            if not remote_file_path:
                raise HTTPException(status_code=404, detail=f"File not found in Hugging Face Bucket: {file_id}")

            # Extract filename and setup local download path
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
            logger.exception(f"Failed to fetch file from bucket: {file_id}")
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
            logger.exception(f"Visualization variable request failed for {file_id}")
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
    def get_map_bounds(file_id: str, variable: str) -> Dict[str, List[float]]:
        """
        Extracts the geographical bounding box of the satellite data.
        Returns format for Leaflet: [[South, West], [North, East]]
        """
        file_path = VisualizationService._get_file_path(file_id)
        parser = None
        try:
            parser = MetadataService.get_parser(file_path)
            parser.load_dataset(file_path)
            VisualizationService.validate_variable(parser, variable)

            # SatPy scene area se bounds nikalna
            area = parser.scene[variable].attrs.get('area')
            if not area:
                # Default bounds for India/Subcontinent as fallback
                return {"bounds": [[8.0, 68.0], [37.0, 97.0]], "min_lat": 8.0, "min_lon": 68.0, "max_lat": 37.0, "max_lon": 97.0}
            
            lons, lats = area.get_lonlats()
            
            # FIX: Filter out deep space Infinity and NaN values
            valid_mask = ~np.isnan(lats) & ~np.isnan(lons) & ~np.isinf(lats) & ~np.isinf(lons)
            
            valid_lats = lats[valid_mask]
            valid_lons = lons[valid_mask]

            if len(valid_lats) > 0:
                south, north = float(np.min(valid_lats)), float(np.max(valid_lats))
                west, east = float(np.min(valid_lons)), float(np.max(valid_lons))
            else:
                # Fallback agar data me kuch gadbad ho
                south, north, west, east = 8.0, 37.0, 68.0, 97.0
            
            return {
                "bounds": [[south, west], [north, east]],
                "min_lat": south,
                "min_lon": west,
                "max_lat": north,
                "max_lon": east,
            }

        except Exception as e:
            logger.exception(f"Failed to extract bounds for {file_id}")
            # Fallback bounds if projection logic fails initially
            return {"bounds": [[8.0, 68.0], [37.0, 97.0]], "min_lat": 8.0, "min_lon": 68.0, "max_lat": 37.0, "max_lon": 97.0}
        finally:
            if parser is not None:
                parser.close()

    @staticmethod
    def get_map_layer_image(file_id: str, variable: str) -> io.BytesIO:
        """
        Converts the 2D scientific array into a transparent PNG for Map Overlay.
        """
        file_path = VisualizationService._get_file_path(file_id)
        parser = None
        try:
            parser = MetadataService.get_parser(file_path)
            parser.load_dataset(file_path)
            VisualizationService.validate_variable(parser, variable)
            
            # Extract 2D array matrix (Time index 0)
            frame = parser.extract_time_slice(variable, 0)

            # Downsample optimization for extremely fast web renders
            frame = frame[::2, ::2]

            # FIX: Brightness temperature > 50 and < 400. Eliminates space fill-values (-9999, 0, etc.)
            valid_mask = ~np.isnan(frame) & ~np.isinf(frame) & (frame > 50.0) & (frame < 400.0)
            frame_clean = np.where(valid_mask, frame, 90.0)

            # Normalize Brightness Temperature to 0-255 range
            MIN_BT = 90.0
            MAX_BT = 313.0
            frame_norm = np.clip((frame_clean - MIN_BT) / (MAX_BT - MIN_BT) * 255, 0, 255).astype(np.uint8)

            # Create RGBA image matrix (A stands for Alpha/Transparency)
            rgba_img = np.zeros((frame_norm.shape[0], frame_norm.shape[1], 4), dtype=np.uint8)
            
            # Grayscale mapping
            rgba_img[..., 0] = frame_norm  # Red
            rgba_img[..., 1] = frame_norm  # Green
            rgba_img[..., 2] = frame_norm  # Blue
            
            # Make NaNs and empty space completely transparent (0 opacity)
            rgba_img[..., 3] = np.where(valid_mask, 255, 0) 

            # Convert array to PIL Image
            img = Image.fromarray(rgba_img, mode="RGBA")

            # Save to in-memory byte buffer
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG', optimize=True)
            img_byte_arr.seek(0)

            return img_byte_arr
            
        except HTTPException:
            raise
        except Exception as e:
            logger.exception(f"Image layer generation failed for {file_id}")
            raise HTTPException(status_code=500, detail="Failed to generate map layer")
        finally:
            if parser is not None:
                parser.close()

    @staticmethod
    def get_error_map_layer(actual_file_id: str, ai_file_id: str, variable: str) -> io.BytesIO:
        """
        Generates a Heatmap PNG showing the absolute difference between Ground Truth and AI Prediction.
        """
        actual_path = VisualizationService._get_file_path(actual_file_id)
        ai_path = VisualizationService._get_file_path(ai_file_id)

        parser_actual = None
        parser_ai = None
        try:
            parser_actual = MetadataService.get_parser(actual_path)
            parser_actual.load_dataset(actual_path)
            VisualizationService.validate_variable(parser_actual, variable)
            frame_actual = parser_actual.extract_time_slice(variable, 0)[::2, ::2]

            parser_ai = MetadataService.get_parser(ai_path)
            parser_ai.load_dataset(ai_path)
            VisualizationService.validate_variable(parser_ai, variable)
            frame_ai = parser_ai.extract_time_slice(variable, 0)[::2, ::2]

            # 1. Validation masks
            valid_mask_actual = ~np.isnan(frame_actual) & ~np.isinf(frame_actual) & (frame_actual > 50.0) & (frame_actual < 400.0)
            valid_mask_ai = ~np.isnan(frame_ai) & ~np.isinf(frame_ai) & (frame_ai > 50.0) & (frame_ai < 400.0)
            valid_mask = valid_mask_actual & valid_mask_ai  # Data valid in both

            # 2. Calculate Absolute Error Map
            error_matrix = np.zeros_like(frame_actual)
            np.abs(frame_actual - frame_ai, out=error_matrix, where=valid_mask)

            # 3. Normalize Error (Assuming 20 Kelvin difference is our max acceptable threshold)
            MAX_ERROR = 20.0 
            error_norm = np.clip(error_matrix / MAX_ERROR, 0, 1)

            # 4. Create RGBA image mapping (Yellow -> Red gradient)
            rgba_img = np.zeros((error_matrix.shape[0], error_matrix.shape[1], 4), dtype=np.uint8)
            
            rgba_img[..., 0] = 255  # Red is constant
            rgba_img[..., 1] = (255 * (1 - error_norm)).astype(np.uint8)  # Green drops to 0 as error rises
            rgba_img[..., 2] = 0    # No Blue
            
            # 5. Dynamic Transparency: Perfect match (0 error) is completely transparent. High error is opaque.
            # Max opacity is set to 200 (so it doesn't completely block the map behind it)
            opacity = (200 * error_norm).astype(np.uint8)
            rgba_img[..., 3] = np.where(valid_mask, opacity, 0)

            # Save and stream
            img = Image.fromarray(rgba_img, mode="RGBA")
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG', optimize=True)
            img_byte_arr.seek(0)

            return img_byte_arr

        except Exception as e:
            logger.exception(f"Error map generation failed for {actual_file_id} vs {ai_file_id}")
            raise HTTPException(status_code=500, detail="Failed to generate error map layer")
        finally:
            if parser_actual is not None:
                parser_actual.close()
            if parser_ai is not None:
                parser_ai.close()
