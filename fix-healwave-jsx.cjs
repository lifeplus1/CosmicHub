#!/usr/bin/env node
/* eslint-env node */
/* global console, process */

const fs = require('fs');
const path = require('path');

// HealWave files that need fixing based on the error output
const filesToFix = [
  'apps/healwave/src/components/FrequencyGenerator.tsx',
  'apps/healwave/src/components/Login.tsx',
  'apps/healwave/src/components/PresetSelector.tsx',
  'apps/healwave/src/components/Signup.tsx',
];

function fixFile(filePath) {
  try {
    console.log(`Fixing: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Pattern 1: onChange={() = aria-label="radio input"> to onChange={() =>
    const pattern1 = /onChange=\{\(\)\s*=\s*aria-label="[^"]*">\s*([^}]*)\}/g;
    if (pattern1.test(content)) {
      content = content.replace(pattern1, 'onChange={() => $1}');
      changed = true;
      console.log('  ✓ Fixed: onChange={() = aria-label pattern');
    }

    // Pattern 2: onChange={e = aria-label="input"> to onChange={(e) =>
    const pattern2 =
      /onChange=\{([^}=\s]*)\s*=\s*aria-label="[^"]*">\s*([^}]*)\}/g;
    if (pattern2.test(content)) {
      content = content.replace(pattern2, 'onChange={($1) => $2}');
      changed = true;
      console.log('  ✓ Fixed: onChange={e = aria-label pattern');
    }

    // Pattern 3: Fix malformed type annotations like ChangeEvent<HTMLInputElement aria-label="text input">
    const pattern3 = /ChangeEvent<HTMLInputElement\s+aria-label="[^"]*">/g;
    if (pattern3.test(content)) {
      content = content.replace(pattern3, 'ChangeEvent<HTMLInputElement>');
      changed = true;
      console.log('  ✓ Fixed: malformed type annotation');
    }

    // Pattern 4: Clean up any stray aria-label attributes that are in the wrong place
    const pattern4 = /\s+aria-label="[^"]*">\s*([^}]+)}/g;
    if (pattern4.test(content)) {
      content = content.replace(pattern4, ' $1}');
      changed = true;
      console.log('  ✓ Fixed: misplaced aria-label');
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

console.log('🔧 Fixing HealWave JSX syntax errors...\n');

filesToFix.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    fixFile(fullPath);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('✨ HealWave JSX syntax fix completed!');
