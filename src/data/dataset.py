import os

import torch
from torch.utils.data import Dataset

from src.data.transforms import augment_triplet


class GOESTripletDataset(Dataset):
    """PyTorch Dataset for loading pre-processed Satellite TIR triplets.

    Expects data to be stored as `.pt` files containing tensors of shape [3, 1, H, W],
    representing Past, Present, and Future Brightness Temperature frames.
    """

    def __init__(self, data_dir: str, augment: bool = True):
        self.data_dir = data_dir
        self.augment = augment
        self.triplet_files = sorted(
            [f for f in os.listdir(data_dir) if f.endswith(".pt")]
        )

    def __len__(self) -> int:
        return len(self.triplet_files)

    def __getitem__(self, idx: int) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        file_path = os.path.join(self.data_dir, self.triplet_files[idx])
        triplet = torch.load(file_path)  # [3, 1, H, W]

        img0 = triplet[0]  # Past
        gt = triplet[1]  # Ground Truth / Present
        img1 = triplet[2]  # Future

        if self.augment:
            img0, img1, gt = augment_triplet(img0, img1, gt)

        return img0, img1, gt
