import logging
from typing import Dict, Any
from fastapi import HTTPException
import numpy as np

from app.schemas.visualization import FrameDataResponse
from app.schemas.validation import ValidationAlignmentResponse, DifferenceMapDataSchema
from app.services.scientific.metadata_service import MetadataService
from app.services.scientific.visualization_service import VisualizationService

logger = logging.getLogger(__name__)

class ValidationService:

    @staticmethod
    def align_frames(generated_file_id: str, ground_truth_file_id: str, variable: str = "C13") -> ValidationAlignmentResponse:
        gen_path = VisualizationService._get_file_path(generated_file_id)
        gt_path = VisualizationService._get_file_path(ground_truth_file_id)

        parser_gen = None
        parser_gt = None
        
        try:
            parser_gen = MetadataService.get_parser(gen_path)
            parser_gen.load_dataset(gen_path)
            VisualizationService.validate_variable(parser_gen, variable)
            frame_gen = parser_gen.extract_time_slice(variable, 0)

            parser_gt = MetadataService.get_parser(gt_path)
            parser_gt.load_dataset(gt_path)
            VisualizationService.validate_variable(parser_gt, variable)
            frame_gt = parser_gt.extract_time_slice(variable, 0)

            # 1. Shape Match Validation
            if frame_gen.shape != frame_gt.shape:
                raise HTTPException(status_code=400, detail=f"Shape mismatch: Generated {frame_gen.shape} != Ground Truth {frame_gt.shape}")

            # Note: Coordinate and timestamp match validation would ideally check netcdf attrs
            # For this phase, we assume alignment if shapes match.

            # Downsample for web if large
            downsample = 1
            if frame_gen.shape[0] > 1024:
                downsample = 2
            
            frame_gen_view = frame_gen[::downsample, ::downsample]
            frame_gt_view = frame_gt[::downsample, ::downsample]

            # 2. Compute Difference Map
            valid_mask_gen = ~np.isnan(frame_gen_view) & ~np.isinf(frame_gen_view)
            valid_mask_gt = ~np.isnan(frame_gt_view) & ~np.isinf(frame_gt_view)
            valid_mask = valid_mask_gen & valid_mask_gt

            diff_matrix = np.zeros_like(frame_gen_view)
            np.subtract(frame_gen_view, frame_gt_view, out=diff_matrix, where=valid_mask)
            
            # Convert to float lists for JSON
            z_gen = np.where(valid_mask_gen, frame_gen_view, 0.0).tolist()
            z_gt = np.where(valid_mask_gt, frame_gt_view, 0.0).tolist()
            z_diff = np.where(valid_mask, diff_matrix, 0.0).tolist()

            gen_min, gen_max = float(np.nanmin(frame_gen_view)), float(np.nanmax(frame_gen_view))
            gt_min, gt_max = float(np.nanmin(frame_gt_view)), float(np.nanmax(frame_gt_view))
            diff_min, diff_max = float(np.nanmin(diff_matrix[valid_mask])), float(np.nanmax(diff_matrix[valid_mask]))

            return ValidationAlignmentResponse(
                generated_file_id=generated_file_id,
                ground_truth_file_id=ground_truth_file_id,
                aligned_generated=FrameDataResponse(
                    file_id=generated_file_id,
                    variable=variable,
                    time_index=0,
                    shape=list(frame_gen_view.shape),
                    min=gen_min,
                    max=gen_max,
                    mean=float(np.nanmean(frame_gen_view)),
                    std=float(np.nanstd(frame_gen_view)),
                    z=z_gen
                ),
                aligned_ground_truth=FrameDataResponse(
                    file_id=ground_truth_file_id,
                    variable=variable,
                    time_index=0,
                    shape=list(frame_gt_view.shape),
                    min=gt_min,
                    max=gt_max,
                    mean=float(np.nanmean(frame_gt_view)),
                    std=float(np.nanstd(frame_gt_view)),
                    z=z_gt
                ),
                difference_map=DifferenceMapDataSchema(
                    id=f"{generated_file_id}_{ground_truth_file_id}",
                    timestamp="2024-01-01T00:00:00Z", # Placeholder
                    band=variable,
                    dimensions=list(frame_gen_view.shape),
                    data=z_diff,
                    min=diff_min,
                    max=diff_max
                ),
                dimensions=list(frame_gen_view.shape),
                metadata={"status": "aligned", "downsample": downsample}
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Validation alignment failed: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to align frames for validation")
        finally:
            if parser_gen is not None:
                parser_gen.close()
            if parser_gt is not None:
                parser_gt.close()
