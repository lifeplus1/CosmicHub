#!/bin/bash

echo "=== Building packages with dependency workaround ==="

# Step 1: Build the config package
echo "1. Building config package..."
cd /Users/Chris/Projects/CosmicHub/packages/config
pnpm run build

# Step 2: Build the UI package with minimal TypeScript checks
echo "2. Building UI package with type checking disabled..."
cd /Users/Chris/Projects/CosmicHub/packages/ui
pnpm run build:nochecks

# Step 3: Run type checking separately to identify issues
echo "3. Running type checking to identify remaining issues..."
cd /Users/Chris/Projects/CosmicHub/
pnpm run type-check

echo "=== Build completed with workaround ==="
echo "Note: Some TypeScript errors are bypassed for now."
echo "Consult the type-check results for remaining issues."
