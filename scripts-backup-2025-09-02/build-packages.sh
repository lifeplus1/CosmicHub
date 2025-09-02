#!/bin/bash

echo "=== Building packages in correct order ==="
echo "1. Building config package..."
cd /Users/Chris/Projects/CosmicHub/packages/config
pnpm run build

echo "2. Building UI package..."
cd /Users/Chris/Projects/CosmicHub/packages/ui
pnpm run build:safe

echo "=== Build completed ==="
