from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import upload, metadata, visualization, interpolation, metrics, animation, export, health

app = FastAPI(
    title="Fill the Frames API",
    description="Scientific backend for satellite frame interpolation and visualization",
    version="0.1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router, tags=["Health"])
app.include_router(upload.router, prefix="/api/v1/upload", tags=["Upload"])
app.include_router(metadata.router, prefix="/api/v1/metadata", tags=["Metadata"])
app.include_router(visualization.router, prefix="/api/v1/visualization", tags=["Visualization"])
app.include_router(interpolation.router, prefix="/api/v1/interpolation", tags=["Interpolation"])
app.include_router(metrics.router, prefix="/api/v1/metrics", tags=["Metrics"])
app.include_router(animation.router, prefix="/api/v1/animation", tags=["Animation"])
app.include_router(export.router, prefix="/api/v1/export", tags=["Export"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Fill the Frames API"}
