from loguru import logger
from satpy import Scene

from .base_parser import BaseDatasetParser


class HDFParser(BaseDatasetParser):
    def load_dataset(self, file_path: str):
        logger.info(f"Loading ISRO INSAT HDF5 via SatPy: {file_path}")

        # SatPy reader for INSAT 3D/3DR/3DS Imager Level-1B
        self.scene = Scene(filenames=[file_path], reader="insat3d_img_l1b_h5")

        # So we MUST use var.name, not var["name"]
        available_vars = [var.name for var in self.scene.available_dataset_ids()]

        if available_vars:
            logger.info(f"Available variables found: {available_vars}")
            self.scene.load(available_vars)
