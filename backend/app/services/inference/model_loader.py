import os

import onnxruntime as ort
from fastapi import HTTPException
from loguru import logger

from app.core.config import DEFAULT_MODEL_PATH


class ModelLoader:
    _gpu_session = None
    _cpu_session = None
    _gpu_available = False

    @classmethod
    def _detect_gpu(cls) -> bool:
        """Check if CUDA is available for ONNX Runtime."""
        available_providers = ort.get_available_providers()
        has_cuda = "CUDAExecutionProvider" in available_providers
        if has_cuda:
            logger.info("CUDA detected in ONNX Runtime providers.")
        else:
            logger.info("CUDA not available. GPU sessions will fall back to CPU.")
        return has_cuda

    @classmethod
    def load_model(cls, model_path: str = DEFAULT_MODEL_PATH):
        """Load model with GPU session (if available) + CPU session for background tasks."""
        if cls._cpu_session is not None:
            logger.info("AI Model is already loaded in memory.")
            return cls._cpu_session

        if not os.path.exists(model_path):
            logger.error(f"ONNX Model file not found at: {model_path}")
            os.makedirs(os.path.dirname(model_path), exist_ok=True)
            raise HTTPException(
                status_code=500,
                detail="AI Model file missing from the models directory.",
            )

        try:
            logger.info(
                f"Waking up the AI Brain. Loading ONNX model from {model_path}..."
            )

            cls._gpu_available = cls._detect_gpu()

            # Always create a CPU session (used for background animation tasks)
            cpu_opts = ort.SessionOptions()
            cpu_opts.intra_op_num_threads = 2
            cpu_opts.inter_op_num_threads = 1
            cpu_opts.graph_optimization_level = (
                ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            )
            cls._cpu_session = ort.InferenceSession(
                model_path, cpu_opts, providers=["CPUExecutionProvider"]
            )
            logger.success("CPU ONNX session loaded.")

            # Optionally create a GPU session for manual user requests
            if cls._gpu_available:
                try:
                    gpu_opts = ort.SessionOptions()
                    gpu_opts.graph_optimization_level = (
                        ort.GraphOptimizationLevel.ORT_ENABLE_ALL
                    )
                    cls._gpu_session = ort.InferenceSession(
                        model_path,
                        gpu_opts,
                        providers=["CUDAExecutionProvider", "CPUExecutionProvider"],
                    )
                    logger.success("GPU ONNX session loaded (CUDA + CPU fallback).")
                except Exception as e:
                    logger.warning(
                        f"Failed to create GPU session, will use CPU only: {e}"
                    )
                    cls._gpu_session = None
                    cls._gpu_available = False

            return cls._cpu_session

        except Exception as e:
            logger.error(f"Failed to load ONNX model: {str(e)}")
            raise HTTPException(
                status_code=500, detail="Failed to initialize AI model engine."
            )

    @classmethod
    def get_session(cls, force_cpu: bool = False):
        """Get an ONNX session.

        Args:
            force_cpu: If True, always return CPU session (for background animation tasks).
                       If False, try GPU first, fall back to CPU.
        """
        if cls._cpu_session is None:
            raise HTTPException(
                status_code=503, detail="AI Model not loaded into memory."
            )

        if force_cpu:
            return cls._cpu_session

        # For manual user requests: prefer GPU, fall back to CPU
        if cls._gpu_session is not None:
            return cls._gpu_session
        return cls._cpu_session

    @classmethod
    def unload_model(cls):
        if cls._cpu_session is not None:
            cls._cpu_session = None
        if cls._gpu_session is not None:
            cls._gpu_session = None
        cls._gpu_available = False
        logger.info("AI Model sessions unloaded. RAM freed.")
