FROM python:3.12.4

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    make \
    libssl-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy necessary files
COPY requirements.txt .
COPY backend/ ./backend/
COPY main.py .
COPY cities.json .
COPY ephe/ ./ephe/

# Install dependencies with verbose output
RUN pip install --no-cache-dir -r requirements.txt -v

EXPOSE $PORT

CMD uvicorn main:app --host 0.0.0.0 --port $PORT --timeout-keep-alive 120