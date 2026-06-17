import torch
import torch.nn as nn

from src.model.laplacian import LapLoss


class CharbonnierLoss(nn.Module):
    """Computes the robust Charbonnier penalty function for flow and image alignment."""
    def __init__(self, eps: float = 1e-6):
        super(CharbonnierLoss, self).__init__()
        self.eps = eps

    def forward(self, pred: torch.Tensor, gt: torch.Tensor) -> torch.Tensor:
        """
        Args:
            pred: Predicted physical tensor [B, C, H, W].
            gt: Ground truth physical tensor [B, C, H, W].
        Returns:
            Computed scalar loss.
        """
        return torch.mean(torch.sqrt((pred - gt) ** 2 + self.eps ** 2))

class CompositeLoss(nn.Module):
    """Calculates a combined loss of Charbonnier and Laplacian constraints.
    
    Essential for ensuring non-rigid physical cloud formations adhere to 
    structural boundaries across scale pyramids.
    """
    def __init__(self, lap_weight: float = 0.5, channels: int = 1):
        super(CompositeLoss, self).__init__()
        self.charbonnier = CharbonnierLoss()
        self.laplacian = LapLoss(channels=channels)
        self.lap_weight = lap_weight
        
    def forward(self, pred: torch.Tensor, gt: torch.Tensor) -> torch.Tensor:
        loss_char = self.charbonnier(pred, gt)
        loss_lap = self.laplacian(pred, gt).mean()
        return loss_char + (self.lap_weight * loss_lap)
