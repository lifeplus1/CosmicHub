#!/usr/bin/env node

/**
 * Safe Component Removal Script
 * Helps remove unused components after verification
 */

const fs = require('fs');
const path = require('path');

// List of VERIFIED unused components (start with safest ones)
const SAFE_TO_REMOVE = [
  // HealWave - Legacy/Enhanced versions
  'apps/healwave/src/components/AudioPlayer.lazy.tsx',
  'apps/healwave/src/components/FrequencyControls.enhanced.tsx',
  'apps/healwave/src/components/ToastProvider.component.tsx',
  'apps/healwave/src/components/VolumeSlider.tsx',
  
  // Astro - Stories and test utilities  
  'apps/astro/src/components/ChartDisplay/ChartDisplay.stories.tsx',
  'apps/astro/src/components/ChartDisplay/sampleData.ts',
  'apps/astro/src/components/ChartDisplay/tables/tableUtils-clean.ts',
  'apps/astro/src/components/ErrorBoundary.stories.tsx',
  
  // Packages - Unused utilities
  'packages/ui/src/components/PerformanceErrorBoundary.tsx',
  'packages/ui/src/components/accessibility/AccessibilityUtils.tsx',
];

// Components that need manual verification before removal
const VERIFY_BEFORE_REMOVAL = [
  'apps/healwave/src/components/PricingPage.tsx',
  'apps/healwave/src/components/Subscribe.tsx', 
  'apps/astro/src/components/PdfExport.tsx',
  'apps/astro/src/components/PremiumFeaturesDashboard.tsx',
  'apps/astro/src/components/UpgradePrompt.tsx',
];

function removeComponent(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }
  
  try {
    fs.unlinkSync(fullPath);
    console.log(`✅ Removed: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to remove ${filePath}: ${error.message}`);
    return false;
  }
}

function findImports(componentPath) {
  const componentName = path.basename(componentPath, path.extname(componentPath));
  const searchDirs = ['apps/', 'packages/'];
  const imports = [];
  
  function searchDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        searchDirectory(fullPath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes(componentName) && fullPath !== path.join(process.cwd(), componentPath)) {
            imports.push(path.relative(process.cwd(), fullPath));
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }
  }
  
  for (const searchDir of searchDirs) {
    searchDirectory(searchDir);
  }
  
  return imports;
}

function verifyBeforeRemoval(filePath) {
  console.log(`\n🔍 Verifying: ${filePath}`);
  
  const imports = findImports(filePath);
  
  if (imports.length === 0) {
    console.log(`✅ Safe to remove - no imports found`);
    return true;
  } else {
    console.log(`⚠️  Found ${imports.length} potential import(s):`);
    imports.forEach(imp => console.log(`   - ${imp}`));
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'verify';
  
  console.log('🧹 Safe Component Removal Tool\n');
  console.log('='.repeat(50));
  
  if (mode === 'remove' || mode === 'delete') {
    console.log('🚨 REMOVAL MODE - This will delete files!\n');
    
    let removed = 0;
    let total = 0;
    
    for (const filePath of SAFE_TO_REMOVE) {
      total++;
      if (verifyBeforeRemoval(filePath)) {
        if (removeComponent(filePath)) {
          removed++;
        }
      } else {
        console.log(`❌ Skipping ${filePath} - has dependencies`);
      }
    }
    
    console.log(`\n📊 Summary: Removed ${removed}/${total} components`);
    
  } else if (mode === 'verify') {
    console.log('🔍 VERIFICATION MODE - Checking for imports\n');
    
    console.log('Safe to remove:');
    for (const filePath of SAFE_TO_REMOVE) {
      verifyBeforeRemoval(filePath);
    }
    
    console.log('\n🔬 Need manual verification:');
    for (const filePath of VERIFY_BEFORE_REMOVAL) {
      verifyBeforeRemoval(filePath);
    }
    
  } else {
    console.log(`
Usage:
  node scripts/safe-component-removal.cjs [mode]

Modes:
  verify (default) - Check for imports without removing files
  remove          - Actually remove verified unused components

Examples:
  node scripts/safe-component-removal.cjs verify
  node scripts/safe-component-removal.cjs remove
`);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  removeComponent,
  verifyBeforeRemoval,
  SAFE_TO_REMOVE,
  VERIFY_BEFORE_REMOVAL
};
