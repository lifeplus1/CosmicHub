#!/usr/bin/env bash
# run_synthetic.sh - Wrapper to execute synthetic_journey (OBS-003) and append JSON output to log.
# Adds lightweight size-based rotation (single backup) and exit-code tagging.
# Usage: place in cron (see suggested crontab entries below).

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
PYTHON_BIN="${PYTHON_BIN:-python3}"
SYNTH_SCRIPT="${REPO_ROOT}/scripts/observability/synthetic_journey.py"
LOG_DIR="${REPO_ROOT}/logs"
LOG_FILE="${LOG_DIR}/synthetic_journey.log"
MAX_SIZE_BYTES=$((1024*1024)) # 1MB simple rotation threshold

mkdir -p "${LOG_DIR}"

rotate_if_needed() {
  if [[ -f "${LOG_FILE}" ]]; then
    local size
    size=$(stat -f%z "${LOG_FILE}" 2>/dev/null || stat -c%s "${LOG_FILE}" 2>/dev/null || echo 0)
    if [[ ${size} -ge ${MAX_SIZE_BYTES} ]]; then
      mv "${LOG_FILE}" "${LOG_FILE}.1" 2>/dev/null || true
      gzip -f "${LOG_FILE}.1" 2>/dev/null || true
    fi
  fi
}

rotate_if_needed
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
OUTPUT=$(${PYTHON_BIN} "${SYNTH_SCRIPT}" 2>&1 || true)
EC=$?
# If script printed JSON line, keep; else wrap in JSON with error.
if echo "${OUTPUT}" | head -n1 | grep -q '{'; then
  echo "${OUTPUT}" | sed "1s/$/ ,\"exit_code\": ${EC}, \"ts\": \"${TS}\"}/" >> "${LOG_FILE}"
else
  printf '{"timestamp":"%s","overall_ok":false,"exit_code":%d,"error":"%s"}\n' "${TS}" "${EC}" "$(echo "${OUTPUT}" | tr '"' "'" | head -c 500)" >> "${LOG_FILE}"
fi

exit ${EC}
