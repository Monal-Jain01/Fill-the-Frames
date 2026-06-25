from loguru import logger
from satpy import Scene

from .base_parser import BaseDatasetParser


class HDFParser(BaseDatasetParser):
    def load_dataset(self, file_path: str):
        logger.info(f"Loading ISRO INSAT HDF5 via SatPy: {file_path}")

        # SatPy reader for INSAT 3D/3DR/3DS Imager Level-1B
        self.scene = Scene(filenames=[file_path], reader="insat3d_img_l1b_h5")

        available_vars = [var.name for var in self.scene.available_dataset_ids()]

        if available_vars:
            logger.info(f"Available variables found: {available_vars}")

            # 🚨 THE FIX: Load variables one by one in a Try-Except block
            # Agar ISRO ki file me koi channel (jaise WV) corrupt hai, to backend crash nahi hoga!
            for var in available_vars:
                try:
                    self.scene.load([var])
                except Exception as e:
                    logger.warning(
                        f"Skipping variable '{var}' due to file inconsistency: {e}"
                    )
