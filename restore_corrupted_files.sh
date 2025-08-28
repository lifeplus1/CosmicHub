#!/bin/bash

# Script to identify and restore corrupted files from tree-shaking backup

BACKUP_DIR="/Users/Chris/Projects/CosmicHub/tree-shaking-backup/backup-2025-08-27T03-26-18-308Z"
CURRENT_DIR="/Users/Chris/Projects/CosmicHub"

echo "Checking for corrupted files by comparing line counts..."

# List of files with known syntax errors from TypeScript compilation
ERROR_FILES=(
  "apps/astro/src/components/accessibility/VisuallyHidden.tsx"
  "apps/astro/src/components/AstrologyGuide/AstrologyGuide.tsx"
  "apps/astro/src/components/AstrologyGuide/types.ts"
  "apps/astro/src/components/AstrologyGuide/useAstrologyGuide.ts"
  "apps/astro/src/components/ChartCalculator.tsx"
  "apps/astro/src/components/ChartDisplay/StatefulAccordion.tsx"
  "apps/astro/src/components/ChartDisplay/tables/AspectTable.tsx"
  "apps/astro/src/components/ChartDisplay/tables/tableUtils_clean.ts"
  "apps/astro/src/components/ChartDisplay/validateChart.ts"
  "apps/astro/src/components/ChartPreferences.tsx"
  "apps/astro/src/components/EducationalTooltip.tsx"
  "apps/astro/src/components/GeneKeysChart/GeneKeysComponents.tsx"
  "apps/astro/src/components/HumanDesignChart/HumanDesignModal.tsx"
  "apps/astro/src/components/HumanDesignChart/utils.ts"
  "apps/astro/src/components/NotificationSettings.tsx"
  "apps/astro/src/components/NumerologyCalculator/types.ts"
  "apps/astro/src/components/NumerologyCalculator/useNumerology.ts"
  "apps/astro/src/components/PremiumFeaturesDashboard.tsx"
  "apps/astro/src/components/SubscriptionStatus.tsx"
  "apps/astro/src/components/SynastryAnalysis/SynastryComponents.tsx"
  "apps/astro/src/components/SynastryAnalysis/types.ts"
  "apps/astro/src/components/ToastProvider.tsx"
  "apps/astro/src/components/TransitAnalysis/EphemerisChart.tsx"
  "apps/astro/src/components/TransitAnalysis/EphemerisChartWrapper.tsx"
  "apps/astro/src/components/TransitAnalysis/TransitAnalysis.tsx"
  "apps/astro/src/components/TransitAnalysis/types.ts"
  "apps/astro/src/components/UnifiedBirthInput.tsx"
  "apps/astro/src/components/UpgradeModalDemo.tsx"
  "apps/astro/src/examples/InteractiveChartExample.tsx"
  "apps/astro/src/examples/NotificationIntegrationExamples.tsx"
  "apps/astro/src/pages/SubscriptionCancelledPage.tsx"
  "apps/astro/src/types/cosmichub-auth.d.ts"
  "apps/astro/src/utils/celestialBodyCategorization.ts"
  "apps/astro/src/utils/exportUtils.ts"
  "apps/astro/src/utils/upgradeEvents.ts"
)

for file in "${ERROR_FILES[@]}"; do
  current_file="$CURRENT_DIR/$file"
  backup_file="$BACKUP_DIR/$file"
  
  if [[ -f "$current_file" && -f "$backup_file" ]]; then
    current_lines=$(wc -l < "$current_file")
    backup_lines=$(wc -l < "$backup_file")
    
    # If current file has significantly fewer lines, it's likely corrupted
    if (( backup_lines > current_lines + 5 )); then
      echo "CORRUPTED: $file (current: $current_lines lines, backup: $backup_lines lines)"
      echo "  Would restore: cp \"$backup_file\" \"$current_file\""
    elif (( current_lines > backup_lines + 5 )); then
      echo "ENHANCED: $file (current: $current_lines lines, backup: $backup_lines lines) - SKIP RESTORE"
    else
      echo "SIMILAR: $file (current: $current_lines lines, backup: $backup_lines lines)"
    fi
  elif [[ -f "$backup_file" ]]; then
    echo "MISSING: $file - exists in backup but not current"
  fi
done
