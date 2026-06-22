import os
import logging
from typing import Dict, Any

from app.schemas.metadata import MetadataResponse, DimensionInfo, VariableInfo, CoordinateInfo, TemporalInfo, DatasetSummary
from .netcdf_parser import NetCDFParser
from .hdf_parser import HDFParser

logger = logging.getLogger(__name__)

class MetadataService:
    @staticmethod
    def get_parser(file_path: str):
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".nc":
            return NetCDFParser()
        elif ext in [".h5", ".hdf5"]:
            return HDFParser()
        else:
            raise ValueError(f"Unsupported file extension: {ext}")

    @staticmethod
    def extract_metadata(file_id: str, file_path: str) -> MetadataResponse:
        logger.info(f"Opening dataset {file_id} at {file_path}")
        parser = None
        try:
            parser = MetadataService.get_parser(file_path)
            parser.load_dataset(file_path)
            
            raw_metadata = parser.extract_metadata()
            
            file_size = os.path.getsize(file_path)
            file_format = os.path.splitext(file_path)[1].lower().strip(".")
            
            summary = DatasetSummary(
                file_format=file_format,
                variable_count=raw_metadata["variable_count"],
                dimension_count=raw_metadata["dimension_count"],
                coordinate_count=raw_metadata["coordinate_count"],
                dataset_size=file_size
            )
            
            response = MetadataResponse(
                file_id=file_id,
                filename=os.path.basename(file_path),
                size=file_size,
                format=file_format,
                global_attributes=raw_metadata["global_attributes"],
                dimensions=[DimensionInfo(**d) for d in raw_metadata["dimensions"]],
                variables=[VariableInfo(**v) for v in raw_metadata["variables"]],
                coordinates=CoordinateInfo(**raw_metadata["coordinates"]),
                temporal_info=TemporalInfo(**raw_metadata["temporal_info"]),
                summary=summary
            )
            
            logger.info(f"Metadata extracted successfully for {file_id}")
            return response
            
        except Exception as e:
            logger.error(f"Metadata extraction failed for {file_id}: {str(e)}")
            raise e
        finally:
            if parser is not None:
                parser.close()
