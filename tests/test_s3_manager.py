from unittest.mock import MagicMock, patch
import numpy as np
import pytest
import xarray as xr
import torch

from src.config.settings import DataConfig, Settings, TrainingConfig
from src.data.s3_manager import S3Manager

@pytest.fixture
def mock_settings():
    # Updated to match the exact schema
    return Settings(
        training=TrainingConfig(
            epochs=1, batch_size=1, learning_rate=0.001, 
            checkpoints_dir="chkpt", load_model_path=""
        ),
        data=DataConfig(
            s3_bucket="test-bucket", download_dir="test_dir", 
            year=2024, start_day=200, end_day=201, frame_step=3, crop_size=256
        ),
    )

def test_load_full_tensor(mock_settings, tmp_path):
    manager = S3Manager(mock_settings)
    
    # Create mock NetCDF dataset simulating GOES-16/19 data
    ds = xr.Dataset(
        {"Rad": (("y", "x"), np.ones((512, 512)) * 10)},
        coords={"y": np.arange(512), "x": np.arange(512)},
    )
    ds["planck_fk1"] = 1.0
    ds["planck_fk2"] = 100.0
    ds["planck_bc1"] = 0.1
    ds["planck_bc2"] = 1.0

    nc_path = tmp_path / "test.nc"
    ds.to_netcdf(nc_path)

    # 🚨 FIX: Call the ACTUAL method that exists in your s3_manager.py
    tensor = manager._load_full_tensor(str(nc_path))

    # Assertions to ensure it returns a valid PyTorch tensor with the correct shape
    assert isinstance(tensor, torch.Tensor)
    assert tensor.shape == (1, 512, 512)
    assert not torch.isnan(tensor).any()  # Ensure no NaN values exist in the output