from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

# Absolute imports
from app.api import (
    animation,
    export,
    health,
    interpolation,
    metadata,
    metrics,
    upload,
    validation,
    visualization,
)
from app.core.config import API_PREFIX, APP_NAME, APP_VERSION, IS_DEBUG
from app.services.inference.model_loader import ModelLoader


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting up the application...")

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
        validation.router,
        prefix=f"{API_PREFIX}/validation",
        tags=["Validation"],
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
        animation.router, prefix=f"{API_PREFIX}/animation", tags=["Animation"]
    )
    fast_app.include_router(
        export.router, prefix=f"{API_PREFIX}/export", tags=["Export"]
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
