FROM python:3.12.4-slim

# Install system dependencies for pyswisseph and other libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    make \
    libssl-dev \
    libffi-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy application files
COPY requirements.txt .
COPY backend/ ./backend/
COPY main.py .
COPY cities.json .
COPY ephe/ ./ephe/

# Install dependencies
RUN echo "Starting dependency installation..." && \
    pip3 cache purge && \
    echo "Installing pyswisseph==2.10.3.2..." && \
    pip3 install --no-cache-dir --force-reinstall --no-binary pyswisseph pyswisseph==2.10.3.2 -v && \
    echo "Verifying swisseph import..." && \
    python3 -c "import swisseph; print('swisseph version: ' + str(swisseph.__version__))" && \
    echo "Installing requirements.txt..." && \
    pip3 install --no-cache-dir -r requirements.txt -v && \
    echo "Dependency installation complete."

# Set permissions (less permissive than 777)
RUN chown -R nobody:nogroup /app && chmod -R 755 /app

# Environment variables
ENV LOG_FILE=/app/app.log
ENV PORT=8000
ENV EPHE_PATH=/app/ephe

# Expose port
EXPOSE 8000

# Run Uvicorn with .env file loaded
CMD ["/bin/sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT --timeout-keep-alive 120"]