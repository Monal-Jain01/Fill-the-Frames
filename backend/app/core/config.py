from starlette.config import Config
from starlette.datastructures import Secret

# Root directory se .env load karega
config = Config(".env")

APP_VERSION = "0.0.1"
APP_NAME = "Fill-the-Frames"
API_PREFIX = config("API_PREFIX", cast=str, default="/api/v1")

API_KEY: Secret = config("API_KEY", cast=Secret, default="dev_secret_key")
IS_DEBUG: bool = config("IS_DEBUG", cast=bool, default=True)

# 🚨 NAYA: Hugging Face Configurations
HF_TOKEN: str = config("HF_TOKEN", cast=str, default="")
HF_BUCKET_ID: str = config("HF_BUCKET_ID", cast=str, default="YourUsername/satellite-data-bucket")

# 🚨 NAYA: Serverless Temp Storage instead of UPLOAD_DIR
TEMP_STORAGE_DIR: str = config("TEMP_STORAGE_DIR", cast=str, default="/tmp/satellite_cache")

MODEL_DIR: str = config("MODEL_DIR", cast=str, default="models")
DEFAULT_MODEL_PATH: str = config("DEFAULT_MODEL_PATH", cast=str, default="models/2month_model.onnx")
