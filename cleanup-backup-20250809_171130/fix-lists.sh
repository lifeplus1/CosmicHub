#!/bin/bash

# Targeted fix for MD032 list formatting issues
echo "🔧 Fixing specific MD032 list formatting patterns..."

fix_list_spacing() {
    local file="$1"
    echo "Processing lists in: $file"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Fix the specific pattern: heading followed directly by list
    sed -i '' '/^#.*$/N; s/\(^#.*\)\n\(- ✅\)/\1\n\n\2/' "$file"
    
    # Fix lists that should have blank line after
    awk '
    BEGIN { in_list = 0 }
    /^[[:space:]]*[-*+]/ {
        print $0
        in_list = 1
        next
    }
    {
        if (in_list && $0 !~ /^$/ && $0 !~ /^[[:space:]]*[-*+]/) {
            if ($0 ~ /^[[:space:]]*\*\*/ || $0 ~ /^```/ || $0 ~ /^#/) {
                print ""
            }
        }
        print $0
        in_list = ($0 ~ /^[[:space:]]*[-*+]/)
    }
    ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    
    # Check if changes were made
    if ! diff -q "$file" "$file.bak" > /dev/null 2>&1; then
        echo "  ✅ Updated: $file"
        rm "$file.bak"
    else
        echo "  ℹ️  No changes: $file"
        mv "$file.bak" "$file"
    fi
}

# Fix the component architecture guide specifically
fix_list_spacing "docs/COMPONENT_ARCHITECTURE_GUIDE.md"

echo ""
echo "🔍 Checking remaining MD032 errors..."
markdownlint "docs/COMPONENT_ARCHITECTURE_GUIDE.md" 2>&1 | grep "MD032" || echo "No MD032 errors found!"
