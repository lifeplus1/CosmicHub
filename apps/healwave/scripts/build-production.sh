#!/bin/bash

set -e

echo "🎵 Building HealWave for Production..."

# Navigate to workspace root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
HEALWAVE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "📂 Workspace: $WORKSPACE_ROOT"
echo "📂 HealWave: $HEALWAVE_ROOT"

cd "$WORKSPACE_ROOT"

echo "📦 Installing workspace dependencies..."
pnpm install

echo "🏗️ Building analytics package..."
cd packages/analytics && pnpm run build

echo "🎵 Building HealWave application..."
cd "$HEALWAVE_ROOT"
npm run build

echo "✅ Production build completed!"
echo "📁 Build output is in: ./dist/"

# Verify critical files exist
CRITICAL_FILES=(
    "dist/index.html"
    "dist/manifest.json"
    "dist/sw.js"
)

echo "🔍 Verifying build output..."
for file in "${CRITICAL_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
        exit 1
    fi
done

echo ""
echo "🎉 HealWave production build ready!"
echo "📋 Next steps:"
echo "   1. Test locally: npm run preview"
echo "   2. Deploy to server: Upload dist/ folder"
echo "   3. Configure web server (nginx recommended)"
echo ""
