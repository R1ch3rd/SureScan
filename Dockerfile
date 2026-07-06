# SureScan API — Hugging Face Space (Docker runtime, CPU)
FROM python:3.11-slim

# opencv (pulled in by ultralytics) needs these at runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements-space.txt .
RUN pip install --no-cache-dir -r requirements-space.txt

COPY api.py chat.py ./
COPY yolov11_finetuned.pt brain_tumor_model.pth_epoch20.pth ./
COPY xgb_model.pkl encoders.pkl scaler.pkl ./

# writable caches for HF Spaces' non-root user
ENV HOME=/tmp \
    ULTRALYTICS_CONFIG_DIR=/tmp/ultralytics \
    TORCH_HOME=/tmp/torch \
    ANONYMIZED_TELEMETRY=False

EXPOSE 7860
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "7860"]
