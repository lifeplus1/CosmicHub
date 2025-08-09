#!/bin/bash

# Enhanced markdown formatter with better pattern matching
# Focuses on our project files (excludes node_modules)

echo "🔧 Enhanced markdown formatting for project files..."

fix_project_file() {
    local file="$1"
    echo "Processing: $file"
    
    # Skip node_modules files
    if [[ "$file" == *"node_modules"* ]]; then
        echo "  ⏭️  Skipping node_modules file: $file"
        return
    fi
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Use Python for more precise formatting
    python3 -c "
import re
import sys

def fix_markdown_formatting(content):
    lines = content.split('\n')
    result = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # MD022: Fix headings
        if re.match(r'^#+', line):
            # Add blank line before heading if previous line isn't blank
            if result and result[-1].strip() != '':
                result.append('')
            result.append(line)
            # Add blank line after heading if next line exists and isn't blank/heading
            if i + 1 < len(lines) and lines[i + 1].strip() != '' and not re.match(r'^#+', lines[i + 1]):
                result.append('')
        
        # MD031: Fix fenced code blocks
        elif re.match(r'^```', line):
            # Add blank line before opening fence if previous line isn't blank
            if result and result[-1].strip() != '':
                result.append('')
            result.append(line)
            i += 1
            # Copy content inside code block
            while i < len(lines) and not re.match(r'^```', lines[i]):
                result.append(lines[i])
                i += 1
            # Add closing fence
            if i < len(lines):
                result.append(lines[i])
                # Add blank line after closing fence if next line exists and isn't blank
                if i + 1 < len(lines) and lines[i + 1].strip() != '':
                    result.append('')
        
        # MD032: Fix lists
        elif re.match(r'^(\s*[-*+]|\s*\d+\.)', line):
            # Add blank line before list if previous line isn't blank and isn't a heading
            if result and result[-1].strip() != '' and not re.match(r'^#+', result[-1]):
                result.append('')
            result.append(line)
            # Look ahead for end of list
            j = i + 1
            while j < len(lines) and (re.match(r'^(\s*[-*+]|\s*\d+\.)', lines[j]) or lines[j].strip() == ''):
                result.append(lines[j])
                j += 1
            i = j - 1
            # Add blank line after list if next line exists and isn't blank/heading
            if j < len(lines) and lines[j].strip() != '' and not re.match(r'^#+', lines[j]):
                result.append('')
        
        else:
            result.append(line)
        
        i += 1
    
    # Clean up excessive blank lines
    final_result = []
    blank_count = 0
    for line in result:
        if line.strip() == '':
            blank_count += 1
            if blank_count <= 2:  # Allow max 2 consecutive blank lines
                final_result.append(line)
        else:
            blank_count = 0
            final_result.append(line)
    
    return '\n'.join(final_result)

# Read file
with open('$file', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix formatting
fixed_content = fix_markdown_formatting(content)

# Write back
with open('$file', 'w', encoding='utf-8') as f:
    f.write(fixed_content)
"
    
    # Check if changes were made
    if ! diff -q "$file" "$file.bak" > /dev/null 2>&1; then
        echo "  ✅ Updated: $file"
        rm "$file.bak"
    else
        echo "  ℹ️  No changes: $file"
        mv "$file.bak" "$file"
    fi
}

# Find project markdown files (exclude node_modules)
project_files=$(find . -name "*.md" -not -path "*/node_modules/*" | sort)

echo "Processing project markdown files..."
echo "$project_files" | while read -r file; do
    if [[ -f "$file" ]]; then
        fix_project_file "$file"
    fi
done

echo ""
echo "🔍 Checking remaining errors in project files..."
markdownlint . --ignore node_modules --ignore "*/node_modules/*" 2>&1 | grep -E "MD022|MD031|MD032" | grep -v node_modules | head -20
