#!/usr/bin/env bash
set -euo pipefail

# validate_ai_coord_filenames.sh
# Enforces canonical naming for files under ai-agent-coordination/.
# Allowed agent artifact patterns (basenames):
#   agent-<id>-<slug>-instructions.md
#   agent-<id>-<slug>-analysis.json
#   agent-<id>-<slug>-completion.json
#   coordination-manifest.json (global manifest)
# Any other basename beginning with "agent-" is rejected.
# Non-agent supporting docs (e.g. FILE_NAMING_CONVENTION.md) are ignored.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TARGET_DIR="${REPO_ROOT}/ai-agent-coordination"

MODE="staged" # default
if [[ "${1:-}" == "--all" ]]; then
  MODE="all"
fi

if [[ ! -d "${TARGET_DIR}" ]]; then
  echo "[ai-coord-validate] Directory not found: ${TARGET_DIR}" >&2
  exit 0
fi

if ! command -v git >/dev/null 2>&1; then
  echo "[ai-coord-validate] git not available; skipping (non-blocking)." >&2
  exit 0
fi

collect_files() {
  if [[ "${MODE}" == "all" ]]; then
    (cd "${REPO_ROOT}" && git ls-files 'ai-agent-coordination/*')
  else
    (cd "${REPO_ROOT}" && git diff --cached --name-only --diff-filter=ACM | grep -E '^ai-agent-coordination/' || true)
  fi
}

FILES=$(collect_files)
if [[ -z "${FILES}" ]]; then
  # Nothing relevant staged / present.
  exit 0
fi

STATUS=0
INVALID_LIST=()

while IFS= read -r path; do
  [[ -z "${path}" ]] && continue
  base="$(basename "${path}")"
  # Skip non agent-* basenames except manifest (which is allowed explicitly).
  if [[ "${base}" == "coordination-manifest.json" ]]; then
    continue
  fi
  if [[ ! ${base} == agent-* ]]; then
    # supporting docs or other files ignored
    continue
  fi
  # Enforce lowercase only (after agent- prefix).
  if [[ "${base}" =~ [A-Z] ]]; then
    INVALID_LIST+=("${path} (contains uppercase letters)")
    STATUS=1
    continue
  fi
  if [[ ${base} =~ ^agent-[0-9]+-[a-z0-9-]+-instructions\.md$ ]]; then
    continue
  fi
  if [[ ${base} =~ ^agent-[0-9]+-[a-z0-9-]+-analysis\.json$ ]]; then
    continue
  fi
  if [[ ${base} =~ ^agent-[0-9]+-[a-z0-9-]+-completion\.json$ ]]; then
    continue
  fi
  INVALID_LIST+=("${path}")
  STATUS=1
done <<<"${FILES}"

if [[ ${STATUS} -ne 0 ]]; then
  echo "❌ Invalid AI coordination filenames detected:" >&2
  for f in "${INVALID_LIST[@]}"; do
    echo "  - ${f}" >&2
  done
  echo "\nAllowed patterns (basenames):" >&2
  echo "  agent-<id>-<slug>-instructions.md" >&2
  echo "  agent-<id>-<slug>-analysis.json" >&2
  echo "  agent-<id>-<slug>-completion.json" >&2
  echo "  coordination-manifest.json" >&2
  echo "(Where <id>=integer, <slug>=lowercase a-z0-9 and hyphens)" >&2
  exit 1
fi

exit 0
