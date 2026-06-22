from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseDatasetParser(ABC):
    @abstractmethod
    def load_dataset(self, file_path: str):
        pass
        
    @abstractmethod
    def extract_metadata(self) -> Dict[str, Any]:
        pass
