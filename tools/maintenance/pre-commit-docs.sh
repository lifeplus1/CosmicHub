#!/usr/bin/env bash
set -euo pipefail

# Lightweight documentation freshness + lint helper for pre-commit.
# Runs only if staged Markdown files (including docs/) are present.

if ! command -v git >/dev/null 2>&1; then
  echo "[pre-commit-docs] git not available; skipping" >&2
  exit 0
fi

CHANGED_MD=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.md$' || true)

if [ -z "${CHANGED_MD}" ]; then
  # No markdown changes staged; nothing to do.
  exit 0
fi

echo "[pre-commit-docs] Processing Markdown changes..."

# Attempt to apply frontmatter / freshness updates (non-fatal if python missing)
if command -v python3 >/dev/null 2>&1; then
  if [ -f scripts/doc_freshness.py ]; then
    echo "[pre-commit-docs] Running freshness --apply"
    python3 scripts/doc_freshness.py --apply || echo "[pre-commit-docs] freshness apply encountered an issue (non-blocking)."
  fi
elif command -v python >/dev/null 2>&1; then
  if [ -f scripts/doc_freshness.py ]; then
    echo "[pre-commit-docs] Running freshness --apply (python)"
    python scripts/doc_freshness.py --apply || echo "[pre-commit-docs] freshness apply encountered an issue (non-blocking)."
  fi
else
  echo "[pre-commit-docs] Python not found; skipping freshness apply." >&2
fi

# Re-stage any markdown files auto-updated.
git add $(git ls-files -m '*.md' 2>/dev/null || true) || true

# Run markdownlint only on the changed markdown files for speed.
if command -v pnpm >/dev/null 2>&1; then
  echo "[pre-commit-docs] Running markdownlint on changed files..."
  # Use npx-style invocation via pnpm dlx if markdownlint-cli2 not installed globally.
  pnpm exec markdownlint-cli2 ${CHANGED_MD} -c .markdownlint.json --ignore node_modules/** || {
    echo "[pre-commit-docs] markdownlint reported issues." >&2
    exit 1
  }
else
  echo "[pre-commit-docs] pnpm not found; skipping markdownlint." >&2
fi

echo "[pre-commit-docs] Completed."

exit 0