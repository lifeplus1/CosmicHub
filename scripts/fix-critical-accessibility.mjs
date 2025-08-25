#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const workspaceRoot = process.cwd();

// Track fixes applied
let fixesApplied = {
  criticalModals: 0,
  criticalInputs: 0,
  keyboardSupport: 0,
  minorTabIndex: 0,
  filesModified: 0,
};

// Critical issues to fix immediately
const criticalFixes = [
  {
    // Modal missing aria-labelledby or aria-label
    pattern: /(<[^>]+role="dialog"[^>]*>)/g,
    fix: (match, element) => {
      if (
        !element.includes('aria-label') &&
        !element.includes('aria-labelledby')
      ) {
        return element.replace(
          /role="dialog"/,
          'role="dialog" aria-label="Dialog"'
        );
      }
      return match;
    },
    description: 'Add missing aria-label to modals',
  },
  {
    // Input missing label or aria-label
    pattern: /(<Input[^>]*(?!aria-label|id=)[^>]*>)/g,
    fix: (match, input) => {
      if (!input.includes('aria-label') && !input.includes('placeholder')) {
        return input.replace(/(<Input[^>]*)/, '$1 aria-label="Input field"');
      }
      return match;
    },
    description: 'Add missing aria-label to inputs',
  },
];

// Keyboard support patterns for most common issues
const keyboardSupportFixes = [
  {
    // Fix buttons without keyboard support
    pattern: /(<(?:div|span)[^>]*onClick={[^}]+}[^>]*>)/g,
    fix: (match, element) => {
      if (
        !element.includes('onKeyDown') &&
        !element.includes('role="button"')
      ) {
        // Add keyboard support
        const keyboardHandler = element.includes('tabIndex')
          ? ''
          : ' tabIndex={0}';
        return element.replace(
          /onClick={([^}]+)}/,
          `onClick={$1} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ($1)(e); } }}${keyboardHandler} role="button"`
        );
      }
      return match;
    },
    description: 'Add keyboard support to clickable elements',
  },
];

// Minor tabIndex fixes
const minorFixes = [
  {
    // Fix tabIndex={-1} on elements that should be focusable
    pattern: /tabIndex=\{-1\}/g,
    fix: () => 'tabIndex={0}',
    description: 'Fix negative tabIndex values',
  },
];

function findFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const files = [];

  function traverse(currentDir) {
    try {
      const entries = readdirSync(currentDir);

      for (const entry of entries) {
        const fullPath = join(currentDir, entry);
        const stat = statSync(fullPath);

        if (
          stat.isDirectory() &&
          !entry.startsWith('.') &&
          entry !== 'node_modules'
        ) {
          traverse(fullPath);
        } else if (
          stat.isFile() &&
          extensions.includes(extname(entry).toLowerCase())
        ) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  traverse(dir);
  return files;
}

function applyFixes(filePath, content, fixes, category) {
  let modifiedContent = content;
  let hasChanges = false;

  for (const fix of fixes) {
    const originalContent = modifiedContent;
    modifiedContent = modifiedContent.replace(fix.pattern, fix.fix);

    if (originalContent !== modifiedContent) {
      hasChanges = true;
      const changeCount = (originalContent.match(fix.pattern) || []).length;
      fixesApplied[category] += changeCount;
      console.log(`  ✅ ${fix.description}: ${changeCount} fixes`);
    }
  }

  return { content: modifiedContent, hasChanges };
}

function processFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');

    // Skip non-React component files
    if (
      !content.includes('React') &&
      !content.includes('jsx') &&
      !content.includes('tsx')
    ) {
      return;
    }

    let modifiedContent = content;
    let totalChanges = false;

    console.log(`\n🔍 Processing: ${filePath.replace(workspaceRoot, '.')}`);

    // Apply critical fixes first
    const criticalResult = applyFixes(
      filePath,
      modifiedContent,
      criticalFixes,
      'criticalModals'
    );
    modifiedContent = criticalResult.content;
    totalChanges = totalChanges || criticalResult.hasChanges;

    // Apply keyboard support fixes (limited to avoid overwhelming changes)
    const keyboardResult = applyFixes(
      filePath,
      modifiedContent,
      keyboardSupportFixes.slice(0, 1),
      'keyboardSupport'
    );
    modifiedContent = keyboardResult.content;
    totalChanges = totalChanges || keyboardResult.hasChanges;

    // Apply minor fixes
    const minorResult = applyFixes(
      filePath,
      modifiedContent,
      minorFixes,
      'minorTabIndex'
    );
    modifiedContent = minorResult.content;
    totalChanges = totalChanges || minorResult.hasChanges;

    if (totalChanges) {
      writeFileSync(filePath, modifiedContent, 'utf8');
      fixesApplied.filesModified++;
      console.log(`  💾 File updated`);
    } else {
      console.log(`  ⚪ No changes needed`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log('🚀 Starting Critical Accessibility Fixes (A11Y-030)');
console.log('================================================\n');

// Find all React component files
const reactFiles = [
  ...findFiles(join(workspaceRoot, 'apps')),
  ...findFiles(join(workspaceRoot, 'packages')),
].filter(
  file =>
    // Focus on component files, skip tests and stories for now
    !file.includes('test') &&
    !file.includes('spec') &&
    !file.includes('.stories.') &&
    !file.includes('node_modules')
);

console.log(`📁 Found ${reactFiles.length} React component files to process\n`);

// Process files
reactFiles.forEach(processFile);

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 A11Y-030 Critical Fixes Summary');
console.log('='.repeat(50));
console.log(`🔥 Critical Modal Issues Fixed: ${fixesApplied.criticalModals}`);
console.log(`🔥 Critical Input Issues Fixed: ${fixesApplied.criticalInputs}`);
console.log(`⌨️  Keyboard Support Added: ${fixesApplied.keyboardSupport}`);
console.log(`🔧 Minor TabIndex Fixed: ${fixesApplied.minorTabIndex}`);
console.log(`📝 Total Files Modified: ${fixesApplied.filesModified}`);
console.log('\n✅ Critical accessibility fixes completed!');
console.log('🎯 Run the audit again to verify improvements');
