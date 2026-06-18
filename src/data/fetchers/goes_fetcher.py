import os
import logging
import boto3
from botocore import UNSIGNED
from botocore.config import Config
import xarray as xr
import numpy as np
import torch

from src.data.fetchers.base_fetcher import SatelliteFetcher

logger = logging.getLogger(__name__)


class GOESFetcher(SatelliteFetcher):
    def __init__(self, bucket_name: str = "noaa-goes16"):
        super().__init__(bucket_name)
        self.s3_client = boto3.client(
            "s3",
            config=Config(signature_version=UNSIGNED)
        )

    def fetch_chunk(self, chunk_prefix: str, output_dir: str) -> list[str]:
        os.makedirs(output_dir, exist_ok=True)

        paginator = self.s3_client.get_paginator("list_objects_v2")

        c13_files = []

        for page in paginator.paginate(
            Bucket=self.bucket_name,
            Prefix=chunk_prefix
        ):
            for obj in page.get("Contents", []):
                key = obj["Key"]
                if "M6C13" in key and key.endswith(".nc"):
                    c13_files.append(key)

        c13_files = sorted(c13_files)

        downloaded_paths = []

        for file_key in c13_files:
            filename = os.path.basename(file_key)
            local_path = os.path.join(output_dir, filename)

            if not os.path.exists(local_path):
                self.s3_client.download_file(
                    self.bucket_name,
                    file_key,
                    local_path
                )

            downloaded_paths.append(local_path)

        return downloaded_paths

    def fetch_single_file(
        self,
        exact_key: str,
        output_dir: str
    ) -> str:
        os.makedirs(output_dir, exist_ok=True)

        filename = os.path.basename(exact_key)
        local_path = os.path.join(output_dir, filename)

        if not os.path.exists(local_path):
            self.s3_client.download_file(
                self.bucket_name,
                exact_key,
                local_path
            )

        return local_path

    def apply_planck_function(self, raw_data_path: str) -> torch.Tensor:
        with xr.open_dataset(raw_data_path, mask_and_scale=True) as ds:
            rad = ds["Rad"]

            fk1 = ds["planck_fk1"].values
            fk2 = ds["planck_fk2"].values
            bc1 = ds["planck_bc1"].values
            bc2 = ds["planck_bc2"].values

            rad_safe = rad.where(rad > 0)

            bt = (fk2 / np.log((fk1 / rad_safe) + 1) - bc1) / bc2

            clean = np.nan_to_num(
                bt.values,
                nan=0.0,
                posinf=330.0,
                neginf=180.0
            )

            return torch.from_numpy(clean).float().unsqueeze(0)