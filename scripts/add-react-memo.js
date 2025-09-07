#!/usr/bin/env node

/**
 * Quick React.memo Optimization for High-Priority Components
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Top components still needing React.memo
const MEMO_TARGETS = [
  'apps/astro/src/components/MultiSystemChart/AyurvedaChart.tsx',
  'packages/ui/src/components/enhanced/EnhancedChartDisplay.tsx',
  'packages/ui/src/components/feedback/ErrorBoundaries.tsx',
  'packages/ui/src/components/feedback/ErrorHandling.tsx',
  'packages/ui/src/components/ui/Alert.tsx'
];

function addSimpleReactMemo(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const componentName = path.basename(filePath, '.tsx');

    // Check if already memoized
    if (content.includes('React.memo(') || content.includes('memo(')) {
      console.log(`✅ ${componentName} already memoized`);
      return;
    }

    // Find the component export pattern
    const exportPattern = new RegExp(
      `(const\\s+${componentName}\\s*:[^=]*=\\s*)([^;]+)`,
      's'
    );

    const match = content.match(exportPattern);
    if (!match) {
      console.log(`⚠️ Could not find component pattern in ${componentName}`);
      return;
    }

    // Add React import if missing
    if (!content.includes('import React')) {
      content = content.replace(
        /^import/m,
        'import React from \'react\';\nimport'
      );
    }

    // Wrap with memo
    content = content.replace(exportPattern, `$1React.memo($2)`);

    fs.writeFileSync(fullPath, content);
    console.log(`🔧 Added React.memo to ${componentName}`);

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log('🚀 Adding React.memo to high-priority components...\n');

MEMO_TARGETS.forEach(addSimpleReactMemo);

console.log('\n✅ React.memo optimization complete!');
