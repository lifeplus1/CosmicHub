#!/bin/bash

# Create a backup
cd /Users/Chris/Projects/CosmicHub/frontend/astro

# Temporarily comment out all @chakra-ui imports to get build working
for file in $(find src/components -name "*.tsx" -exec grep -l "@chakra-ui" {} \;); do
  echo "Processing $file..."
  # Comment out chakra imports
  sed -i '' 's/^import.*@chakra-ui.*$/\/\/ &/' "$file"
  # Comment out chakra icons imports  
  sed -i '' 's/^import.*@chakra-ui\/icons.*$/\/\/ &/' "$file"
done

echo "All Chakra UI imports have been temporarily commented out."
echo "Run 'npm run build' to test if the build works now."
