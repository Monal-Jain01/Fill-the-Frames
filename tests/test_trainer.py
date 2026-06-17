import torch
import pytest
from src.training.trainer import Trainer
from src.model.ifnet import IFNet
from src.config.settings import Settings, TrainingConfig, DataConfig

def test_trainer_init():
    # 🚨 FIX: Updated DataConfig and TrainingConfig parameters
    settings = Settings(
        training=TrainingConfig(
            epochs=1, batch_size=2, learning_rate=1e-4, 
            checkpoints_dir="chkpt", load_model_path=""
        ),
        data=DataConfig(
            s3_bucket="b", download_dir="d", year=2024, 
            start_day=200, end_day=201, frame_step=3, crop_size=256
        )
    )
    model = IFNet()
    device = torch.device("cpu")
    trainer = Trainer(settings, model, device)
    
    assert trainer.global_step == 0