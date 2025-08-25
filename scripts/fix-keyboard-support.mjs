#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const workspaceRoot = process.cwd();

// Track fixes applied
let fixesApplied = {
  keyboardSupport: 0,
  filesModified: 0
};

// Priority files to focus on first (high-traffic user interface components)
const priorityPatterns = [
  'Navbar',
  'Modal', 
  'Button',
  'Card',
  'Form',
  'Input',
  'Chart'
];

// Keyboard support patterns - focus on actual problematic cases
const keyboardSupportFixes = [
  {
    // Fix div/span elements with onClick that lack keyboard support
    pattern: /(<(div|span)(?![^>]*onKeyDown)(?![^>]*role="button")(?![^>]*tabIndex)[^>]*onClick={[^}]+}[^>]*>)/g,
    fix: (match, element) => {
      // Add keyboard support with proper role and tabIndex
      const keyboardHandler = element.includes('onClick={') 
        ? element.replace(
            /onClick=\{([^}]+)\}/,
            'onClick={$1} onKeyDown={(e) => { if (e.key === \'Enter\' || e.key === \' \') { e.preventDefault(); ($1)(e); } }} role="button" tabIndex={0}'
          )
        : element;
      
      return keyboardHandler;
    },
    description: 'Add keyboard support to clickable div/span elements'
  },
  {
    // Fix interactive elements missing role and tabIndex
    pattern: /(<(div|span)[^>]*onClick={[^}]+}(?![^>]*role=)[^>]*>)/g,
    fix: (match, element) => {
      if (!element.includes('role=') && !element.includes('tabIndex=')) {
        return element.replace(/onClick={([^}]+)}/, 'onClick={$1} onKeyDown={(e) => { if (e.key === \'Enter\' || e.key === \' \') { e.preventDefault(); ($1)(e); } }} role="button" tabIndex={0}');
      }
      return match;
    },
    description: 'Add role and tabIndex to interactive elements'
  }
];

function findFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const files = [];
  
  function traverse(currentDir) {
    try {
      const entries = readdirSync(currentDir);
      
      for (const entry of entries) {
        const fullPath = join(currentDir, entry);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
          traverse(fullPath);
        } else if (stat.isFile() && extensions.includes(extname(entry).toLowerCase())) {
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

function isPriorityFile(filePath) {
  const fileName = filePath.split('/').pop() || '';
  return priorityPatterns.some(pattern => fileName.includes(pattern));
}

function hasProblematicClickHandlers(content) {
  // Check for div/span with onClick but missing keyboard support
  const problematicPatterns = [
    /<(div|span)[^>]*onClick={[^}]+}(?![^>]*onKeyDown)[^>]*>/g,
    /<(div|span)[^>]*onClick={[^}]+}(?![^>]*role="button")[^>]*>/g,
    /<(div|span)[^>]*onClick={[^}]+}(?![^>]*tabIndex)[^>]*>/g
  ];
  
  return problematicPatterns.some(pattern => pattern.test(content));
}

function applyKeyboardFixes(filePath, content) {
  let modifiedContent = content;
  let hasChanges = false;
  
  for (const fix of keyboardSupportFixes) {
    const originalContent = modifiedContent;
    modifiedContent = modifiedContent.replace(fix.pattern, fix.fix);
    
    if (originalContent !== modifiedContent) {
      hasChanges = true;
      const changeCount = (originalContent.match(fix.pattern) || []).length;
      fixesApplied.keyboardSupport += changeCount;
      console.log(`  ✅ ${fix.description}: ${changeCount} fixes`);
    }
  }
  
  return { content: modifiedContent, hasChanges };
}

function processFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    
    // Skip non-React component files
    if (!content.includes('React') && !content.includes('onClick')) {
      return;
    }

    // Skip files without problematic click handlers
    if (!hasProblematicClickHandlers(content)) {
      return;
    }
    
    console.log(`\n🔍 Processing: ${filePath.replace(workspaceRoot, '.')}`);
    
    // Apply keyboard support fixes
    const result = applyKeyboardFixes(filePath, content);
    
    if (result.hasChanges) {
      writeFileSync(filePath, result.content, 'utf8');
      fixesApplied.filesModified++;
      console.log(`  💾 File updated with keyboard support`);
    } else {
      console.log(`  ⚪ No keyboard issues found`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log('⌨️  Starting Keyboard Support Fixes - Phase 2 (A11Y-030)');
console.log('=======================================================\n');

// Find all React component files
const allFiles = [
  ...findFiles(join(workspaceRoot, 'apps')),
  ...findFiles(join(workspaceRoot, 'packages'))
].filter(file => 
  !file.includes('test') && 
  !file.includes('spec') && 
  !file.includes('.stories.') &&
  !file.includes('node_modules') &&
  !file.includes('dist')
);

// Prioritize high-traffic components first
const priorityFiles = allFiles.filter(isPriorityFile);
const otherFiles = allFiles.filter(file => !isPriorityFile(file));

console.log(`📁 Found ${allFiles.length} React component files`);
console.log(`🎯 Processing ${priorityFiles.length} priority files first\n`);

console.log('🎯 PRIORITY FILES (High-traffic components):');
console.log('==============================================');
priorityFiles.forEach(processFile);

console.log('\n📄 OTHER FILES:');
console.log('================');
// Process first 20 other files to avoid overwhelming output
otherFiles.slice(0, 20).forEach(processFile);

if (otherFiles.length > 20) {
  console.log(`\n⚠️  ${otherFiles.length - 20} additional files not processed in this batch`);
  console.log('   Run the script again to continue with remaining files');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Phase 2 Keyboard Support Summary');
console.log('='.repeat(50));
console.log(`⌨️  Keyboard Support Added: ${fixesApplied.keyboardSupport}`);
console.log(`📝 Total Files Modified: ${fixesApplied.filesModified}`);

if (fixesApplied.filesModified > 0) {
  console.log('\n✅ Keyboard support improvements applied!');
  console.log('🎯 Run the accessibility audit to verify improvements');
  console.log('💡 Consider manual review of complex interactive elements');
} else {
  console.log('\n🎉 No problematic click handlers found in this batch!');
  console.log('✨ Most components already use proper button elements or have keyboard support');
}
