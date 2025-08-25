#!/usr/bin/env node
/* eslint-env node */
/* global console, process */

const fs = require('fs');
const path = require('path');

// All files that need fixing based on the error output
const filesToFix = [
  'apps/astro/src/components/BlogSubscription.tsx',
  'apps/astro/src/components/ChartPreferences.tsx', 
  'apps/astro/src/components/NumerologyCalculator/NumerologyCalculator.tsx',
  'apps/astro/src/components/SimpleBirthForm.tsx',
  'apps/astro/src/components/TransitAnalysis/DateRangeForm.tsx',
  'apps/astro/src/pages/Blog.tsx',
  'apps/astro/src/pages/Login.tsx',
  'apps/astro/src/pages/MultiSystemChart.tsx',
  'apps/astro/src/pages/Numerology.tsx',
  'apps/astro/src/pages/SignUp.tsx',
  'apps/astro/src/pages/Synastry.tsx'
];

function fixFile(filePath) {
  try {
    console.log(`Fixing: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Pattern 1: onChange={(e) = aria-label="input"> to onChange={(e) =>
    const pattern1 = /onChange=\{([^}]*) = aria-label="[^"]*">\s*([^}]*)\}/g;
    if (pattern1.test(content)) {
      content = content.replace(pattern1, 'onChange={$1 => $2}');
      changed = true;
    }
    
    // Pattern 2: onChange={e = aria-label="input"> to onChange={(e) =>
    const pattern2 = /onChange=\{([^}=\s]*) = aria-label="[^"]*">\s*([^}]*)\}/g;
    if (pattern2.test(content)) {
      content = content.replace(pattern2, 'onChange={($1) => $2}');
      changed = true;
    }
    
    // Pattern 3: / aria-label="input"> to aria-label="input"
    const pattern3 = /\/ aria-label="([^"]*)"/g;
    if (pattern3.test(content)) {
      content = content.replace(pattern3, 'aria-label="$1"');
      changed = true;
    }
    
    // Pattern 4: Fix malformed type annotations
    const pattern4 = /ChangeEvent<HTMLInputElement aria-label="[^"]*">/g;
    if (pattern4.test(content)) {
      content = content.replace(pattern4, 'ChangeEvent<HTMLInputElement>');
      changed = true;
    }
    
    // Pattern 5: onChange={() = aria-label="input"> to onChange={() =>
    const pattern5 = /onChange=\{\(\)\s*= aria-label="[^"]*">/g;
    if (pattern5.test(content)) {
      content = content.replace(pattern5, 'onChange={() =>');
      changed = true;
    }
    
    // Pattern 6: More specific - onChange={(e) = aria-label="something"> something} 
    const pattern6 = /onChange=\{[^}]* = aria-label="[^"]*">[^}]*\}/g;
    if (pattern6.test(content)) {
      // This needs manual inspection, let's just log it
      console.log(`⚠️  Complex pattern found in ${filePath} - needs manual fix`);
    }

    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`📝 No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

console.log('🔧 Fixing JSX syntax errors (comprehensive)...\n');

filesToFix.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    fixFile(fullPath);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n✨ JSX syntax fix completed!');
