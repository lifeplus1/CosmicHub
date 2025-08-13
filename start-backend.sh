#!/bin/bash

# Backend startup script with proper environment configuration
set -e

# Navigate to the project root
cd "$(dirname "$0")"

# Load environment variables from .env file (only the valid ones)
export ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000"
export API_KEY="dev-placeholder-key"
export DATABASE_URL="postgresql://user:pass@localhost:5432/cosmichub_dev"
export REDIS_URL="redis://localhost:6379"
export SMTP_HOST="localhost"
export SMTP_PORT="1025"
export NODE_ENV="development"
export LOG_LEVEL="debug"
export LOG_FORMAT="plain"

# Change to backend directory
cd backend

echo "🚀 Starting CosmicHub Backend..."
echo "📍 CORS Origins: $ALLOWED_ORIGINS"

# Start the backend with the virtual environment Python
/Users/Chris/Projects/CosmicHub/.venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
