import torch
import math
import torch.nn as nn
import torch.nn.functional as F
from src.model.laplacian import LapLoss

class CharbonnierLoss(nn.Module):
    def __init__(self, eps: float = 1e-6):
        super(CharbonnierLoss, self).__init__()
        self.eps = eps

    def forward(self, pred: torch.Tensor, gt: torch.Tensor) -> torch.Tensor:
        return torch.mean(torch.sqrt((pred - gt) ** 2 + self.eps ** 2))

class SSIMLoss(nn.Module):
    """Differentiable SSIM for PyTorch training to preserve cloud structures."""
    def __init__(self, window_size: int = 11, size_average: bool = True):
        super(SSIMLoss, self).__init__()
        self.window_size = window_size
        self.size_average = size_average
        self.channel = 1
        self.window = self.create_window(window_size, self.channel)

    def gaussian(self, window_size, sigma):
        gauss = torch.Tensor([math.exp(-(x - window_size//2)**2/float(2*sigma**2)) for x in range(window_size)])
        return gauss/gauss.sum()

    def create_window(self, window_size, channel):
        import math
        _1D_window = self.gaussian(window_size, 1.5).unsqueeze(1)
        _2D_window = _1D_window.mm(_1D_window.t()).float().unsqueeze(0).unsqueeze(0)
        window = _2D_window.expand(channel, 1, window_size, window_size).contiguous()
        return window

    def forward(self, img1, img2):
        # A simple SSIM computation
        device = img1.device
        window = self.window.to(device)
        mu1 = F.conv2d(img1, window, padding=self.window_size//2, groups=self.channel)
        mu2 = F.conv2d(img2, window, padding=self.window_size//2, groups=self.channel)

        mu1_sq = mu1.pow(2)
        mu2_sq = mu2.pow(2)
        mu1_mu2 = mu1 * mu2

        sigma1_sq = F.conv2d(img1*img1, window, padding=self.window_size//2, groups=self.channel) - mu1_sq
        sigma2_sq = F.conv2d(img2*img2, window, padding=self.window_size//2, groups=self.channel) - mu2_sq
        sigma12 = F.conv2d(img1*img2, window, padding=self.window_size//2, groups=self.channel) - mu1_mu2

        C1 = 0.01**2
        C2 = 0.03**2

        ssim_map = ((2 * mu1_mu2 + C1) * (2 * sigma12 + C2)) / ((mu1_sq + mu2_sq + C1) * (sigma1_sq + sigma2_sq + C2))
        
        if self.size_average:
            return 1 - ssim_map.mean() # Return 1 - SSIM to minimize it as a loss
        else:
            return 1 - ssim_map.mean(1).mean(1).mean(1)

class CompositeLoss(nn.Module):
    """
    SOTA Loss Strategy for Meteorological Data:
    L = (alpha * Charbonnier) + (beta * SSIM) + (gamma * Distillation/Laplacian)
    """
    def __init__(self, alpha: float = 1.0, beta: float = 0.5, gamma: float = 0.5, channels: int = 1):
        super(CompositeLoss, self).__init__()
        self.charbonnier = CharbonnierLoss()
        self.ssim_loss = SSIMLoss()
        self.laplacian = LapLoss(channels=channels) # Acting as our structural distillation/refinement
        
        self.alpha = alpha
        self.beta = beta
        self.gamma = gamma
        
    def forward(self, pred: torch.Tensor, gt: torch.Tensor) -> tuple[torch.Tensor, dict]:
        loss_char = self.charbonnier(pred, gt)
        loss_ssim = self.ssim_loss(pred, gt)
        loss_lap = self.laplacian(pred, gt).mean()
        
        # Total Equation
        total_loss = (self.alpha * loss_char) + (self.beta * loss_ssim) + (self.gamma * loss_lap)
        
        # Returning dictionary of individual losses for easy logging in your training loop
        loss_dict = {
            "total": total_loss,
            "charbonnier": loss_char.item(),
            "ssim": loss_ssim.item(),
            "laplacian": loss_lap.item()
        }
        return total_loss, loss_dict