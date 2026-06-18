import os
import glob
import shutil
import logging
import torch
import torch.nn.functional as F
import concurrent.futures # Ye top par import karna mat bhoolna

from src.config.settings import Settings
from src.data.fetchers.goes_fetcher import GOESFetcher
from src.data.fetchers.himawari_fetcher import HimawariFetcher
from src.data.standardizer import UniversalStandardizer

logger = logging.getLogger(__name__)


class DataManager:
    """
    Universal multi-satellite data pipeline manager.
    """

    def __init__(self, settings: Settings):
        self.settings = settings
        self.pt_dir = settings.data.download_dir
        self.raw_dir = os.path.join(self.pt_dir, "raw_data")

        os.makedirs(self.pt_dir, exist_ok=True)
        os.makedirs(self.raw_dir, exist_ok=True)

        sat_type = getattr(settings.data, "satellite_type", "goes").lower()

        if sat_type == "goes":
            self.fetcher = GOESFetcher(
                bucket_name=settings.data.s3_bucket
            )
        elif sat_type == "himawari":
            self.fetcher = HimawariFetcher(
                bucket_name=settings.data.s3_bucket
            )
        else:
            raise ValueError(f"Unsupported satellite type: {sat_type}")
    

    def process_chunk(self, chunk_prefix: str) -> None:
        logger.info(f"Processing chunk {chunk_prefix}")

        frame_keys = self.fetcher.fetch_chunk(chunk_prefix)

        if len(frame_keys) < 3:
            logger.warning("Not enough frames for triplets.")
            return

        frame_step = self.settings.data.frame_step

        # 1. Concurrent Download (Fast Network)
        logger.info(f"Concurrently pre-fetching {len(frame_keys)} raw files...")
        def download_worker(key):
            return self.fetcher.fetch_frame(key, self.raw_dir)

        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            local_paths = list(executor.map(download_worker, frame_keys))

        # 🚀 THE SOTA FIX: IN-MEMORY CACHE
        tensor_cache = {}

        def get_tensor(path):
            """Agar tensor cache mein hai toh wahi se do, warna process karo."""
            if path not in tensor_cache:
                raw = self.fetcher.apply_planck_function(path)
                norm = UniversalStandardizer.normalize_bt(
                    raw, self.settings.data.min_bt, self.settings.data.max_bt
                )
                tensor_cache[path] = norm
            return tensor_cache[path]

        logger.info("Building Triplets using Fast RAM Cache...")
        
        # 2. Main Processing Loop
        for i in range(len(local_paths) - 2 * frame_step):
            try:
                t0_path = local_paths[i]
                t1_path = local_paths[i + frame_step]
                t2_path = local_paths[i + 2 * frame_step]

                # Ye ab disk se nahi, seedha RAM se aayega (Lightning Fast!)
                img0 = get_tensor(t0_path)
                gt   = get_tensor(t1_path)
                img1 = get_tensor(t2_path)

                # Crop aur Save
                img0_crop, img1_crop, gt_crop = self._motion_guided_argmax_crop(img0, img1, gt)

                safe_prefix = chunk_prefix.replace("/", "_")
                pt_filename = os.path.join(self.pt_dir, f"triplet_{safe_prefix}_{i:03d}.pt")

                triplet_tensor = torch.stack([img0_crop, gt_crop, img1_crop], dim=0)
                torch.save(triplet_tensor, pt_filename)

                # 🚀 SMART MEMORY MANAGEMENT:
                # Iteration `i` ke baad, `t0_path` wala frame future me kabhi use nahi hoga.
                # Toh usko RAM se uda do taaki Kaggle crash na kare!
                if t0_path in tensor_cache:
                    del tensor_cache[t0_path]

            except Exception as e:
                logger.error(f"Triplet failed ({i}): {e}")
                continue
        
        # 3. Cleanup
        self.purge_raw_files()
        tensor_cache.clear() # Failsafe memory clear
        logger.info("Chunk processing complete. Raw files purged.")
    
    def _delete_temp(self, path: str):
        if os.path.isfile(path):
            os.remove(path)
        elif os.path.isdir(path):
            shutil.rmtree(path)

    def _motion_guided_argmax_crop(
        self,
        img0: torch.Tensor,
        img1: torch.Tensor,
        gt: torch.Tensor
    ):
        crop_size = self.settings.data.crop_size
        _, h, w = img0.shape

        if h < crop_size or w < crop_size:
            raise ValueError(f"Image smaller than crop size: {h}x{w}")

        # 1. Generate Motion Map
        motion_map = torch.abs(img1 - img0)
        space_mask = (img0 > 0.0).float()
        motion_map = motion_map * space_mask
        
        # 🚀 OPTIMIZATION: Downsample by 8x to avoid 1.5 Billion CPU operations
        scale_factor = 8
        small_motion = F.avg_pool2d(
            motion_map.unsqueeze(0), 
            kernel_size=scale_factor, 
            stride=scale_factor
        )
        
        # Calculate scaled-down crop sizes
        small_crop_size = crop_size // scale_factor
        divisor = getattr(self.settings.data, 'crop_stride_divisor', 8)
        small_stride = max(1, small_crop_size // divisor)

        # Fast pooling on the tiny map (Takes milliseconds)
        pooled_motion = F.avg_pool2d(
            small_motion,
            kernel_size=small_crop_size,
            stride=small_stride
        )

        _, _, h_out, w_out = pooled_motion.shape

        flat_idx = torch.argmax(pooled_motion).item()

        y_out = flat_idx // w_out
        x_out = flat_idx % w_out

        # Map the small coordinates back to the High-Res 5424x5424 image
        y = y_out * small_stride * scale_factor
        x = x_out * small_stride * scale_factor

        # Safety bounds
        y = max(0, min(y, h - crop_size))
        x = max(0, min(x, w - crop_size))

        # Direct High-Res Crop
        img0_crop = img0[:, y:y+crop_size, x:x+crop_size]
        img1_crop = img1[:, y:y+crop_size, x:x+crop_size]
        gt_crop = gt[:, y:y+crop_size, x:x+crop_size]

        crop_motion = torch.abs(img1_crop - img0_crop).mean().item()
        static_threshold = getattr(self.settings.data, 'static_motion_threshold', 0.005)

        if crop_motion < static_threshold:
            raise ValueError(f"Static crop rejected: {crop_motion:.5f}")

        return img0_crop, img1_crop, gt_crop
    
    def purge_raw_files(self):
        logger.info("Purging raw files...")

        for f in glob.glob(os.path.join(self.raw_dir, "*")):
            if os.path.isfile(f):
                os.remove(f)
            elif os.path.isdir(f):
                shutil.rmtree(f)