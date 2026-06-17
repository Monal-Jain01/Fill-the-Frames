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
    
    logger.info("Starting Satellite Interpolation Pipeline...")
    
    s3_manager = S3Manager(settings)
    model = IFNet()
    trainer = Trainer(settings, model, device)
    
    # Train-and-Purge Chunking Loop (Mock Example)
    chunks = ["chunk1_prefix", "chunk2_prefix"]
    
    for epoch in range(settings.training.epochs):
        logger.info(f"--- Starting Epoch {epoch} ---")
        for chunk in chunks:
            # 1. Download and Process
            s3_manager.download_chunk(chunk)
            
            # 2. Train on Chunk
            trainer.train_chunk(settings.data.download_dir, epoch)
            
            # 3. Checkpoint
            trainer.save_checkpoint(f"epoch_{epoch}_latest.pth")
            
            # 4. Purge local data to save space
            s3_manager.purge_chunk()
            
    logger.info("Training complete.")

if __name__ == "__main__":
    main()
