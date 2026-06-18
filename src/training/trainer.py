import os
import torch
import logging
import threading
import queue
from torch.utils.data import DataLoader
from torch.optim import AdamW
from torch.utils.tensorboard import SummaryWriter
from src.config.settings import Settings
from src.model.ifnet import IFNet
from src.model.loss import CompositeLoss
from src.data.dataset import SatelliteTripletDataset

logger = logging.getLogger(__name__)

class AsyncCheckpointSaver:
    """Background worker thread to save PyTorch models without blocking the GPU."""
    def __init__(self):
        self.save_queue = queue.Queue()
        self.worker = threading.Thread(target=self._save_loop, daemon=True)
        self.worker.start()
        logger.info("🚀 Async Checkpoint Worker started in background!")

    def _save_loop(self):
        while True:
            item = self.save_queue.get()
            if item is None:  # Poison pill to stop the thread
                break
            
            state_dict, path = item
            try:
                torch.save(state_dict, path)
                logger.info(f"💾 Background Save Complete: {path}")
            except Exception as e:
                logger.error(f"❌ Async Save failed: {e}")
            finally:
                self.save_queue.task_done()

    def save(self, model, path):
        # 1. State dict ko CPU par laao aur clone karo (Isme microseconds lagte hain)
        cpu_state_dict = {k: v.cpu().clone() for k, v in model.state_dict().items()}
        
        # 2. CPU dict ko queue mein daal do. Main thread free!
        self.save_queue.put((cpu_state_dict, path))
        logger.info(f"📥 Model state pushed to async queue for: {path}")

    def shutdown(self):
        logger.info("⏳ Waiting for pending async saves to complete...")
        self.save_queue.put(None)
        self.worker.join()
        logger.info("✅ Async Checkpoint Worker shut down.")


class Trainer:
    """Handles the PyTorch training loop, optimization, and checkpointing."""
    
    def __init__(self, settings: Settings, model: IFNet, device: torch.device):
        self.settings = settings
        self.device = device
        self.model = model.to(device)
        self.optimizer = AdamW(self.model.parameters(), lr=settings.training.learning_rate, weight_decay=settings.training.weight_decay)
        self.criterion = CompositeLoss()
        self.scaler = torch.amp.GradScaler(
            enabled=self.device.type == "cuda"
        )
        self.writer = SummaryWriter(log_dir=os.path.join(settings.training.checkpoints_dir, 'logs'))
        os.makedirs(settings.training.checkpoints_dir, exist_ok=True)
        self.global_step = 0
        
        # 🚨 Initialize Async Saver Here
        self.async_saver = AsyncCheckpointSaver()
        
    def train_chunk(self, data_dir: str, epoch: int) -> None:
        """Trains the model for one epoch on the current data chunk."""
        dataset = SatelliteTripletDataset(data_dir=data_dir, augment=True)
        if len(dataset) == 0:
            logger.warning(f"No data found in {data_dir}. Skipping training chunk.")
            return
            
        dataloader = DataLoader(
            dataset,
            batch_size=self.settings.training.batch_size,
            shuffle=True,
            num_workers=self.settings.training.num_workers,
            pin_memory=True,
            persistent_workers=True
        )
        
        self.model.train()
        for batch_idx, (img0, img1, gt) in enumerate(dataloader):
            img0, img1, gt = img0.to(self.device), img1.to(self.device), gt.to(self.device)
            imgs = torch.cat((img0, img1), dim=1)
            
            self.optimizer.zero_grad()

            # 🚨 SOTA: Mixed Precision Autocast (Single Forward Pass)
            with torch.amp.autocast(device_type=self.device.type):
                flow_list, mask, merged, flow_tea, merged_tea, loss_distill = self.model(
                    torch.cat((imgs, gt), 1), scale=[4, 2, 1]
                )
                
                loss_student = 0
                for m in merged:
                    l_total, _ = self.criterion(m, gt)
                    loss_student += l_total
                
                # Fixed tuple unpacking for teacher loss
                if merged_tea is not None:
                    loss_teacher, _ = self.criterion(merged_tea, gt)
                else:
                    loss_teacher = 0
                
                loss = loss_student + loss_teacher + (loss_distill * 0.01)

            # 🚨 SOTA: Single Backward Pass
            self.scaler.scale(loss).backward()
            self.scaler.step(self.optimizer)
            self.scaler.update()
            
            if batch_idx % 10 == 0:
                logger.info(f"Epoch {epoch} | Batch {batch_idx}/{len(dataloader)} | Loss: {loss.item():.4f}")
                self.writer.add_scalar('Loss/train', loss.item(), self.global_step)
                
            self.global_step += 1
    def save_checkpoint(self, filename: str = "latest_model.pth") -> None:
        path = os.path.join(self.settings.training.checkpoints_dir, filename)
        # 🚨 Use async saver instead of torch.save directly
        self.async_saver.save(self.model, path)

    def shutdown(self):
        """Called at the very end of training to ensure the last save finishes."""
        self.async_saver.shutdown()