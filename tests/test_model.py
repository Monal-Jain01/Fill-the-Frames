import torch

from src.model.ifnet import IFNet
from src.model.loss import CompositeLoss


def test_ifnet_forward():
    model = IFNet()
    # Mock TIR input [B, 2, H, W] since it's torch.cat((img0, img1), 1)
    imgs = torch.zeros((1, 2, 256, 256))
    scale_list = [4, 2, 1]

    flow, mask, merged, flow_tea, merged_tea, loss_distill = model(imgs, scale_list)
    assert len(merged) == 3
    assert merged[2].shape == (1, 1, 256, 256)


def test_composite_loss():
    loss_fn = CompositeLoss()
    pred = torch.ones((1, 1, 256, 256))
    gt = torch.zeros((1, 1, 256, 256))
    loss = loss_fn(pred, gt)
    assert loss.item() > 0
