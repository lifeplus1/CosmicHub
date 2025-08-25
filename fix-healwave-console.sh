#!/bin/bash

# Fix remaining console statements in healwave by replacing devConsole patterns
# and ensuring proper imports

echo "🔧 Fixing healwave console statements..."

FILES=(
  "apps/healwave/src/components/FrequencyControls.tsx"
  "apps/healwave/src/components/PresetSelector.tsx"
  "apps/healwave/src/pwa-performance.ts"
  "apps/healwave/src/pages/Presets.tsx"
  "apps/healwave/src/components/ErrorBoundary.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Remove devConsole definitions
    sed -i '' '/^const devConsole = {/,/^};$/d' "$file"
    sed -i '' '/^[[:space:]]*const devConsole = {/,/^[[:space:]]*};[[:space:]]*$/d' "$file"
    
    # Add devConsole import if file uses devConsole and doesn't have import
    if grep -q "devConsole\." "$file" && ! grep -q "import.*devConsole" "$file"; then
      # Find first import line and add after it
      sed -i '' '1a\
import { devConsole } from '\''../config/devConsole'\'';
' "$file"
    fi
    
    echo "✅ Processed $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo "🎉 Healwave console fixes complete!"
