from typing import Dict, List

import h5py
import numpy as np
from loguru import logger
from satpy import Scene
from satpy.readers.insat3d_img_l1b_h5 import Insat3DIMGL1BH5FileHandler

from .base_parser import BaseDatasetParser


# --- MONKEY PATCHING SATPY ---
def patched_get_area_def(self, ds_id):
    try:
        return super(type(self), self).get_area_def(ds_id)
    except Exception:
        logger.warning(
            "SatPy projection crash detected! Patching Altitude on the fly..."
        )
        self.datatree.attrs["Observed_Altitude(km)"] = 35786.0
        return super(type(self), self).get_area_def(ds_id)


Insat3DIMGL1BH5FileHandler.get_area_def = patched_get_area_def
# -----------------------------


def make_compatible_with_satpy(file_path: str):
    """File Sanitization before SatPy touches it"""
    try:
        with h5py.File(file_path, "r+") as f:
            if "Longitude_WV" not in f and "Longitude" in f:
                f["Longitude_WV"] = f["Longitude"]
            if "Latitude_WV" not in f and "Latitude" in f:
                f["Latitude_WV"] = f["Latitude"]

            for key in list(f.attrs.keys()):
                if (
                    "time" in key.lower()
                    or "gmt" in key.lower()
                    or "ist" in key.lower()
                ):
                    val = f.attrs[key]
                    is_bytes = isinstance(val, bytes)
                    val_str = val.decode("utf-8") if is_bytes else str(val)
                    if "." in val_str:
                        fixed_str = val_str.split(".")[0]
                        f.attrs[key] = (
                            fixed_str.encode("utf-8") if is_bytes else fixed_str
                        )

            for key in list(f.attrs.keys()):
                if "altitude" in key.lower():
                    val = f.attrs[key]
                    if isinstance(val, (float, np.floating)) and val > 1e10:
                        f.attrs[key] = 35786.0
                    elif isinstance(val, np.ndarray) and val.size > 0 and val[0] > 1e10:
                        f.attrs[key] = np.array([35786.0], dtype=val.dtype)
    except Exception as e:
        logger.warning(f"Compatibility patch failed (read-only): {e}")


class HDFParser(BaseDatasetParser):
    def load_dataset(self, file_path: str):
        logger.info(f"Making ISRO HDF5 compatible with SatPy: {file_path}")
        make_compatible_with_satpy(file_path)

        # Attempt to auto-detect reader to support multiple satellite types
        try:
            self.scene = Scene(filenames=[file_path])
            logger.info("SatPy auto-detected reader successfully.")
        except ValueError:
            # Fallback to hardcoded INSAT reader if auto-detection fails (e.g. non-standard filenames)
            logger.warning(
                "SatPy auto-detection failed. Falling back to 'insat3d_img_l1b_h5' reader."
            )
            self.scene = Scene(filenames=[file_path], reader="insat3d_img_l1b_h5")

        # Load all available channels dynamically instead of hardcoding TIR1/TIR2
        available_channels = [ds["name"] for ds in self.scene.available_dataset_ids()]
        target_channels = ["TIR1", "TIR2", "VIS", "SWIR", "MIR", "WV"]

        # Load whatever is available from our targets, or fallback to first available
        channels_to_load = [ch for ch in target_channels if ch in available_channels]
        if not channels_to_load and available_channels:
            channels_to_load = available_channels[:2]

        try:
            if channels_to_load:
                self.scene.load(channels_to_load)
                logger.success(f"SatPy loaded channels: {channels_to_load}")
            else:
                logger.warning("No standard channels found to preload.")
        except Exception as e:
            logger.error(f"Failed to load channels: {e}")
            if available_channels:
                self.scene.load([available_channels[0]])
