#!/bin/bash

# Script to update UI component imports to use new organized structure
# Run this from the project root if you need to update more files

echo "🔧 Updating UI component imports to new structure..."

# Define the update patterns
declare -A updates=(
    ["@cosmichub/ui/src/components/Button"]="@cosmichub/ui/src/components/ui/Button"
    ["@cosmichub/ui/src/components/Card"]="@cosmichub/ui/src/components/ui/Card"
    ["@cosmichub/ui/src/components/Input"]="@cosmichub/ui/src/components/ui/Input"
    ["@cosmichub/ui/src/components/Progress"]="@cosmichub/ui/src/components/ui/Progress"
    ["@cosmichub/ui/src/components/Badge"]="@cosmichub/ui/src/components/ui/Badge"
    ["@cosmichub/ui/src/components/Spinner"]="@cosmichub/ui/src/components/ui/Spinner"
    ["@cosmichub/ui/src/components/Loading"]="@cosmichub/ui/src/components/ui/Loading"
    ["@cosmichub/ui/src/components/Tooltip"]="@cosmichub/ui/src/components/ui/Tooltip"
    ["@cosmichub/ui/src/components/Alert"]="@cosmichub/ui/src/components/ui/Alert"
    ["@cosmichub/ui/src/components/Accordion"]="@cosmichub/ui/src/components/ui/Accordion"
    ["@cosmichub/ui/src/components/Dropdown"]="@cosmichub/ui/src/components/ui/Dropdown"
    ["@cosmichub/ui/src/components/Table"]="@cosmichub/ui/src/components/ui/Table"
    ["@cosmichub/ui/src/components/Tabs"]="@cosmichub/ui/src/components/ui/Tabs"
    ["@cosmichub/ui/src/components/Modal"]="@cosmichub/ui/src/components/ui/Modal"
    ["@cosmichub/ui/src/components/ErrorBoundary"]="@cosmichub/ui/src/components/feedback/ErrorBoundary"
    ["@cosmichub/ui/src/components/ErrorHandling"]="@cosmichub/ui/src/components/feedback/ErrorHandling"
    ["@cosmichub/ui/src/components/LoadingStates"]="@cosmichub/ui/src/components/feedback/LoadingStates"
    ["@cosmichub/ui/src/components/UserFeedback"]="@cosmichub/ui/src/components/feedback/UserFeedback"
    ["@cosmichub/ui/src/components/MobileResponsive"]="@cosmichub/ui/src/components/layout/MobileResponsive"
    ["@cosmichub/ui/src/components/AnalyticsDashboard"]="@cosmichub/ui/src/components/analytics/AnalyticsDashboard"
    ["@cosmichub/ui/src/components/PerformanceDashboard"]="@cosmichub/ui/src/components/analytics/PerformanceDashboard"
    ["@cosmichub/ui/src/components/UpgradeModal"]="@cosmichub/ui/src/components/modals/UpgradeModal"
)

# Update files
find . -name "*.tsx" -o -name "*.ts" | while read file; do
    # Skip node_modules and .git directories
    if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *".git"* ]]; then
        continue
    fi
    
    for old_path in "${!updates[@]}"; do
        new_path="${updates[$old_path]}"
        
        # Update imports in the file
        if grep -q "$old_path" "$file"; then
            sed -i.bak "s|$old_path|$new_path|g" "$file"
            echo "✅ Updated $file: $old_path -> $new_path"
            # Remove backup file
            rm "${file}.bak"
        fi
    done
done

echo "🎉 Import updates complete!"
