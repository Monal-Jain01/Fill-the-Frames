import logging
from abc import ABC, abstractmethod
import torch

logger = logging.getLogger(__name__)

class SatelliteFetcher(ABC):
    """
    Abstract base class for all satellite data fetchers (GOES, Himawari, INSAT, etc.).
    Enforces a strict interface for fetching and standardizing physical meteorological data.
    """

    def __init__(self, bucket_name: str):
        """
        Initializes the fetcher with the specific AWS or local bucket/source.
        
        Args:
            bucket_name (str): The name of the data repository/bucket.
        """
        self.bucket_name = bucket_name

    @abstractmethod
    def fetch_chunk(self, chunk_prefix: str, output_dir: str) -> list[str]:
        """
        Downloads a chunk of raw satellite files from the source to a local directory.

        Args:
            chunk_prefix (str): The path/prefix for the specific time chunk.
            output_dir (str): Local temporary directory to save the raw files.

        Returns:
            list[str]: A list of local file paths that were downloaded.
        """
        pass
    
    @abstractmethod
    def fetch_single_file(self,exact_key: str,output_dir: str) -> str:
        """
        Downloads one exact satellite file.
        Used for debugging/visual inspection.
        """
        pass


    @abstractmethod
    def apply_planck_function(self, raw_data_path: str) -> torch.Tensor:
        """
        Reads the raw satellite file, applies the satellite-specific inverse 
        Planck function, and returns a physical Brightness Temperature tensor in Kelvin.

        Args:
            raw_data_path (str): The local path to the downloaded raw file (.nc, .h5, etc.).

        Returns:
            torch.Tensor: The calculated Brightness Temperature in Kelvin.
        """
        pass