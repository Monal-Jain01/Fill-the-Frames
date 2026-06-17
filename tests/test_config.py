import logging
import os

from src.config.settings import load_settings
from src.utils import setup_logging

def test_load_settings(tmp_path):
    yaml_content = """
    training:
      epochs: 100
      batch_size: 4
      learning_rate: 0.0001
      checkpoints_dir: "/kaggle/working/checkpoints"
      load_model_path: "/kaggle/input/models/1week_model.pth"
      
    data:
      s3_bucket: "noaa-goes16"
      download_dir: "goes_data"
      year: 2024
      start_day: 264
      end_day: 294
      frame_step: 3
      crop_size: 512
    """
    config_file = tmp_path / "config.yaml"
    config_file.write_text(yaml_content)

    settings = load_settings(str(config_file))
    assert settings.training.epochs == 100
    assert settings.data.year == 2024
    assert settings.training.load_model_path == "/kaggle/input/models/1week_model.pth"

def test_setup_logging():
    logger = setup_logging(level=logging.DEBUG)
    assert logger.level == logging.DEBUG
    assert len(logger.handlers) > 0