#!/bin/bash
# mypy-check.sh - Run mypy with backup file exclusions
# Usage: ./scripts/mypy-check.sh [additional mypy arguments]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# Run mypy with backup file exclusions
exec mypy \
  --config-file backend/mypy.ini \
  --exclude '.*_backup\.py$' \
  --exclude '.*\.backup\.py$' \
  --exclude '.*_temp\.py$' \
  --exclude '.*\.temp\.py$' \
  --exclude '.*_old\.py$' \
  --exclude '.*\.old\.py$' \
  --exclude '.*_deprecated\.py$' \
  --exclude '.*\.deprecated\.py$' \
  --exclude 'tcm_type_bridge_backup\.py$' \
  --ignore-missing-imports \
  backend/ \
  "$@"
