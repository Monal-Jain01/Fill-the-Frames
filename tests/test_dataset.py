import torch
import pytest
from src.data.transforms import augment_triplet
from src.data.dataset import GOESTripletDataset

def test_dataset(tmp_path):
    # Setup mock data
    tensor_data = torch.zeros((3, 1, 512, 512))
    torch.save(tensor_data, tmp_path / "triplet_001.pt")
    
    dataset = GOESTripletDataset(str(tmp_path), augment=False)
    assert len(dataset) == 1
    
    img0, img1, gt = dataset[0]
    assert img0.shape == (1, 512, 512)
    assert gt.shape == (1, 512, 512)

def test_augment_triplet():
    img0 = torch.zeros((1, 512, 512))
    img1 = torch.zeros((1, 512, 512))
    gt = torch.zeros((1, 512, 512))
    
    a_img0, a_img1, a_gt = augment_triplet(img0, img1, gt, crop_size=256)
    assert a_img0.shape == (1, 256, 256)
