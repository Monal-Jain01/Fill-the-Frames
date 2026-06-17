import random

import torch
import torchvision.transforms.functional as TF


def augment_triplet(img0: torch.Tensor, img1: torch.Tensor, gt: torch.Tensor, crop_size: int = 256) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
    """Applies identical spatial augmentations to all three frames in a triplet.
    
    Ensures that the cloud motions remain physically consistent across the temporal sequence.
    
    Args:
        img0: Past frame tensor [C, H, W]
        img1: Future frame tensor [C, H, W]
        gt: Ground truth intermediate frame tensor [C, H, W]
        crop_size: Final output dimension for height and width.
        
    Returns:
        Tuple of augmented tensors (img0, img1, gt).
    """
    _, h, w = img0.shape
    
    # Random Spatial Cropping
    top = random.randint(0, h - crop_size)
    left = random.randint(0, w - crop_size)
    
    img0 = TF.crop(img0, top, left, crop_size, crop_size)
    img1 = TF.crop(img1, top, left, crop_size, crop_size)
    gt = TF.crop(gt, top, left, crop_size, crop_size)
    
    # Random Horizontal Flip
    if random.random() > 0.5:
        img0 = TF.hflip(img0)
        img1 = TF.hflip(img1)
        gt = TF.hflip(gt)
        
    # Random Vertical Flip
    if random.random() > 0.5:
        img0 = TF.vflip(img0)
        img1 = TF.vflip(img1)
        gt = TF.vflip(gt)
        
    # Random Dihedral Transformations
    angles = [0, 90, 180, 270]
    angle = random.choice(angles)
    if angle > 0:
        img0 = TF.rotate(img0, angle)
        img1 = TF.rotate(img1, angle)
        gt = TF.rotate(gt, angle)
        
    return img0, img1, gt
