import numpy as np
import xarray as xr
from fastapi import HTTPException
from loguru import logger
from skimage.metrics import peak_signal_noise_ratio as psnr
from skimage.metrics import structural_similarity as ssim
from skimage.metrics import mean_squared_error as mse

from app.services.scientific.metadata_service import MetadataService
from app.services.scientific.visualization_service import VisualizationService


class MetricsService:
    # Standard GOES BT Range (Max - Min)
    DATA_RANGE = 313.0 - 90.0

    @staticmethod
    def calculate_accuracy(generated_file_id: str, truth_file_id: str, variable: str = "C13"):
        logger.info(f"Calculating metrics between {generated_file_id} and {truth_file_id}")
        
        try:
            # 1. Get File Paths (Hits local /tmp cache to avoid double HF Bucket fetch)
            gen_path = VisualizationService._get_file_path(generated_file_id)
            truth_path = VisualizationService._get_file_path(truth_file_id)

            # 2. Extract Data Matrix from TRUTH file
            parser_truth = MetadataService.get_parser(truth_path)
            parser_truth.load_dataset(truth_path)
            img_truth = parser_truth.extract_time_slice(variable, 0)
            parser_truth.close()

            # 3. Extract Data Matrix from GENERATED file
            ds_gen = xr.open_dataset(gen_path)
            
            if variable in ds_gen.data_vars:
                img_gen = ds_gen[variable].values
            else:
                img_gen = list(ds_gen.data_vars.values())[0].values
            ds_gen.close()

            img_gen = np.squeeze(img_gen)

            # 4. Shape Verification
            if img_gen.shape != img_truth.shape:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Shape mismatch: Generated {img_gen.shape} vs Truth {img_truth.shape}"
                )

            # 5. Handle Deep Space (NaN/Inf values)
            valid_mask = ~np.isnan(img_truth) & ~np.isnan(img_gen) & ~np.isinf(img_truth) & ~np.isinf(img_gen)
            
            img_truth_clean = np.where(valid_mask, img_truth, 90.0)
            img_gen_clean = np.where(valid_mask, img_gen, 90.0)

            logger.info("Running SSIM, PSNR, and MSE equations...")

            # 6. Calculate Metrics
            psnr_val = float(psnr(img_truth_clean, img_gen_clean, data_range=MetricsService.DATA_RANGE))
            ssim_val = float(ssim(img_truth_clean, img_gen_clean, data_range=MetricsService.DATA_RANGE))
            mse_val = float(mse(img_truth_clean, img_gen_clean))
            
            # Aggregate Quality Score logic:
            # 60% SSIM, 30% PSNR, 10% MSE penalty
            # SSIM is 0-1 (we scale to 60)
            # PSNR is typically 20-50 for decent images. Normalize to ~30. Let's cap PSNR at 50 for max score.
            # MSE is error, we subtract penalty.
            
            ssim_score = ssim_val * 60.0
            psnr_norm = min(max(psnr_val / 50.0, 0), 1) * 30.0
            # MSE penalty: max penalty is 10 if MSE is very high.
            mse_penalty = min(mse_val / 100.0, 10.0)
            
            quality_score = max(min(ssim_score + psnr_norm - mse_penalty, 100.0), 0.0)
            
            summary = "Excellent agreement" if quality_score >= 90 else (
                "Good agreement" if quality_score >= 75 else "Poor agreement"
            )

            # Result formatting
            return {
                "psnr": round(psnr_val, 2),
                "ssim": round(ssim_val, 4),
                "mse": round(mse_val, 4),
                "fsim": None,
                "issm": None,
                "quality_score": round(quality_score, 2),
                "summary": summary
            }

        except Exception as e:
            logger.error(f"Metrics calculation failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to calculate metrics: {str(e)}")
