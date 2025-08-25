#!/usr/bin/env node
/* eslint-env node */
/* global console, process */

import fs from 'fs';
import path from 'path';

// All files that need fixing based on the error output
const filesToFix = [
  'apps/astro/src/components/NumerologyCalculator/NumerologyCalculator.tsx',
  'apps/astro/src/components/SimpleBirthForm.tsx',
  'apps/astro/src/components/TransitAnalysis/DateRangeForm.tsx',
  'apps/astro/src/pages/Login.tsx',
  'apps/astro/src/pages/Numerology.tsx',
  'apps/astro/src/pages/SignUp.tsx',
  'apps/astro/src/pages/Synastry.tsx',
];

function fixFile(filePath) {
  try {
    console.log(`Fixing: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Pattern 1: Fix / aria-label="..." -> aria-label="..."
    const pattern1 = /(\s+)\/\s+aria-label="([^"]*)">/g;
    if (pattern1.test(content)) {
      content = content.replace(pattern1, '$1aria-label="$2"\n$1/>');
      changed = true;
      console.log('  ✓ Fixed: / aria-label pattern');
    }

    // Pattern 2: Fix malformed type annotations like ChangeEvent<HTMLInputElement aria-label="...">
    const pattern2 = /ChangeEvent<HTMLInputElement\s+aria-label="[^"]*">/g;
    if (pattern2.test(content)) {
      content = content.replace(pattern2, 'ChangeEvent<HTMLInputElement>');
      changed = true;
      console.log('  ✓ Fixed: malformed type annotation');
    }

    // Pattern 3: Move aria-label from inside type to proper attribute position
    const pattern3 =
      /onChange=\{([^}]*ChangeEvent<HTMLInputElement)\s+aria-label="([^"]*)"([^}]*)\}/g;
    if (pattern3.test(content)) {
      content = content.replace(pattern3, (match, before, label, after) => {
        return `onChange={${before}${after}}\n            aria-label="${label}"`;
      });
      changed = true;
      console.log('  ✓ Fixed: moved aria-label from type to attribute');
    }

    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${filePath}\n`);
    } else {
      console.log(`📝 No changes needed: ${filePath}\n`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

console.log('🔧 Fixing all JSX syntax errors...\n');

filesToFix.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    fixFile(fullPath);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('✨ All JSX syntax fixes completed!');
