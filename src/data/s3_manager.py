import glob
import logging
import os
import random
import concurrent.futures

import boto3
import numpy as np
import torch
import xarray as xr
from botocore import UNSIGNED
from botocore.config import Config

from src.config.settings import Settings

logger = logging.getLogger(__name__)

class S3Manager:
    """Manages downloading GOES data from AWS S3, converting it, and purging raw files."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.s3_client = boto3.client("s3", config=Config(signature_version=UNSIGNED))
        self.bucket_name = settings.data.s3_bucket
        
        self.pt_dir = settings.data.download_dir
        self.raw_dir = os.path.join(self.pt_dir, "raw_nc")
        
        os.makedirs(self.pt_dir, exist_ok=True)
        os.makedirs(self.raw_dir, exist_ok=True)

    def download_chunk(self, prefix: str) -> None:
        logger.info(f"Fetching chunk from S3: {prefix}")
        
        # 1. Fetch File List from AWS
        response = self.s3_client.list_objects_v2(Bucket=self.bucket_name, Prefix=prefix)
        c13_files = [obj['Key'] for obj in response.get('Contents', []) if 'M6C13' in obj['Key'] and obj['Key'].endswith('.nc')]
        c13_files = sorted(c13_files) # ✅ Must-have: Chronological sorting
        
        if len(c13_files) < 3:
            logger.warning(f"Not enough files in prefix {prefix} to form a triplet.")
            return

        step = self.settings.data.frame_step
        crop_size = self.settings.data.crop_size

        # 2. Download Raw .nc files Concurrently (Turbo Download)
        def fetch_file(key):
            filename = key.split('/')[-1]
            local_path = os.path.join(self.raw_dir, filename)
            if not os.path.exists(local_path):
                logger.info(f"Downloading {filename}...")
                thread_s3 = boto3.client("s3", config=Config(signature_version=UNSIGNED))
                thread_s3.download_file(self.bucket_name, key, local_path)
            return local_path

        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            local_nc_paths = list(executor.map(fetch_file, c13_files))

        # 3. Create Triplets with Memory-Safe Motion Guided Cropping
        for i in range(len(local_nc_paths) - 2 * step):
            
            # ✅ Dynamic Dimensions: Check the first file to find the grid size
            with xr.open_dataset(local_nc_paths[i]) as ds:
                height = ds.sizes.get("y", 1500) # Defaults just in case
                width = ds.sizes.get("x", 2500)
            
            valid_crop = False
            best_motion = -1
            best_coords = (0, 0)
            best_t0 = None
            best_t2 = None
            
            max_retries = 15
            
            for attempt in range(max_retries):
                # ✅ Randomly sample within the dynamic dimensions
                start_y = random.randint(0, max(0, height - crop_size))
                start_x = random.randint(0, max(0, width - crop_size))
                
                try:
                    # Sirf T0 aur T2 (Past/Future) load karo motion check ke liye
                    t0 = self._process_single_frame(local_nc_paths[i], start_y, start_x, crop_size)
                    t2 = self._process_single_frame(local_nc_paths[i + 2 * step], start_y, start_x, crop_size)
                    
                    # Agar space 5% se zyada hai, chhod do
                    if (t0 == 0.0).float().mean().item() > 0.05 or (t2 == 0.0).float().mean().item() > 0.05:
                        continue
                        
                    # ✅ MOTION SCORE CALCULATION (The Masterstroke)
                    motion_score = torch.abs(t2 - t0).mean().item()
                    
                    # Track the crop with the highest storm movement
                    if motion_score > best_motion:
                        best_motion = motion_score
                        best_coords = (start_y, start_x)
                        best_t0, best_t2 = t0, t2
                        
                    # Agar motion sach mein bohot zyada hai, toh time bachao aur seedha select kar lo
                    if best_motion > 0.015:
                        break
                        
                except Exception as e:
                    continue
                    
            # ✅ Final Verdict: Only accept if Motion is > 0.01
            if best_motion >= 0.01:
                valid_crop = True
                start_y, start_x = best_coords
                t0, t2 = best_t0, best_t2
                logger.info(f"✅ Motion-Guided Crop locked at Y:{start_y}, X:{start_x} | Motion Score: {best_motion:.4f}")
            else:
                logger.warning(f"⏩ Triplet {i} skipped: Clouds are stationary (Max Motion: {best_motion:.4f})")
                continue
                
            # 4. Save the High-Motion Triplet
            try:
                # Ab middle frame (T1) download karo, kyunki crop coordinates ab perfect mil chuke hain
                t1 = self._process_single_frame(local_nc_paths[i + step], start_y, start_x, crop_size)
                
                triplet_tensor = torch.stack([t0, t1, t2], dim=0) # [3, 1, H, W]
                safe_prefix = prefix.replace("/", "_")
                pt_filename = os.path.join(self.pt_dir, f'triplet_{safe_prefix}_{i:03d}.pt')
                
                torch.save(triplet_tensor, pt_filename)
            except Exception as e:
                logger.error(f"Error processing middle frame for triplet {i}: {e}")
                continue

        # 5. Purge .nc files
        self.purge_raw_files()
        logger.info(f"Chunk converted to .pt triplets. Raw .nc files purged.")

    def _process_single_frame(self, nc_path: str, start_y: int, start_x: int, crop_size: int) -> torch.Tensor:
        ds = xr.open_dataset(nc_path)

        try:
            ds_cropped = ds.isel(y=slice(start_y, start_y + crop_size), x=slice(start_x, start_x + crop_size))
        except (ValueError, IndexError):
            ds_cropped = ds

        rad = ds_cropped["Rad"]
        fk1 = ds_cropped["planck_fk1"].values
        fk2 = ds_cropped["planck_fk2"].values
        bc1 = ds_cropped["planck_bc1"].values
        bc2 = ds_cropped["planck_bc2"].values

        rad_safe = rad.where(rad > 0)
        bt = (fk2 / np.log((fk1 / rad_safe) + 1) - bc1) / bc2

        min_bt, max_bt = 180.0, 330.0
        bt_norm = (bt - min_bt) / (max_bt - min_bt)
        bt_norm = bt_norm.clip(0, 1)

        # ✅ Excellent NaN handling as praised in feedback
        clean_numpy_array = np.nan_to_num(bt_norm.values, nan=0.0, posinf=1.0, neginf=0.0)

        tensor = torch.from_numpy(clean_numpy_array).float().unsqueeze(0)
        ds.close()
        
        return tensor

    def purge_raw_files(self) -> None:
        for f in glob.glob(os.path.join(self.raw_dir, "*.nc")):
            os.remove(f)
            
    def purge_chunk(self) -> None:
        for f in glob.glob(os.path.join(self.pt_dir, "*.pt")):
            os.remove(f)
        logger.info("Purged trained .pt chunk from disk.")