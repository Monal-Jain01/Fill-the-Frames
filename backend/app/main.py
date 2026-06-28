import asyncio
import os
import time
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

# Absolute imports
from app.api import (
    export,
    health,
    interpolation,
    metadata,
    metrics,
    upload,
    visualization,
    animation,
)
from app.core.config import (
    API_PREFIX,
    APP_NAME,
    APP_VERSION,
    IS_DEBUG,
    TEMP_STORAGE_DIR,
)
from app.services.inference.model_loader import ModelLoader
from app.services.scheduler.scheduler import AnimationScheduler

scheduler_instance = AnimationScheduler()


async def cleanup_temp_storage():
    """Background task to delete files older than 1 hour from TEMP_STORAGE_DIR to prevent disk OOM."""
    while True:
        try:
            logger.info("Running garbage collection on TEMP_STORAGE_DIR...")
            tmp_dir = Path(TEMP_STORAGE_DIR)
            if tmp_dir.exists():
                current_time = time.time()
                deleted_files = 0
                for item in tmp_dir.rglob("*"):
                    if item.is_file():
                        file_age = current_time - item.stat().st_mtime
                        if file_age > 3600:  # 1 hour
                            try:
                                item.unlink()
                                deleted_files += 1
                            except Exception as e:
                                logger.error(f"Failed to delete {item}: {e}")

                # Cleanup empty directories
                for item in tmp_dir.rglob("*"):
                    if item.is_dir() and not any(item.iterdir()):
                        try:
                            item.rmdir()
                        except Exception:
                            pass

                if deleted_files > 0:
                    logger.success(
                        f"Garbage collection cleared {deleted_files} old files."
                    )
        except Exception as e:
            logger.error(f"Garbage collection failed: {e}")

        await asyncio.sleep(1800)  # Run every 30 minutes


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting up the application...")

    # Start garbage collector
    cleanup_task = asyncio.create_task(cleanup_temp_storage())

    # Start Animation Scheduler
    scheduler_task = asyncio.create_task(scheduler_instance.start())

    # 1. Server chalu hote hi Model RAM me load karo
    try:
        model_session = ModelLoader.load_model()
        # 2. Global app state me daal do taaki routes isko access kar sakein
        app.state.model = model_session
        logger.success("Satellite ONNX Model successfully loaded into app state.")
    except Exception as e:
        logger.error(
            f"AI Model startup failed. Server will run, but interpolation won't work. Error: {e}"
        )
        app.state.model = None

    yield  # Yahan par server requests listen karta rahega

    logger.info("🛑 Shutting down the application...")

    # 3. Server band hote hi RAM clear karo
    ModelLoader.unload_model()
    app.state.model = None
    logger.info("Model unloaded from app state.")


def get_app() -> FastAPI:
    # App initialization me saari config pass kar di
    fast_app = FastAPI(
        title=APP_NAME,
        description="Satellite Image Interpolation Engine",
        version=APP_VERSION,
        debug=IS_DEBUG,
        lifespan=lifespan,
    )

    # CORS configuration
    fast_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Production me isko frontend URL se replace karenge
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # API_PREFIX ka use karke URLs clean kar diye
    fast_app.include_router(
        health.router, tags=["Health"]
    )  # Health check root pe hi theek hai
    fast_app.include_router(
        upload.router, prefix=f"{API_PREFIX}/upload", tags=["Upload"]
    )
    fast_app.include_router(
        metadata.router, prefix=f"{API_PREFIX}/metadata", tags=["Metadata"]
    )
    fast_app.include_router(
        visualization.router,
        prefix=f"{API_PREFIX}/visualization",
        tags=["Visualization"],
    )
    fast_app.include_router(
        interpolation.router,
        prefix=f"{API_PREFIX}/interpolation",
        tags=["Interpolation"],
    )
    fast_app.include_router(
        metrics.router, prefix=f"{API_PREFIX}/metrics", tags=["Metrics"]
    )
    fast_app.include_router(
        export.router, prefix=f"{API_PREFIX}/export", tags=["Export"]
    )
    fast_app.include_router(
        animation.router, prefix=f"{API_PREFIX}/animation", tags=["Animation"]
    )

    return fast_app


# App instance create karna
app = get_app()


@app.get("/", tags=["Root"])
def read_root():
    return {
        "app": APP_NAME,
        "version": APP_VERSION,
        "status": "Online",
        "message": "Welcome to Fill the Frames API",
    }
