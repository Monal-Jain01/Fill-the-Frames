import torch

from src.model.ifnet import IFNet
from src.model.loss import CompositeLoss

def test_ifnet_forward():
    model = IFNet()
    imgs = torch.zeros((1, 2, 256, 256))
    scale_list = [4, 2, 1]

    flow, mask, merged, flow_tea, merged_tea, loss_distill = model(imgs, scale_list)
    assert len(merged) == 3
    assert merged[2].shape == (1, 1, 256, 256)

def test_composite_loss():
    loss_fn = CompositeLoss()
    pred = torch.ones((1, 1, 256, 256))
    gt = torch.zeros((1, 1, 256, 256))
    
    # 🚨 FIX: Now expecting a tuple (total_loss, loss_dict)
    loss, loss_dict = loss_fn(pred, gt) 
    
    assert loss.item() > 0
    assert "ssim" in loss_dict  # Ensures SSIM is calculating without math errors