#!/bin/bash
set -euo pipefail

# CosmicHub Project Structure Cleanup Script
# Removes redundant files and optimizes monorepo structure

echo "🧹 Starting CosmicHub project cleanup..."

# Create backup directory
BACKUP_DIR="./cleanup-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup in $BACKUP_DIR..."

# Function to safely remove files with backup
safe_remove() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "🗑️  Removing: $file"
        # Create backup structure
        local backup_path="$BACKUP_DIR/${file#./}"
        mkdir -p "$(dirname "$backup_path")"
        cp "$file" "$backup_path" 2>/dev/null || true
        rm "$file"
    fi
}

# Function to safely remove directories with backup
safe_remove_dir() {
    local dir="$1"
    if [ -d "$dir" ]; then
        echo "🗑️  Removing directory: $dir"
        # Create backup
        local backup_path="$BACKUP_DIR/${dir#./}"
        mkdir -p "$(dirname "$backup_path")"
        cp -r "$dir" "$backup_path" 2>/dev/null || true
        rm -rf "$dir"
    fi
}

# Function to move files
safe_move() {
    local source="$1"
    local target="$2"
    if [ -f "$source" ]; then
        echo "📁 Moving: $source → $target"
        mkdir -p "$(dirname "$target")"
        mv "$source" "$target"
    fi
}

echo "🔄 Step 1: Removing duplicate configuration files..."

# Remove duplicate vite.config.js files (keep .ts versions)
safe_remove "./apps/astro/vite.config.js"
safe_remove "./apps/healwave/vite.config.js"

# Remove duplicate postcss config files (keep .ts versions)
safe_remove "./apps/astro/postcss.config.js"
safe_remove "./apps/healwave/postcss.config.cjs"

# Remove eslint .cjs files (keep .ts versions)
safe_remove "./apps/astro/eslint.config.cjs"

# Remove backup tsconfig files
safe_remove "./packages/auth/tsconfig.json.new"

# Remove redundant docker files from root
safe_remove "./Dockerfile.astro"
safe_remove "./Dockerfile.healwave"

echo "🔄 Step 2: Cleaning up test structure..."

# Move root test files to appropriate app directories
safe_move "./test-enhanced-card.test.tsx" "./packages/ui/src/components/__tests__/enhanced-card-import.test.tsx"
safe_move "./test-imports.ts" "./packages/config/src/testing/import-verification.test.ts"

# Move websocket test to backend
safe_move "./test_websocket.py" "./backend/tests/test_websocket.py"

echo "🔄 Step 3: Organizing scripts and utilities..."

# Create scripts directory if it doesn't exist
mkdir -p "./scripts"

# Move utility scripts to scripts directory
safe_move "./verify-import-fix.js" "./scripts/verify-import-fix.js"

echo "🔄 Step 4: Cleaning up documentation..."

# Create docs/archive directory
mkdir -p "./docs/archive"

# Archive phase completion documents
safe_move "./docs/PHASE_2_COMPLETION_SUMMARY.md" "./docs/archive/PHASE_2_COMPLETION_SUMMARY.md"
safe_move "./docs/PHASE_3_COMPLETION_SUMMARY.md" "./docs/archive/PHASE_3_COMPLETION_SUMMARY.md"
safe_move "./docs/PHASE_4_COMPLETION_SUMMARY.md" "./docs/archive/PHASE_4_COMPLETION_SUMMARY.md"

# Remove backup documentation files
safe_remove "./docs/COMPONENT_ARCHITECTURE_GUIDE.md.bak"

echo "🔄 Step 5: Cleaning up shared packages..."

# Remove redundant vite-env.d.ts files from packages (keep only in apps)
safe_remove "./packages/auth/src/vite-env.d.ts"
safe_remove "./packages/ui/src/vite-env.d.ts"
safe_remove "./shared/vite-env.d.ts"

# Remove empty component-architecture.ts (keep .tsx version)
safe_remove "./packages/config/src/component-architecture.ts"

# Remove redundant minimal-exports.ts
safe_remove "./packages/config/src/minimal-exports.ts"

# Remove map files
safe_remove "./shared/firebase.d.ts.map"

echo "🔄 Step 6: Cleaning up build artifacts and fix scripts..."

# Remove one-off fix scripts
safe_remove "./fix-component-guide.sh"
safe_remove "./fix-lists.sh"
safe_remove "./fix-markdown-enhanced.sh"
safe_remove "./fix-markdown-formatting.sh"
safe_remove "./fix-markdown-simple.sh"
safe_remove "./fix-md040.sh"
safe_remove "./fix-final.sh"

# Remove outdated deployment scripts
safe_remove "./build-production.sh"
safe_remove "./deploy-production.sh"

# Remove archived production build
safe_remove "./cosmichub-production-20250807_235949.tar.gz"

echo "🔄 Step 7: Consolidating Firebase configuration..."

# Keep backend/firebase.json for Firestore rules, remove redundant root firebase.json for emulators
# (Note: This requires manual verification of which is needed)

echo "🔄 Step 8: Cleaning up empty directories..."

# Remove empty ephe directory from root (keep backend/ephe)
safe_remove_dir "./ephe"

echo "🔄 Step 9: Optimizing app-specific structure..."

# Move types from root to src/types in apps (if they exist)
if [ -d "./apps/astro/types" ]; then
    echo "📁 Moving astro types to src/types..."
    mkdir -p "./apps/astro/src/types"
    if [ "$(ls -A ./apps/astro/types)" ]; then
        mv ./apps/astro/types/* ./apps/astro/src/types/ 2>/dev/null || true
    fi
    rmdir "./apps/astro/types" 2>/dev/null || true
fi

# Remove optimized App component (merge optimizations into main App.tsx manually if needed)
safe_remove "./apps/astro/src/App.optimized.tsx"

echo "🔄 Step 10: Updating .gitignore for security..."

# Ensure .env files are ignored
if ! grep -q "^\.env" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# Environment variables" >> .gitignore
    echo ".env" >> .gitignore
    echo ".env.local" >> .gitignore
    echo ".env.*.local" >> .gitignore
    echo "Environment variables added to .gitignore"
fi

echo "🔄 Step 11: Creating postcss.config.ts files where missing..."

# Create postcss.config.ts for astro if missing
if [ ! -f "./apps/astro/postcss.config.ts" ] && [ -f "./apps/astro/postcss.config.js" ]; then
    echo "📄 Converting astro postcss config to TypeScript..."
    cat > "./apps/astro/postcss.config.ts" << 'EOF'
import type { Config } from 'postcss-load-config'

const config: Config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config
EOF
fi

# Create postcss.config.ts for healwave if missing
if [ ! -f "./apps/healwave/postcss.config.ts" ] && [ -f "./apps/healwave/postcss.config.cjs" ]; then
    echo "📄 Converting healwave postcss config to TypeScript..."
    cat > "./apps/healwave/postcss.config.ts" << 'EOF'
import type { Config } from 'postcss-load-config'

const config: Config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config
EOF
fi

echo "🔄 Step 12: Verifying critical files are preserved..."

# List of critical files that should never be deleted
CRITICAL_FILES=(
    "./backend/main.py"
    "./apps/astro/src/main.tsx"
    "./apps/healwave/src/main.tsx"
    "./apps/astro/src/App.tsx"
    "./apps/healwave/src/App.tsx"
    "./package.json"
    "./turbo.json"
    "./tsconfig.json"
)

echo "🔍 Verifying critical files..."
for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ CRITICAL FILE MISSING: $file"
        exit 1
    else
        echo "✅ $file exists"
    fi
done

echo "🔄 Step 13: Updating package.json scripts if needed..."

# Check if cleanup script exists in package.json
if command -v jq >/dev/null 2>&1; then
    # Add cleanup script to package.json if jq is available
    jq '.scripts["cleanup"] = "bash scripts/cleanup-project.sh"' package.json > package.json.tmp
    mv package.json.tmp package.json
    echo "📄 Added cleanup script to package.json"
fi

echo "🔄 Step 14: Final verification..."

# Count remaining files
TOTAL_FILES=$(find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) | grep -v node_modules | grep -v .git | wc -l)
echo "📊 Total configuration/source files: $TOTAL_FILES"

# Verify no duplicate vite configs exist
VITE_JS_COUNT=$(find . -name "vite.config.js" | grep -v node_modules | wc -l)
VITE_TS_COUNT=$(find . -name "vite.config.ts" | grep -v node_modules | wc -l)

echo "📊 Vite configs: $VITE_TS_COUNT TypeScript, $VITE_JS_COUNT JavaScript"

if [ "$VITE_JS_COUNT" -gt 0 ]; then
    echo "⚠️  Warning: JavaScript vite config files still exist:"
    find . -name "vite.config.js" | grep -v node_modules
fi

echo ""
echo "✅ CosmicHub project cleanup complete!"
echo ""
echo "📊 Summary:"
echo "   - Backup created: $BACKUP_DIR"
echo "   - Duplicate configuration files removed"
echo "   - Test structure consolidated"
echo "   - Documentation organized"
echo "   - Scripts moved to scripts/ directory"
echo "   - Security improvements applied"
echo "   - TypeScript consistency enforced"
echo ""
echo "🚀 Your project is now optimized for:"
echo "   - Better maintainability"
echo "   - Improved performance"
echo "   - Enhanced developer experience"
echo "   - Cleaner CI/CD pipelines"
echo ""
echo "⚠️  Manual tasks to complete:"
echo "   1. Review and test your applications"
echo "   2. Update any hardcoded file paths in scripts"
echo "   3. Verify all imports still work correctly"
echo "   4. Run 'npm run build' to test build process"
echo "   5. Run tests to ensure nothing is broken"
echo ""
echo "💡 To restore files if needed: cp -r $BACKUP_DIR/* ./"
echo ""
echo "🎉 Happy coding with your clean, optimized monorepo!"
