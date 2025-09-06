#!/bin/bash
# Salt rotation wrapper script
# This script runs the Python salt rotation script with proper environment setup

set -e

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Change to the project root directory
cd "$PROJECT_ROOT"

# Ensure backend directory is accessible
if [ ! -d "backend" ]; then
    echo "Error: backend directory not found. Are you in the correct project directory?"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Set Python path to include backend directory
export PYTHONPATH="$PROJECT_ROOT/backend:$PYTHONPATH"

# Source environment variables if .env file exists
if [ -f "backend/.env" ]; then
    echo "Loading environment from backend/.env"
    set -o allexport
    source backend/.env
    set +o allexport
fi

# Run the Python script with all passed arguments
echo "Running salt rotation script..."
echo "Project root: $PROJECT_ROOT"
echo "Arguments: $*"
echo "---"

python3 "$SCRIPT_DIR/rotate_salts.py" "$@"

# Check exit code
EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
    echo "---"
    echo "Salt rotation script completed successfully"
else
    echo "---"
    echo "Salt rotation script failed with exit code: $EXIT_CODE"
fi

exit $EXIT_CODE
