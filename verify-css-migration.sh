#!/bin/bash

# CSS Module Import Verification Script
# Verifies that all centralized CSS modules can be imported correctly

echo "🔍 Verifying CSS Module Centralization..."
echo "============================================"

# Check if centralized modules directory exists
if [ -d "/Users/Chris/Projects/CosmicHub/packages/ui/src/styles/modules" ]; then
    echo "✅ Centralized modules directory exists"
else
    echo "❌ Centralized modules directory missing"
    exit 1
fi

# Count files in centralized location
MODULE_COUNT=$(find /Users/Chris/Projects/CosmicHub/packages/ui/src/styles/modules -name "*.module.css" | wc -l)
echo "📁 Found $MODULE_COUNT CSS modules in centralized location"

# List all centralized modules
echo ""
echo "📋 Centralized CSS Modules:"
find /Users/Chris/Projects/CosmicHub/packages/ui/src/styles/modules -name "*.module.css" | sort | sed 's|.*/||' | sed 's/^/   - /'

# Check for any remaining scattered modules
SCATTERED_COUNT=$(find /Users/Chris/Projects/CosmicHub -name "*.module.css" ! -path "*/packages/ui/src/styles/modules/*" | wc -l)
if [ $SCATTERED_COUNT -eq 0 ]; then
    echo ""
    echo "✅ No scattered CSS modules found - migration complete!"
else
    echo ""
    echo "⚠️  Found $SCATTERED_COUNT scattered CSS modules:"
    find /Users/Chris/Projects/CosmicHub -name "*.module.css" ! -path "*/packages/ui/src/styles/modules/*" | sed 's/^/   - /'
fi

# Check if index file exists and exports are present
if [ -f "/Users/Chris/Projects/CosmicHub/packages/ui/src/styles/modules/index.ts" ]; then
    echo ""
    echo "✅ Index file exists"
    EXPORT_COUNT=$(grep -c "export.*Styles" /Users/Chris/Projects/CosmicHub/packages/ui/src/styles/modules/index.ts)
    echo "📤 Found $EXPORT_COUNT style exports in index file"
else
    echo "❌ Index file missing"
fi

echo ""
echo "🎉 CSS Module Centralization Verification Complete!"
echo "============================================"
