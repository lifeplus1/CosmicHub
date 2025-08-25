#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to fix
const filesToFix = [
  'apps/astro/src/features/healwave/components/AudioPlayer.tsx',
  'apps/astro/src/features/healwave/components/FrequencyControls.tsx',
  'apps/astro/src/components/UnifiedBirthInput.tsx',
  'apps/astro/src/components/Login.tsx',
  'apps/astro/src/components/NotificationSettings.tsx',
  'apps/astro/src/components/ChartPreferences.tsx',
  'apps/astro/src/components/BlogSubscription.tsx',
  'apps/astro/src/pages/ChartWheel.tsx',
  'apps/astro/src/pages/Blog.tsx',
  'apps/astro/src/pages/MultiSystemChart.tsx',
  'apps/healwave/src/components/FrequencyControls.tsx',
  'apps/healwave/src/components/PresetSelector.tsx'
];

function fixFile(filePath) {
  try {
    console.log(`Fixing: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Pattern 1: onChange={(e) = aria-label="input"> function}
    content = content.replace(
      /onChange=\{([^}]*) = aria-label="[^"]*">\s*([^}]*)\}/g,
      'onChange={$1 => $2}'
    );
    
    // Pattern 2: onChange={e = aria-label="input"> function}
    content = content.replace(
      /onChange=\{([^}=]*) = aria-label="[^"]*">\s*([^}]*)\}/g,
      'onChange={($1) => $2}'
    );
    
    // Pattern 3: / aria-label="input"> to aria-label="input"
    content = content.replace(
      /\/ aria-label="([^"]*)">/g,
      'aria-label="$1"'
    );
    
    // Pattern 4: Fix malformed type annotations ChangeEvent<HTMLInputElement aria-label="...">
    content = content.replace(
      /ChangeEvent<HTMLInputElement aria-label="[^"]*">/g,
      'ChangeEvent<HTMLInputElement>'
    );
    
    // Pattern 5: Fix onChange={() = aria-label="input"> to onChange={() => 
    content = content.replace(
      /onChange=\{[^}]*= aria-label="[^"]*">/g,
      'onChange={() =>'
    );

    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

console.log('🔧 Fixing JSX syntax errors...\n');

filesToFix.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    fixFile(fullPath);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n✨ JSX syntax fix completed!');
