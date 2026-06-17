# In tests/test_trainer.py
import torch
import pytest
from src.training.trainer import Trainer
from src.model.ifnet import IFNet
from src.config.settings import Settings, TrainingConfig, DataConfig

def test_trainer_init():
    settings = Settings(
        training=TrainingConfig(epochs=1, batch_size=2, learning_rate=1e-4, checkpoints_dir="chkpt"),
        data=DataConfig(s3_bucket="b", download_dir="d", chunk_size_days=1)
    )
    model = IFNet()
    device = torch.device("cpu")
    trainer = Trainer(settings, model, device)
    
    assert trainer.global_step == 0
