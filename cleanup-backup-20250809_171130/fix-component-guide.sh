#!/bin/bash

# Comprehensive markdown formatter for COMPONENT_ARCHITECTURE_GUIDE.md
echo "🔧 Fixing all MD022/MD032 errors in COMPONENT_ARCHITECTURE_GUIDE.md..."

FILE="docs/COMPONENT_ARCHITECTURE_GUIDE.md"

# Create backup
cp "$FILE" "$FILE.bak"

# Use Python for sophisticated markdown formatting
python3 - << 'EOF'
import re

def fix_markdown_formatting(content):
    lines = content.split('\n')
    result = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Pattern 1: Benefits list - add blank line before list
        if line == "**Benefits**:":
            result.append(line)
            result.append("")  # Add blank line after Benefits:
            i += 1
            continue
            
        # Pattern 2: Fix lists - add blank line after lists before headings or other content
        if line.startswith("- ✅"):
            result.append(line)
            # Look ahead to see what comes next
            next_idx = i + 1
            if next_idx < len(lines):
                next_line = lines[next_idx]
                # If next line is not empty and not another list item, add blank line
                if next_line and not next_line.startswith("- ✅") and not next_line.startswith("  "):
                    result.append("")  # Add blank line after list
            i += 1
            continue
            
        # Pattern 3: Fix headings - add blank line before headings that follow lists
        if line.startswith("### "):
            # Check if previous line was a list item or content
            if result and result[-1] and not result[-1] == "":
                result.append("")  # Add blank line before heading
            result.append(line)
            result.append("")  # Add blank line after heading
            i += 1
            continue
            
        # Default: add line as-is
        result.append(line)
        i += 1
    
    # Remove excessive blank lines (3+ consecutive)
    final_result = []
    blank_count = 0
    for line in result:
        if line == "":
            blank_count += 1
            if blank_count <= 2:
                final_result.append(line)
        else:
            blank_count = 0
            final_result.append(line)
    
    return '\n'.join(final_result)

# Read file
with open('docs/COMPONENT_ARCHITECTURE_GUIDE.md', 'r') as f:
    content = f.read()

# Fix formatting
fixed_content = fix_markdown_formatting(content)

# Write back
with open('docs/COMPONENT_ARCHITECTURE_GUIDE.md', 'w') as f:
    f.write(fixed_content)

print("✅ Applied comprehensive formatting fixes")
EOF

echo ""
echo "🔍 Checking remaining errors in COMPONENT_ARCHITECTURE_GUIDE.md..."
remaining=$(markdownlint "$FILE" 2>&1 | grep -E "MD022|MD031|MD032" | wc -l)
echo "Remaining errors: $remaining"

if [ "$remaining" -gt 0 ]; then
    echo "📋 Remaining issues:"
    markdownlint "$FILE" 2>&1 | grep -E "MD022|MD031|MD032" | head -5
else
    echo "🎉 All MD022/MD031/MD032 errors fixed!"
    rm "$FILE.bak"
fi
