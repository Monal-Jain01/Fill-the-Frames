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

        # 🚀 FIX 1: Concurrent Download (Brings back your 8x speed!)
        logger.info(f"Concurrently pre-fetching {len(frame_keys)} raw files...")
        def download_worker(key):
            return self.fetcher.fetch_frame(key, self.raw_dir)

        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            local_paths = list(executor.map(download_worker, frame_keys))

        # 🚀 FIX 2: Process directly from pre-downloaded paths
        for i in range(len(local_paths) - 2 * frame_step):
            try:
                t0_path = local_paths[i]
                t1_path = local_paths[i + frame_step]
                t2_path = local_paths[i + 2 * frame_step]

                img0_raw = self.fetcher.apply_planck_function(t0_path)
                gt_raw = self.fetcher.apply_planck_function(t1_path)
                img1_raw = self.fetcher.apply_planck_function(t2_path)

                # 🚨 FIX 3: _delete_temp HATA DIYA! 
                # (Files ko purge_raw_files() aakhiri mein ek sath udayega)

                img0 = UniversalStandardizer.normalize_bt(
                    img0_raw, self.settings.data.min_bt, self.settings.data.max_bt
                )
                gt = UniversalStandardizer.normalize_bt(
                    gt_raw, self.settings.data.min_bt, self.settings.data.max_bt
                )
                img1 = UniversalStandardizer.normalize_bt(
                    img1_raw, self.settings.data.min_bt, self.settings.data.max_bt
                )

                img0_crop, img1_crop, gt_crop = self._motion_guided_argmax_crop(img0, img1, gt)

                safe_prefix = chunk_prefix.replace("/", "_")
                pt_filename = os.path.join(self.pt_dir, f"triplet_{safe_prefix}_{i:03d}.pt")

                triplet_tensor = torch.stack([img0_crop, gt_crop, img1_crop], dim=0)
                torch.save(triplet_tensor, pt_filename)

            except Exception as e:
                logger.error(f"Triplet failed ({i}): {e}")
                continue
        
        # 🚨 FIX 4: Sab triplets banne ke baad disk ek baar mein clear hogi
        self.purge_raw_files()
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
        stride = crop_size // self.settings.data.crop_stride_divisor

        _, h, w = img0.shape

        if h < crop_size or w < crop_size:
            raise ValueError(
                f"Image smaller than crop size: {h}x{w}"
            )

        motion_map = torch.abs(img1 - img0)

        # Mask out outer-space / invalid regions
        space_mask = (img0 > 0.0).float()
        motion_map = motion_map * space_mask

        pooled_motion = F.avg_pool2d(
            motion_map.unsqueeze(0),
            kernel_size=crop_size,
            stride=stride
        )

        _, _, h_out, w_out = pooled_motion.shape

        flat_idx = torch.argmax(pooled_motion).item()

        y_out = flat_idx // w_out
        x_out = flat_idx % w_out

        y = y_out * stride
        x = x_out * stride

        y = max(0, min(y, h - crop_size))
        x = max(0, min(x, w - crop_size))

        img0_crop = img0[:, y:y+crop_size, x:x+crop_size]
        img1_crop = img1[:, y:y+crop_size, x:x+crop_size]
        gt_crop = gt[:, y:y+crop_size, x:x+crop_size]

        crop_motion = torch.abs(
            img1_crop - img0_crop
        ).mean().item()

        if crop_motion < self.settings.data.static_motion_threshold:
            raise ValueError(
                f"Static crop rejected: {crop_motion:.5f}"
            )

        return img0_crop, img1_crop, gt_crop

    def purge_raw_files(self):
        logger.info("Purging raw files...")

        for f in glob.glob(os.path.join(self.raw_dir, "*")):
            if os.path.isfile(f):
                os.remove(f)
            elif os.path.isdir(f):
                shutil.rmtree(f)