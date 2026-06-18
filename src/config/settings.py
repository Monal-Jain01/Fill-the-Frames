from dataclasses import dataclass
import yaml

@dataclass
class TrainingConfig:
    epochs: int
    batch_size: int
    learning_rate: float
    checkpoints_dir: str
    load_model_path: str = ""

@dataclass
class DataConfig:
    s3_bucket: str
    download_dir: str
    prefix_type: str   # 🚨 Yahan prefix_type add kar diya
    year: int
    start_day: int
    end_day: int
    frame_step: int
    crop_size: int

@dataclass
class Settings:
    training: TrainingConfig
    data: DataConfig

def load_settings(config_path: str = "src/config/config.yaml") -> Settings:
    with open(config_path, 'r') as file:
        raw_config = yaml.safe_load(file)
        
    return Settings(
        training=TrainingConfig(**raw_config.get("training", {})),
        data=DataConfig(**raw_config.get("data", {}))
    )