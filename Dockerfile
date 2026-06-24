# Use the official Python image
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /code

RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Create the temporary storage directory for serverless 1GB caching
RUN mkdir -p /tmp/satellite_cache && chmod 777 /tmp/satellite_cache

# We only copy the backend folder to avoid bloating the server with frontend code
COPY backend /code

# Install dependencies directly from pyproject.toml
RUN pip install --no-cache-dir .

# Expose port 7860 (Hugging Face standard)
EXPOSE 7860

# Run the FastAPI server. 
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
