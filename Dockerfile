FROM python:3.12.4-slim

# Install build dependencies for pyswisseph
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libssl-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only necessary files
COPY requirements.txt .
COPY backend/ ./backend/
COPY main.py .
COPY cities.json .
COPY ephe/ ./ephe/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE $PORT

# Use shell to expand $PORT
CMD uvicorn main:app --host 0.0.0.0 --port $PORT --timeout-keep-alive 120