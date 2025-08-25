#!/usr/bin/env node

/**
 * Automated A11Y-030 Issue Remediation Script
 * Systematically fixes accessibility violations identified in the audit
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { dirname, join, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Track fixes applied
const fixes = {
  applied: 0,
  critical: 0,
  major: 0,
  minor: 0,
};

console.log('🔧 A11Y-030: Starting systematic accessibility remediation...\n');

// =============================================================================
// FILE DISCOVERY
// =============================================================================

/**
 * Recursively find files with given extensions
 */
function findFiles(dir, extensions = ['.tsx', '.jsx']) {
  const files = [];

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules and test directories
        if (
          entry !== 'node_modules' &&
          entry !== '__tests__' &&
          !entry.startsWith('.')
        ) {
          files.push(...findFiles(fullPath, extensions));
        }
      } else if (stat.isFile()) {
        const ext = extname(entry);
        if (
          extensions.includes(ext) &&
          !entry.includes('.test.') &&
          !entry.includes('.spec.')
        ) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}:`, error.message);
  }

  return files;
}

// =============================================================================
// CRITICAL FIXES - Missing Labels, Alt Text, Modal ARIA
// =============================================================================

/**
 * Fix missing input labels by adding proper labeling
 */
function fixInputLabels(content, filePath) {
  let modified = false;

  // Look for input elements without labels or aria-label
  const inputPattern = /<input\s+([^>]*?)>/g;
  let match;

  while ((match = inputPattern.exec(content)) !== null) {
    const inputTag = match[0];
    const attributes = match[1];

    // Skip if already has label or aria-label
    if (
      inputTag.includes('aria-label') ||
      inputTag.includes('aria-labelledby')
    ) {
      continue;
    }

    // Check if there's a placeholder we can use as label
    const placeholderMatch = attributes.match(/placeholder=["']([^"']*?)["']/);
    const typeMatch = attributes.match(/type=["']([^"']*?)["']/);

    const label = placeholderMatch
      ? placeholderMatch[1]
      : typeMatch
        ? `${typeMatch[1]} input`
        : 'Input field';

    // Add aria-label to the input
    const fixedInput = inputTag.replace('>', ` aria-label="${label}">`);
    content = content.replace(inputTag, fixedInput);

    modified = true;
    fixes.critical++;
  }

  return { content, modified };
}

/**
 * Fix missing image alt text
 */
function fixImageAltText(content, filePath) {
  let modified = false;

  // Find img tags without alt attribute
  const imgPattern = /<img\s+([^>]*?)>/g;
  let match;

  while ((match = imgPattern.exec(content)) !== null) {
    const imgTag = match[0];
    const attributes = match[1];

    // Skip if already has alt
    if (imgTag.includes('alt=')) {
      continue;
    }

    // Extract src for meaningful alt text
    const srcMatch = attributes.match(/src=["']([^"']*?)["']/);
    let altText = 'Image';

    if (srcMatch) {
      const filename = srcMatch[1].split('/').pop()?.split('.')[0];
      if (filename) {
        altText = filename
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
      }
    }

    // Add alt attribute
    const fixedImg = imgTag.replace('>', ` alt="${altText}">`);
    content = content.replace(imgTag, fixedImg);

    modified = true;
    fixes.critical++;
  }

  return { content, modified };
}

// =============================================================================
// MAJOR FIXES - Missing Keyboard Support
// =============================================================================

/**
 * Fix missing keyboard support for click handlers
 */
function fixKeyboardSupport(content, filePath) {
  let modified = false;

  // Look for div/span elements with onClick but no keyboard support
  const clickablePattern =
    /<(div|span)\s+([^>]*?)onClick=\{([^}]*?)\}([^>]*?)>/g;
  let match;

  while ((match = clickablePattern.exec(content)) !== null) {
    const fullTag = match[0];
    const tagName = match[1];
    const beforeOnClick = match[2];
    const onClickHandler = match[3];
    const afterOnClick = match[4];

    // Skip if already has keyboard support
    if (
      fullTag.includes('onKeyDown') ||
      fullTag.includes('tabIndex') ||
      fullTag.includes('role=')
    ) {
      continue;
    }

    // Add keyboard support and role
    const keyboardHandler = `onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); (${onClickHandler})(e); } }}`;
    const fixedTag = `<${tagName} ${beforeOnClick}onClick={${onClickHandler}} ${keyboardHandler} tabIndex={0} role="button"${afterOnClick}>`;

    content = content.replace(fullTag, fixedTag);

    modified = true;
    fixes.major++;
  }

  return { content, modified };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Apply all fixes to a file
 */
function fixFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    const originalContent = content;
    let hasChanges = false;

    const relativePath = filePath.replace(projectRoot, '.');

    // Apply fixes in order of priority
    const fixFunctions = [
      fixInputLabels, // Critical
      fixImageAltText, // Critical
      fixKeyboardSupport, // Major
    ];

    for (const fixFunc of fixFunctions) {
      const result = fixFunc(content, filePath);
      if (result.modified) {
        content = result.content;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      writeFileSync(filePath, content, 'utf-8');
      fixes.applied++;
      console.log(`  ✅ Applied fixes to ${relativePath}`);
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
  }
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

function main() {
  // Find all React files to process
  const directories = [
    join(projectRoot, 'apps/astro/src'),
    join(projectRoot, 'apps/healwave/src'),
    join(projectRoot, 'packages/ui/src'),
  ];

  const files = [];
  for (const dir of directories) {
    try {
      files.push(...findFiles(dir));
    } catch (error) {
      console.warn(`Warning: Could not scan ${dir}:`, error.message);
    }
  }

  console.log(`📁 Found ${files.length} files to process\n`);

  // Process files in batches to avoid overwhelming output
  let processedCount = 0;
  for (const file of files) {
    fixFile(file);
    processedCount++;

    // Progress update every 50 files
    if (processedCount % 50 === 0) {
      console.log(
        `� Progress: ${processedCount}/${files.length} files processed`
      );
    }
  }

  // Summary
  console.log('\n🎯 A11Y-030 Remediation Summary:');
  console.log(`  📁 Files processed: ${files.length}`);
  console.log(`  ✅ Files modified: ${fixes.applied}`);
  console.log(`  🚨 Critical fixes: ${fixes.critical}`);
  console.log(`  🔧 Major fixes: ${fixes.major}`);
  console.log(`  📋 Minor fixes: ${fixes.minor}\n`);

  if (fixes.applied > 0) {
    console.log('🔄 Run the accessibility audit again to verify fixes:');
    console.log('   node scripts/accessibility-audit.mjs\n');
  } else {
    console.log(
      'ℹ️  No automated fixes were applied. Manual intervention may be needed.\n'
    );
  }

  console.log('✨ A11Y-030 automated remediation complete!');
}

// Run the script
main();
