FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV and PDF rendering
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install python packages
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy python service source files
COPY . ./

EXPOSE 8000

CMD ["python", "ocr_service.py"]
