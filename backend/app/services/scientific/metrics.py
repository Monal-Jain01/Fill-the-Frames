import numpy as np
import xarray as xr  # 🚨 SatPy ko bypass karne ke liye Xarray import kiya
from fastapi import HTTPException
from loguru import logger
from skimage.metrics import peak_signal_noise_ratio as psnr
from skimage.metrics import structural_similarity as ssim

from app.services.scientific.metadata_service import MetadataService
from app.services.scientific.visualization_service import VisualizationService


class MetricsService:
    # Standard GOES BT Range (Max - Min)
    DATA_RANGE = 313.0 - 90.0

    @staticmethod
    def calculate_accuracy(
        generated_file_id: str, truth_file_id: str, variable: str = "C13"
    ):
        logger.info(
            f"Calculating metrics between {generated_file_id} and {truth_file_id}"
        )

        try:
            # 1. Get File Paths
            gen_path = VisualizationService._get_file_path(generated_file_id)
            truth_path = VisualizationService._get_file_path(truth_file_id)

            # 2. Extract Data Matrix from TRUTH file (Use SatPy because original file is complex)
            parser_truth = MetadataService.get_parser(truth_path)
            parser_truth.load_dataset(truth_path)
            img_truth = parser_truth.extract_time_slice(variable, 0)
            parser_truth.close()

            # 3. Extract Data Matrix from GENERATED file (Use Xarray to bypass filename error)
            ds_gen = xr.open_dataset(gen_path)

            # Extract array (CF writer usually saves it under the variable name)
            if variable in ds_gen.data_vars:
                img_gen = ds_gen[variable].values
            else:
                # Fallback: agar naam change ho gaya ho, toh pehla data utha lo
                img_gen = list(ds_gen.data_vars.values())[0].values
            ds_gen.close()

            # Ensure it's strictly a 2D matrix (time dimension hatane ke liye)
            img_gen = np.squeeze(img_gen)

            # 4. Shape Verification
            if img_gen.shape != img_truth.shape:
                raise HTTPException(
                    status_code=400,
                    detail=f"Shape mismatch: Generated {img_gen.shape} vs Truth {img_truth.shape}",
                )

            # 5. Handle Deep Space (NaN/Inf values)
            valid_mask = (
                ~np.isnan(img_truth)
                & ~np.isnan(img_gen)
                & ~np.isinf(img_truth)
                & ~np.isinf(img_gen)
            )

            img_truth_clean = np.where(valid_mask, img_truth, 90.0)
            img_gen_clean = np.where(valid_mask, img_gen, 90.0)

            logger.info("Running SSIM and PSNR equations...")

            # 6. Calculate Metrics
            psnr_val = psnr(
                img_truth_clean, img_gen_clean, data_range=MetricsService.DATA_RANGE
            )
            ssim_val = ssim(
                img_truth_clean, img_gen_clean, data_range=MetricsService.DATA_RANGE
            )
            mse_val = np.mean((img_truth_clean - img_gen_clean) ** 2)
            quality_score = max(0, min(100, float(ssim_val * 100)))

            # Result formatting
            return {
                "psnr": round(float(psnr_val), 2),
                "ssim": round(float(ssim_val), 4),
                "mse": round(float(mse_val), 4),
                "quality_score": round(quality_score, 2),
                "psnr_db": round(float(psnr_val), 2),
                "accuracy_percentage": round(quality_score, 2),
            }

        except Exception as e:
            logger.error(f"Metrics calculation failed: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to calculate metrics: {str(e)}"
            )
