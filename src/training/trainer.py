import os
import torch
import logging
from torch.utils.data import DataLoader
from torch.optim import AdamW
from torch.utils.tensorboard import SummaryWriter
from src.config.settings import Settings
from src.model.ifnet import IFNet
from src.model.loss import CompositeLoss
from src.data.dataset import GOESTripletDataset

logger = logging.getLogger(__name__)

class Trainer:
    """Handles the PyTorch training loop, optimization, and checkpointing."""
    
    def __init__(self, settings: Settings, model: IFNet, device: torch.device):
        self.settings = settings
        self.device = device
        self.model = model.to(device)
        self.optimizer = AdamW(self.model.parameters(), lr=settings.training.learning_rate, weight_decay=1e-3)
        self.criterion = CompositeLoss()
        
        self.writer = SummaryWriter(log_dir=os.path.join(settings.training.checkpoints_dir, 'logs'))
        os.makedirs(settings.training.checkpoints_dir, exist_ok=True)
        self.global_step = 0
        
    def train_chunk(self, data_dir: str, epoch: int) -> None:
        """Trains the model for one epoch on the current data chunk.
        
        Args:
            data_dir: Path to directory containing .pt files.
            epoch: Current global epoch number.
        """
        dataset = GOESTripletDataset(data_dir=data_dir, augment=True)
        if len(dataset) == 0:
            logger.warning(f"No data found in {data_dir}. Skipping training chunk.")
            return
            
        dataloader = DataLoader(dataset, batch_size=self.settings.training.batch_size, shuffle=True, num_workers=2)
        
        self.model.train()
        for batch_idx, (img0, img1, gt) in enumerate(dataloader):
            img0, img1, gt = img0.to(self.device), img1.to(self.device), gt.to(self.device)
            imgs = torch.cat((img0, img1), dim=1)
            
            self.optimizer.zero_grad()
            
            # Predict
            flow_list, mask, merged, flow_tea, merged_tea, loss_distill = self.model(
                torch.cat((imgs, gt), 1), scale=[4, 2, 1]
            )
            loss_student = sum(self.criterion(m, gt) for m in merged)
            
            loss_teacher = self.criterion(merged_tea, gt) if merged_tea is not None else 0
            
            loss = loss_student + loss_teacher + (loss_distill * 0.01)
            
            loss.backward()
            self.optimizer.step()
            if batch_idx % 10 == 0:
                logger.info(f"Epoch {epoch} | Batch {batch_idx}/{len(dataloader)} | Loss: {loss.item():.4f}")
                self.writer.add_scalar('Loss/train', loss.item(), self.global_step)
                
            self.global_step += 1
            
    def save_checkpoint(self, filename: str = "latest.pth") -> None:
        path = os.path.join(self.settings.training.checkpoints_dir, filename)
        torch.save(self.model.state_dict(), path)
        logger.info(f"Checkpoint saved to {path}")
