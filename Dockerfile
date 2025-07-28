FROM python:3.12.4-slim

# Install build dependencies for pyswisseph
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libssl-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy only necessary files
COPY requirements.txt .
COPY main.py .
COPY cities.json .
COPY ephe/ ./ephe/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE $PORT

# Run Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "$PORT", "--timeout-keep-alive", "120"]