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

        self.scene = Scene(filenames=[file_path], reader="insat3d_img_l1b_h5")
        target_channels = ["TIR1", "TIR2"]
        try:
            self.scene.load(target_channels)
            logger.success("SatPy loaded INSAT data perfectly!")
        except Exception as e:
            logger.error(f"Failed to load channels: {e}")
            self.scene.load(["TIR1"])
