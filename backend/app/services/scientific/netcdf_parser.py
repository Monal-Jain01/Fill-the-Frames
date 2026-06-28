from pathlib import Path

import numpy as np
import xarray as xr
from loguru import logger
from satpy import Scene

from app.schemas.metadata import VariableInfo

from .base_parser import BaseDatasetParser


class NetCDFParser(BaseDatasetParser):
    def __init__(self):
        super().__init__()
        self.is_ai_file = False
        self.ds = None

    def load_dataset(self, file_path: str):
        filename = Path(file_path).name
        logger.info(f"Loading NetCDF: {filename}")

        try:
            if "Interpolated_AI" in filename or filename.startswith("AI_"):
                self.is_ai_file = True
                # AI files are CF-standard. Since SatPy lacks a CF reader, we use xarray.
                self.ds = xr.open_dataset(file_path)
            else:
                self.is_ai_file = False
                self.scene = Scene(filenames=[file_path], reader="abi_l1b")
                available_vars = [
                    var["name"] for var in self.scene.available_dataset_ids()
                ]
                if available_vars:
                    self.scene.load(available_vars)
        except Exception as e:
            logger.error(f"Failed to load dataset {filename}: {str(e)}")
            raise

    def get_variable_names(self) -> list:
        if self.is_ai_file:
            return list(self.ds.data_vars.keys())
        return super().get_variable_names()

    def extract_time_slice(self, variable: str, time_index: int) -> np.ndarray:
        if self.is_ai_file:
            if variable not in self.ds:
                raise ValueError(f"Variable {variable} not found in AI dataset")
            # Return pure numpy array from xarray dataset
            return self.ds[variable].values.astype(np.float32)
        return super().extract_time_slice(variable, time_index)

    def extract_metadata(self) -> dict:
        """Overrides metadata extraction specifically for xarray datasets (AI files)"""
        if self.is_ai_file:
            variables = []
            for var_name, var_data in self.ds.data_vars.items():
                variables.append(
                    VariableInfo(
                        name=str(var_name),
                        datatype=str(var_data.dtype),
                        dimensions=list(var_data.dims),
                        shape=list(var_data.shape),
                        attributes={},
                        min_value=None,
                        max_value=None,
                    )
                )
            return {
                "global_attributes": dict(self.ds.attrs),
                "dimensions": [],
                "variables": variables,
                "coordinates": None,
                "temporal_info": None,
                "variable_count": len(variables),
                "dimension_count": len(self.ds.dims),
                "coordinate_count": 0,
            }
        return super().extract_metadata()

    def close(self):
        if self.is_ai_file and self.ds is not None:
            self.ds.close()
        super().close()
