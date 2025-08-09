#!/bin/bash

# Fix MD022, MD031, and MD032 markdown linting errors across the entire project
# MD022: Headings should be surrounded by blank lines
# MD031: Fenced code blocks should be surrounded by blank lines  
# MD032: Lists should be surrounded by blank lines

echo "🔧 Fixing MD022, MD031, and MD032 markdown linting errors..."

# Function to fix a specific file
fix_markdown_file() {
    local file="$1"
    echo "Processing: $file"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Use a more sophisticated sed script to fix formatting issues
    # Note: This is a simplified approach - complex cases may need manual review
    
    # Fix MD022: Add blank lines around headings (# ## ### etc.)
    # Add blank line before heading if previous line is not blank
    sed -i '' '/^#/ {
        x
        /^$/ !{
            x
            i\

            b
        }
        x
    }' "$file"
    
    # Add blank line after heading if next line is not blank and not another heading
    sed -i '' '/^#/ {
        N
        /\n[^#$]/ {
            s/\n/\n\n/
        }
        P
        D
    }' "$file"
    
    # Fix MD031: Add blank lines around fenced code blocks
    # Add blank line before ``` if previous line is not blank
    sed -i '' '/^```/ {
        x
        /^$/ !{
            x
            i\

            b
        }
        x
    }' "$file"
    
    # Add blank line after closing ``` if next line is not blank
    awk '
    BEGIN { in_code = 0 }
    /^```/ { 
        if (in_code) {
            print $0
            if (getline > 0 && $0 !~ /^$/) {
                print ""
                print $0
            } else {
                print $0
            }
            in_code = 0
            next
        } else {
            in_code = 1
        }
    }
    { print }
    ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    
    # Fix MD032: Add blank lines around lists
    # Add blank line before list if previous line is not blank and not a heading
    sed -i '' '/^[[:space:]]*[-*+]/ {
        x
        /^$/ !{
            /^#/ !{
                x
                i\

                b
            }
        }
        x
    }' "$file"
    
    # Add blank line after list if next line is not blank, not a list item, and not a heading
    awk '
    BEGIN { in_list = 0 }
    /^[[:space:]]*[-*+]/ { 
        in_list = 1
        print
        next
    }
    {
        if (in_list && $0 !~ /^$/ && $0 !~ /^[[:space:]]*[-*+]/ && $0 !~ /^#/) {
            print ""
        }
        in_list = 0
        print
    }
    ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    
    # Clean up excessive blank lines (more than 2 consecutive)
    sed -i '' '/^$/{
        N
        /^\n$/{
            N
            /^\n$/{
                d
            }
        }
    }' "$file"
    
    # Check if changes were made
    if ! diff -q "$file" "$file.bak" > /dev/null 2>&1; then
        echo "  ✅ Updated: $file"
        rm "$file.bak"
    else
        echo "  ℹ️  No changes: $file"
        mv "$file.bak" "$file"
    fi
}

# Find all markdown files and fix them
echo "Finding markdown files with MD022, MD031, or MD032 errors..."

# Get list of files with these specific errors
files_with_errors=$(markdownlint . --ignore node_modules --ignore "*/node_modules/*" 2>&1 | \
    grep -E "MD022|MD031|MD032" | \
    cut -d: -f1 | \
    sort -u)

if [ -z "$files_with_errors" ]; then
    echo "✅ No MD022, MD031, or MD032 errors found!"
    exit 0
fi

echo "Files to process:"
echo "$files_with_errors"
echo ""

# Process each file
echo "$files_with_errors" | while read -r file; do
    if [[ -f "$file" && "$file" == *.md ]]; then
        fix_markdown_file "$file"
    fi
done

echo ""
echo "✅ Markdown formatting fixes complete!"
echo ""
echo "🔍 Checking remaining MD022, MD031, and MD032 errors..."
remaining_errors=$(markdownlint . --ignore node_modules --ignore "*/node_modules/*" 2>&1 | grep -E "MD022|MD031|MD032" | wc -l)
echo "Remaining errors: $remaining_errors"

if [ "$remaining_errors" -eq 0 ]; then
    echo "🎉 All MD022, MD031, and MD032 errors have been fixed!"
else
    echo "⚠️  Some errors may require manual review:"
    markdownlint . --ignore node_modules --ignore "*/node_modules/*" 2>&1 | grep -E "MD022|MD031|MD032" | head -10
fi
