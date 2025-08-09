#!/bin/bash

# Final comprehensive markdown formatter
echo "🔧 Final markdown formatting fix..."

fix_component_guide() {
    local file="docs/COMPONENT_ARCHITECTURE_GUIDE.md"
    echo "Processing: $file"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Fix specific patterns in component guide
    # Pattern 1: Benefits list needs blank line before
    sed -i '' 's/^**Benefits**:$/\n**Benefits**:/' "$file"
    
    # Pattern 2: Add blank line after lists that are followed by headings or other content
    awk '
    BEGIN { 
        in_benefits_list = 0
        prev_line = ""
    }
    {
        # Detect start of benefits list
        if ($0 ~ /^\*\*Benefits\*\*:$/) {
            print prev_line
            print ""
            print $0
            in_benefits_list = 1
            prev_line = ""
            next
        }
        
        # In benefits list
        if (in_benefits_list && $0 ~ /^- ✅/) {
            if (prev_line != "") print prev_line
            print $0
            prev_line = ""
            next
        }
        
        # End of benefits list - add blank line
        if (in_benefits_list && $0 !~ /^- ✅/ && $0 !~ /^$/) {
            if (prev_line != "") print prev_line
            print ""
            print $0
            in_benefits_list = 0
            prev_line = ""
            next
        }
        
        # Normal processing
        if (prev_line != "") print prev_line
        prev_line = $0
    }
    END {
        if (prev_line != "") print prev_line
    }
    ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    
    # Remove any excessive blank lines (3+ in a row)
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
    
    echo "  ✅ Processed: $file"
}

# Process the component guide
fix_component_guide

echo ""
echo "🔍 Checking component guide errors..."
markdownlint "docs/COMPONENT_ARCHITECTURE_GUIDE.md" 2>&1 | grep -E "MD032" | head -5 || echo "MD032 errors reduced!"
