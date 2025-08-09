#!/bin/bash

# Fix MD040 errors by adding language specifications to fenced code blocks
# This script looks for ``` without language and attempts to guess appropriate languages

echo "Fixing MD040 errors (fenced code blocks without language)..."

# Function to fix a specific file
fix_file() {
    local file="$1"
    echo "Processing: $file"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Replace common patterns
    sed -i '' \
        -e 's/^```$/```text/g' \
        -e '/npm run\|yarn\|pnpm/{ s/^```$/```bash/g; }' \
        -e '/import\|export\|const\|function\|class/{ s/^```$/```typescript/g; }' \
        -e '/{[[:space:]]*$/{ s/^```$/```json/g; }' \
        -e '/CosmicHub\/\|├──\|└──/{ s/^```text$/```text/g; }' \
        "$file"
    
    # Check if changes were made
    if ! diff -q "$file" "$file.bak" > /dev/null; then
        echo "  ✅ Updated: $file"
        rm "$file.bak"
    else
        echo "  ℹ️  No changes: $file"
        mv "$file.bak" "$file"
    fi
}

# Find all markdown files with MD040 errors and fix them
markdownlint . --ignore node_modules --ignore "*/node_modules/*" 2>&1 | \
    grep "MD040" | \
    cut -d: -f1 | \
    sort -u | \
    while read -r file; do
        if [[ -f "$file" ]]; then
            fix_file "$file"
        fi
    done

echo "✅ MD040 fixes complete!"
echo "Run 'markdownlint . --ignore node_modules --ignore \"*/node_modules/*\" | grep MD040' to check remaining issues."
