#!/bin/bash

# Simple and reliable markdown formatter for MD022, MD031, MD032
echo "🔧 Fixing markdown formatting errors with simple approach..."

fix_simple() {
    local file="$1"
    echo "Processing: $file"
    
    # Skip non-project files
    if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *".venv"* ]] || [[ "$file" == *".pytest_cache"* ]]; then
        return
    fi
    
    # Create backup
    cp "$file" "$file.bak"
    
    # MD022: Add blank lines around headings
    # This adds a blank line before headings that don't have one
    awk '
    BEGIN { prev_blank = 1 }
    /^#/ {
        if (!prev_blank && NR > 1) print ""
        print $0
        getline
        if ($0 !~ /^$/ && $0 !~ /^#/) print ""
        print $0
        prev_blank = ($0 ~ /^$/)
        next
    }
    {
        print $0
        prev_blank = ($0 ~ /^$/)
    }
    ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    
    # MD031: Add blank lines around fenced code blocks  
    awk '
    BEGIN { in_code = 0; prev_blank = 1 }
    /^```/ {
        if (!in_code) {
            # Opening fence
            if (!prev_blank && NR > 1) print ""
            print $0
            in_code = 1
        } else {
            # Closing fence
            print $0
            if (getline > 0 && $0 !~ /^$/) {
                print ""
                print $0
            } else {
                print $0
            }
            in_code = 0
        }
        prev_blank = 0
        next
    }
    {
        print $0
        prev_blank = ($0 ~ /^$/)
    }
    ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    
    # MD032: Add blank lines around lists
    awk '
    BEGIN { in_list = 0; prev_blank = 1 }
    /^[[:space:]]*[-*+]/ || /^[[:space:]]*[0-9]+\./ {
        if (!in_list && !prev_blank && NR > 1) print ""
        print $0
        in_list = 1
        prev_blank = 0
        next
    }
    {
        if (in_list && $0 !~ /^$/ && $0 !~ /^[[:space:]]*[-*+]/ && $0 !~ /^[[:space:]]*[0-9]+\./) {
            print ""
        }
        print $0
        in_list = 0
        prev_blank = ($0 ~ /^$/)
    }
    ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    
    # Remove excessive blank lines (more than 2)
    awk '
    BEGIN { blank_count = 0 }
    /^$/ {
        blank_count++
        if (blank_count <= 2) print $0
        next
    }
    {
        blank_count = 0
        print $0
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

# Process only key project files to avoid overwhelming output
key_files=(
    "README.md"
    "ADVANCED_QA_SYSTEM_COMPLETE.md"
    "BUILD_OPTIMIZATION.md"
    "COMPONENT_LIBRARY_GUIDE.md"
    "docs/BUDGET_OPTIMIZATION.md"
    "docs/COMPONENT_ARCHITECTURE_GUIDE.md"
    "docs/deployment/DEPLOYMENT_GUIDE.md"
)

echo "Processing key project files..."
for file in "${key_files[@]}"; do
    if [[ -f "$file" ]]; then
        fix_simple "$file"
    fi
done

echo ""
echo "🔍 Checking remaining errors in processed files..."
for file in "${key_files[@]}"; do
    if [[ -f "$file" ]]; then
        markdownlint "$file" 2>&1 | grep -E "MD022|MD031|MD032" || true
    fi
done
