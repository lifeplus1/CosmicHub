# Multi-stage build for optimized production image

# Build stage
FROM python:3.13-slim as builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies to user directory
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.13-slim as production

# Set working directory
WORKDIR /app

# Create non-root user first
RUN useradd --create-home --shell /bin/bash app

# Copy installed packages from builder stage
COPY --from=builder /root/.local /home/app/.local

# Update PATH to include user packages
ENV PATH=/home/app/.local/bin:$PATH

# Copy application code and change ownership
COPY --chown=app:app . .

# Copy ephemeris files and change ownership
COPY --chown=app:app ephe /app/ephe

# Set environment variables
ENV PORT=8000
ENV EPHE_PATH=/app/ephe
ENV PYTHONPATH=/app/backend
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV LOG_FILE=/app/logs/app.log

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && chown -R app:app /app/logs && \
    touch /app/app.log && chown app:app /app/app.log

# Switch to non-root user
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health', timeout=10)" || exit 1

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]