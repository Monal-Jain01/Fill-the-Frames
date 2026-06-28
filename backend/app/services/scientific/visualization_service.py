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

        # Check if file_id is a direct bucket path (e.g., from animation scheduler)
        if "/" in file_id:
            remote_path = f"hf://buckets/{HF_BUCKET_ID}/{file_id}"
            if fs.exists(remote_path):
                logger.info(f"Downloading direct bucket path: {remote_path}")
                local_dir = Path(TEMP_STORAGE_DIR) / "cache"
                local_dir.mkdir(parents=True, exist_ok=True)
                local_file = local_dir / Path(file_id).name
                if not local_file.exists():
                    fs.get(remote_path, str(local_file))
                return str(local_file)

        # Check organized paths first, then fallback to legacy root paths
        potential_remote_dirs = [
            f"hf://buckets/{HF_BUCKET_ID}/uploads/{file_id}",
            f"hf://buckets/{HF_BUCKET_ID}/interpolations/{file_id}",
            f"hf://buckets/{HF_BUCKET_ID}/interpolations/scheduler/{file_id}",
            f"hf://buckets/{HF_BUCKET_ID}/mosdac/{file_id}",
            f"hf://buckets/{HF_BUCKET_ID}/{file_id}",
        ]

        remote_file_path = None

        try:
            for remote_target in potential_remote_dirs:
                # Case 1: Check if it's a directory (AI generated file style or new upload style)
                remote_files = fs.glob(f"{remote_target}/*")

                if remote_files:
                    # Get the first file inside the folder
                    remote_file_path = remote_files[0]
                    break

                # Case 2: Check if it's a direct file (legacy user uploaded style)
                elif fs.exists(remote_target):
                    remote_file_path = remote_target
                    break

                # Case 3: Check if the user forgot to add the extension in the API request
                elif fs.exists(f"{remote_target}.nc"):
                    remote_file_path = f"{remote_target}.nc"
                    break
                elif fs.exists(f"{remote_target}.h5"):
                    remote_file_path = f"{remote_target}.h5"
                    break
                elif fs.exists(f"{remote_target}.hdf5"):
                    remote_file_path = f"{remote_target}.hdf5"
                    break

            if not remote_file_path:
                raise HTTPException(
                    status_code=404,
                    detail=f"File not found in Hugging Face Bucket: {file_id}",
                )

            # Extract filename and setup local download path
            filename = Path(remote_file_path).name
            local_file_path = local_cache_dir / filename

            # Download from Bucket ONLY if it's not already in our temp cache
            if not local_file_path.exists():
                logger.info(
                    f"Downloading {filename} from Hugging Face to local cache..."
                )
                fs.get(remote_file_path, str(local_file_path))

            return str(local_file_path)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to fetch file from bucket: {str(e)}")
            raise HTTPException(
                status_code=500, detail="Cloud storage retrieval failed"
            )

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

            # If it's an AI file (xarray based), it doesn't have parser.scene
            if (
                getattr(parser, "is_ai_file", False)
                or getattr(parser, "scene", None) is None
            ):
                # Try to read dynamic bounds injected by RIFE Engine
                try:
                    metadata = parser.extract_metadata()
                    attrs = metadata.get("global_attributes", {})
                    if "ai_min_lat" in attrs:
                        return {
                            "bounds": [
                                [
                                    float(attrs["ai_min_lat"]),
                                    float(attrs["ai_min_lon"]),
                                ],
                                [
                                    float(attrs["ai_max_lat"]),
                                    float(attrs["ai_max_lon"]),
                                ],
                            ]
                        }
                except Exception as ex:
                    logger.warning(f"Could not extract dynamic AI bounds: {ex}")

                return {"bounds": [[8.0, 68.0], [37.0, 97.0]]}

            # SatPy scene area se bounds nikalna
            area = parser.scene[variable].attrs.get("area")
            if not area:
                # Default bounds for India/Subcontinent as fallback
                return {"bounds": [[8.0, 68.0], [37.0, 97.0]]}

            # Optimization: Downsample lat/lon extraction to avoid massive memory usage on full-disk arrays
            lons, lats = area.get_lonlats()
            lons, lats = lons[::10, ::10], lats[::10, ::10]

            # FIX: Filter out deep space Infinity and NaN values
            valid_mask = (
                ~np.isnan(lats) & ~np.isnan(lons) & ~np.isinf(lats) & ~np.isinf(lons)
            )

            valid_lats = lats[valid_mask]
            valid_lons = lons[valid_mask]

            if len(valid_lats) > 0:
                south, north = float(np.min(valid_lats)), float(np.max(valid_lats))
                west, east = float(np.min(valid_lons)), float(np.max(valid_lons))
            else:
                # Fallback agar data me kuch gadbad ho
                south, north, west, east = 8.0, 37.0, 68.0, 97.0

            return {"bounds": [[south, west], [north, east]]}

        except Exception as e:
            logger.error(f"Failed to extract bounds: {str(e)}")
            # Fallback bounds if projection logic fails initially
            return {"bounds": [[8.0, 68.0], [37.0, 97.0]]}
        finally:
            if parser is not None:
                parser.close()

    @staticmethod
    def get_map_layer_image(file_id: str, variable: str) -> io.BytesIO:
        """
        Converts the 2D scientific array into a transparent PNG for Map Overlay.
        Optimized with caching, bilinear resampling, and dynamic normalization.
        """
        file_path = VisualizationService._get_file_path(file_id)

        # Optimization: Check if we already rendered this specific PNG before doing heavy math
        local_cache_dir = Path(TEMP_STORAGE_DIR) / file_id
        png_cache_path = local_cache_dir / f"{variable}_map.png"

        if png_cache_path.exists():
            logger.info(f"Serving {variable} map overlay from cache for {file_id}")
            with open(png_cache_path, "rb") as f:
                img_byte_arr = io.BytesIO(f.read())
                img_byte_arr.seek(0)
                return img_byte_arr

        parser = None
        try:
            parser = MetadataService.get_parser(file_path)
            parser.load_dataset(file_path)
            VisualizationService.validate_variable(parser, variable)

            # ROUTE 1: Geostationary to Geographic Reprojection for accurate Leaflet overlay
            if (
                getattr(parser, "is_ai_file", False) is False
                and getattr(parser, "scene", None) is not None
            ):
                try:
                    area = parser.scene[variable].attrs.get("area")
                    if area:
                        # Downsample lonlats strictly for bounding box computation to save memory
                        lons_sub, lats_sub = area.get_lonlats()
                        lons_sub, lats_sub = lons_sub[::20, ::20], lats_sub[::20, ::20]
                        valid_mask = (
                            ~np.isnan(lats_sub)
                            & ~np.isnan(lons_sub)
                            & ~np.isinf(lats_sub)
                            & ~np.isinf(lons_sub)
                        )
                        south, north = (
                            float(np.min(lats_sub[valid_mask])),
                            float(np.max(lats_sub[valid_mask])),
                        )
                        west, east = (
                            float(np.min(lons_sub[valid_mask])),
                            float(np.max(lons_sub[valid_mask])),
                        )

                        from pyresample.geometry import create_area_def

                        # Dynamic native resolution mapping (prevent 1000x1000 hardcoded pixelation)
                        height, width = (
                            area.shape if hasattr(area, "shape") else (1000, 1000)
                        )

                        # Cap max resolution to prevent browser crash, but keep it high-def
                        max_dim = 2500
                        if width > max_dim or height > max_dim:
                            scale = max_dim / max(width, height)
                            width, height = int(width * scale), int(height * scale)

                        area_extent = (west, south, east, north)
                        target_area = create_area_def(
                            area_id="leaflet_grid",
                            projection="EPSG:4326",
                            width=width,
                            height=height,
                            area_extent=area_extent,
                        )

                        logger.info(
                            f"Reprojecting to EPSG:4326 ({width}x{height}) via Bilinear interpolation..."
                        )
                        resampled_scene = parser.scene.resample(
                            target_area, resampler="bilinear"
                        )
                        frame = resampled_scene[variable].values.astype(np.float32)
                    else:
                        frame = parser.extract_time_slice(variable, 0).astype(
                            np.float32
                        )
                except Exception as e:
                    logger.warning(
                        f"Reprojection failed, falling back to raw array: {str(e)}"
                    )
                    frame = parser.extract_time_slice(variable, 0).astype(np.float32)
            else:
                # Extract 2D array matrix directly for AI files or if scene doesn't exist
                frame = parser.extract_time_slice(variable, 0).astype(np.float32)

            # Dynamic Variable Normalization
            if (
                "VIS" in variable.upper()
                or "REF" in variable.upper()
                or "ALBEDO" in variable.upper()
            ):
                is_thermal = False
                valid_mask = ~np.isnan(frame) & ~np.isinf(frame)
                max_frame_val = (
                    np.nanmax(frame[valid_mask]) if np.any(valid_mask) else 1.0
                )
                MIN_VAL = 0.0
                MAX_VAL = 1.0 if max_frame_val <= 1.5 else 100.0
            else:
                MIN_VAL, MAX_VAL = 190.0, 313.0  # Brightness Temperatures (Kelvin)
                is_thermal = True
                valid_mask = (
                    ~np.isnan(frame)
                    & ~np.isinf(frame)
                    & (frame > 50.0)
                    & (frame < 400.0)
                )

            frame_clean = np.where(valid_mask, frame, MIN_VAL)

            # Normalize to 0-255 range
            frame_norm = np.clip(
                (frame_clean - MIN_VAL) / (MAX_VAL - MIN_VAL) * 255, 0, 255
            ).astype(np.uint8)

            # Create RGBA image matrix
            rgba_img = np.zeros(
                (frame_norm.shape[0], frame_norm.shape[1], 4), dtype=np.uint8
            )

            if is_thermal:
                # Standard Meteorological Cloud Mapping:
                # Cold clouds are opaque white. Warm land/water is fully transparent.
                # This allows the rich Green/Blue base maps to show through!

                # Cloud Top Temp range: 190K (Cold/High) to 290K (Warm/Surface)
                CLOUD_MIN = 190.0
                CLOUD_MAX = 290.0

                # Normalize: 190K -> 0, 290K -> 255
                temp_norm = np.clip(
                    (frame_clean - CLOUD_MIN) / (CLOUD_MAX - CLOUD_MIN) * 255, 0, 255
                ).astype(np.uint8)

                # Set RGB to pure white for clouds
                rgba_img[..., 0] = 255  # Red
                rgba_img[..., 1] = 255  # Green
                rgba_img[..., 2] = 255  # Blue

                # Alpha: Invert so 190K (Cold) is Opaque (255) and 290K (Warm) is Transparent (0)
                alpha_channel = 255 - temp_norm

                rgba_img[..., 3] = np.where(valid_mask, alpha_channel, 0)
            else:
                # Visible mapping: Grayscale with full opacity where data exists
                rgba_img[..., 0] = frame_norm
                rgba_img[..., 1] = frame_norm
                rgba_img[..., 2] = frame_norm
                rgba_img[..., 3] = np.where(valid_mask, 255, 0)

            # Convert array to PIL Image
            img = Image.fromarray(rgba_img, mode="RGBA")

            # Save to disk cache for future rapid fetching
            img.save(png_cache_path, format="PNG", optimize=True)

            # Save to in-memory byte buffer to return instantly
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format="PNG", optimize=True)
            img_byte_arr.seek(0)

            return img_byte_arr

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Image layer generation failed: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to generate map layer")
        finally:
            if parser is not None:
                parser.close()

    @staticmethod
    def get_error_map_layer(
        actual_file_id: str, ai_file_id: str, variable: str
    ) -> io.BytesIO:
        """
        Generates a Heatmap PNG showing the absolute difference between Ground Truth and AI Prediction.
        """
        actual_path = VisualizationService._get_file_path(actual_file_id)
        ai_path = VisualizationService._get_file_path(ai_file_id)

        def get_frame_matrix(parser, is_actual: bool):
            if (
                getattr(parser, "is_ai_file", False) is False
                and getattr(parser, "scene", None) is not None
            ):
                try:
                    area = parser.scene[variable].attrs.get("area")
                    if area:
                        # Downsample lonlats strictly for memory safety
                        lons_sub, lats_sub = area.get_lonlats()
                        lons_sub, lats_sub = lons_sub[::20, ::20], lats_sub[::20, ::20]
                        valid_mask = (
                            ~np.isnan(lats_sub)
                            & ~np.isnan(lons_sub)
                            & ~np.isinf(lats_sub)
                            & ~np.isinf(lons_sub)
                        )
                        south, north = (
                            float(np.min(lats_sub[valid_mask])),
                            float(np.max(lats_sub[valid_mask])),
                        )
                        west, east = (
                            float(np.min(lons_sub[valid_mask])),
                            float(np.max(lons_sub[valid_mask])),
                        )

                        from pyresample.geometry import create_area_def

                        height, width = (
                            area.shape if hasattr(area, "shape") else (1000, 1000)
                        )
                        max_dim = 1500  # Smaller max_dim for error map to ensure fast comparisons
                        if width > max_dim or height > max_dim:
                            scale = max_dim / max(width, height)
                            width, height = int(width * scale), int(height * scale)

                        area_extent = (west, south, east, north)
                        target_area = create_area_def(
                            area_id="leaflet_grid",
                            projection="EPSG:4326",
                            width=width,
                            height=height,
                            area_extent=area_extent,
                        )

                        logger.info(
                            "Reprojecting Geostationary data for Error Map overlay via Bilinear..."
                        )
                        resampled_scene = parser.scene.resample(
                            target_area, resampler="bilinear"
                        )
                        return resampled_scene[variable].values.astype(np.float32)
                except Exception as e:
                    logger.warning(f"Error map reprojection failed: {str(e)}")
            return parser.extract_time_slice(variable, 0).astype(np.float32)

        parser_actual = None
        parser_ai = None
        try:
            parser_actual = MetadataService.get_parser(actual_path)
            parser_actual.load_dataset(actual_path)
            VisualizationService.validate_variable(parser_actual, variable)
            frame_actual = get_frame_matrix(parser_actual, True)

            parser_ai = MetadataService.get_parser(ai_path)
            parser_ai.load_dataset(ai_path)
            VisualizationService.validate_variable(parser_ai, variable)
            frame_ai = get_frame_matrix(parser_ai, False)

            # Ensure shapes strictly match (AI frame might skip reprojection if it lacks a scene)
            if frame_actual.shape != frame_ai.shape:
                logger.warning(
                    f"Shape mismatch: Actual {frame_actual.shape} vs AI {frame_ai.shape}. Resizing AI frame..."
                )
                img_ai = Image.fromarray(frame_ai)
                img_ai = img_ai.resize(
                    (frame_actual.shape[1], frame_actual.shape[0]), Image.BILINEAR
                )
                frame_ai = np.array(img_ai)

            # 1. Validation masks
            is_thermal = not (
                "VIS" in variable.upper()
                or "REF" in variable.upper()
                or "ALBEDO" in variable.upper()
            )

            if is_thermal:
                valid_mask_actual = (
                    ~np.isnan(frame_actual)
                    & ~np.isinf(frame_actual)
                    & (frame_actual > 50.0)
                    & (frame_actual < 400.0)
                )
                valid_mask_ai = (
                    ~np.isnan(frame_ai)
                    & ~np.isinf(frame_ai)
                    & (frame_ai > 50.0)
                    & (frame_ai < 400.0)
                )
            else:
                valid_mask_actual = ~np.isnan(frame_actual) & ~np.isinf(frame_actual)
                valid_mask_ai = ~np.isnan(frame_ai) & ~np.isinf(frame_ai)

            valid_mask = valid_mask_actual & valid_mask_ai  # Data valid in both

            # 2. Calculate Absolute Error Map
            error_matrix = np.zeros_like(frame_actual)
            np.abs(frame_actual - frame_ai, out=error_matrix, where=valid_mask)

            # 3. Normalize Error (Dynamic based on variable type)
            if is_thermal:
                MAX_ERROR = 20.0
            else:
                max_actual = (
                    np.nanmax(frame_actual[valid_mask_actual])
                    if np.any(valid_mask_actual)
                    else 1.0
                )
                MAX_ERROR = 0.2 if max_actual <= 1.5 else 20.0

            error_norm = np.clip(error_matrix / MAX_ERROR, 0, 1)

            # 4. Create RGBA image mapping (Yellow -> Red gradient)
            rgba_img = np.zeros(
                (error_matrix.shape[0], error_matrix.shape[1], 4), dtype=np.uint8
            )

            rgba_img[..., 0] = 255  # Red is constant
            rgba_img[..., 1] = (255 * (1 - error_norm)).astype(
                np.uint8
            )  # Green drops to 0 as error rises
            rgba_img[..., 2] = 0  # No Blue

            # 5. Dynamic Transparency: Perfect match (0 error) is completely transparent. High error is opaque.
            # Max opacity is set to 200 (so it doesn't completely block the map behind it)
            opacity = (200 * error_norm).astype(np.uint8)
            rgba_img[..., 3] = np.where(valid_mask, opacity, 0)

            # Save and stream
            img = Image.fromarray(rgba_img, mode="RGBA")
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format="PNG", optimize=True)
            img_byte_arr.seek(0)

            return img_byte_arr

        except Exception as e:
            logger.error(f"Error map generation failed: {str(e)}")
            raise HTTPException(
                status_code=500, detail="Failed to generate error map layer"
            )
        finally:
            if parser_actual is not None:
                parser_actual.close()
            if parser_ai is not None:
                parser_ai.close()
