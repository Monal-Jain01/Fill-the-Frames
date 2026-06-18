import os
import logging
import torch
from src.config.settings import load_settings
from src.utils import setup_logging
from src.data.s3_manager import S3Manager
from src.model.ifnet import IFNet
from src.training.trainer import Trainer

def main():
    logger = setup_logging()
    settings = load_settings()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    logger.info("Starting Autonomous Satellite Interpolation Pipeline...")
    
    s3_manager = S3Manager(settings)
    model = IFNet()
    
    # Load previous checkpoint if it exists
    checkpoint_path = settings.training.load_model_path
    
    if os.path.exists(checkpoint_path):
        model.load_state_dict(torch.load(checkpoint_path, map_location=device))
        logger.info(f"✅ Loaded EXISTING model from Kaggle Input. Resuming training!")
    else:
        logger.warning(f"⚠️ Checkpoint not found at {checkpoint_path}. Starting from scratch.")
    trainer = Trainer(settings, model, device)
    
    # 🤖 100% Config-Driven Chunk Generation
    year = settings.data.year
    start_day = settings.data.start_day
    end_day = settings.data.end_day
    prefix_type = settings.data.prefix_type  # 🚨 Config se prefix uthaya
    
    # 🚨 Hardcoded RadC hata diya!
    chunks = [f"{prefix_type}/{year}/{day:03d}/" for day in range(start_day, end_day + 1)]
    
    for chunk_idx, chunk in enumerate(chunks):
        logger.info(f"=== Fetching and Processing Chunk {chunk_idx + 1}/{len(chunks)}: {chunk} ===")
        
        s3_manager.download_chunk(chunk)
        
        for epoch in range(1, settings.training.epochs + 1):
            logger.info(f"--- Chunk {chunk_idx + 1} | Starting Epoch {epoch}/{settings.training.epochs} ---")
            trainer.train_chunk(settings.data.download_dir, epoch)
            trainer.save_checkpoint("latest_model.pth")
            
        s3_manager.purge_chunk()
    trainer.shutdown() 
    logger.info("🔥 Config-Driven Multi-Month Training Complete!")
            
if __name__ == "__main__":
    main()