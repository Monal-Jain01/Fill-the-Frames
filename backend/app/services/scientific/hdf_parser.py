import h5py
import numpy as np
from typing import Dict, Any, List
from .base_parser import BaseDatasetParser

class HDFParser(BaseDatasetParser):
    def __init__(self):
        self.file = None

    def load_dataset(self, file_path: str):
        self.file = h5py.File(file_path, "r")

    def _convert_type(self, val):
        if isinstance(val, (np.integer, int)):
            return int(val)
        if isinstance(val, (np.floating, float)):
            return float(val)
        if isinstance(val, np.ndarray):
            if val.size == 1:
                return self._convert_type(val.item())
            return [self._convert_type(v) for v in val.tolist()]
        if isinstance(val, bytes):
            try:
                return val.decode('utf-8')
            except Exception:
                return str(val)
        return str(val)

    def extract_metadata(self) -> Dict[str, Any]:
        if self.file is None:
            raise ValueError("Dataset not loaded")

        # Global Attributes
        global_attributes = {k: self._convert_type(v) for k, v in self.file.attrs.items()}

        variables = []
        dimensions_map = {}
        coordinate_names = []
        
        # Helper to traverse HDF5 recursively
        def visit_func(name, node):
            if isinstance(node, h5py.Dataset):
                var_attrs = {k: self._convert_type(v) for k, v in node.attrs.items()}
                
                # Check if it's a dimension scale (often used as coordinates in HDF5/netCDF4-hdf5)
                is_scale = False
                if "CLASS" in var_attrs and var_attrs["CLASS"] == "DIMENSION_SCALE":
                    is_scale = True
                    coordinate_names.append(name.split('/')[-1])
                
                # Extract dimension sizes
                dims = []
                for i, dim in enumerate(node.dims):
                    if len(dim) > 0 and dim[0].name:
                        dim_name = dim[0].name.split('/')[-1]
                        dims.append(dim_name)
                        dimensions_map[dim_name] = node.shape[i]
                    else:
                        dim_name = f"{name}_dim_{i}"
                        dims.append(dim_name)
                        dimensions_map[dim_name] = node.shape[i]
                
                if not dims:
                    # If dims aren't formally defined, make placeholder names
                    for i, s in enumerate(node.shape):
                        dim_name = f"dim_{i}"
                        dims.append(dim_name)
                        dimensions_map[dim_name] = s

                min_val = None
                max_val = None
                if node.size > 0 and node.size < 100000:
                    try:
                        # Only read small datasets to avoid memory issues
                        data = node[:]
                        min_val = float(np.min(data))
                        max_val = float(np.max(data))
                    except Exception:
                        pass
                
                variables.append({
                    "name": name,
                    "datatype": str(node.dtype),
                    "dimensions": dims,
                    "shape": list(node.shape),
                    "attributes": var_attrs,
                    "min_value": min_val,
                    "max_value": max_val
                })

        self.file.visititems(visit_func)

        dimensions = [{"name": str(k), "size": int(v)} for k, v in dimensions_map.items()]

        # Coordinates
        lat_names = ["lat", "latitude", "y", "geolocation/latitude"]
        lon_names = ["lon", "longitude", "x", "geolocation/longitude"]
        
        lat_coord = next((c for c in coordinate_names if c.lower() in lat_names), None)
        lon_coord = next((c for c in coordinate_names if c.lower() in lon_names), None)
        
        # Sometimes lat/lon are just variables not marked as scales
        if not lat_coord:
            lat_coord = next((v["name"] for v in variables if v["name"].split('/')[-1].lower() in lat_names), None)
        if not lon_coord:
            lon_coord = next((v["name"] for v in variables if v["name"].split('/')[-1].lower() in lon_names), None)

        projection = global_attributes.get("projection") or global_attributes.get("grid_mapping_name")
        for var in variables:
            if "grid_mapping" in var["attributes"] or "grid_mapping_name" in var["attributes"]:
                projection = var["attributes"].get("grid_mapping_name") or "mapped"
                break

        coordinates = {
            "latitude": lat_coord,
            "longitude": lon_coord,
            "projection": str(projection) if projection else None
        }

        # Temporal Information
        time_names = ["time", "valid_time", "timestamp", "forecast_time"]
        time_coord_name = next((c for c in coordinate_names if c.lower() in time_names), None)
        if not time_coord_name:
            time_coord_name = next((v["name"] for v in variables if v["name"].split('/')[-1].lower() in time_names), None)
            
        temporal_info = {
            "start_time": None,
            "end_time": None,
            "time_steps": None
        }

        if time_coord_name and time_coord_name in self.file:
            t_var = self.file[time_coord_name]
            temporal_info["time_steps"] = int(t_var.size)
            if t_var.size > 0:
                try:
                    data = t_var[:]
                    temporal_info["start_time"] = str(data[0])
                    temporal_info["end_time"] = str(data[-1])
                except Exception:
                    pass

        return {
            "global_attributes": global_attributes,
            "dimensions": dimensions,
            "variables": variables,
            "coordinates": coordinates,
            "temporal_info": temporal_info,
            "variable_count": len(variables),
            "dimension_count": len(dimensions),
            "coordinate_count": len(coordinate_names)
        }

    def close(self):
        if self.file is not None:
            self.file.close()
