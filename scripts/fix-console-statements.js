#!/usr/bin/env node

/**
 * Console Statement Migration Script
 * Converts console.log, console.warn, console.error to structured logging
 * For CosmicHub monorepo - supports TypeScript/JavaScript files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to exclude from processing
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.turbo',
  '*.test.',
  '*.spec.',
  'test-utils',
  'storybook',
  '*.stories.',
  'scripts',
  '*.config.',
  'README.md',
  '.log',
];

// Console patterns to replace
const CONSOLE_PATTERNS = [
  {
    pattern: /console\.log\s*\(/g,
    replacement: 'logger.info(',
    severity: 'info',
  },
  {
    pattern: /console\.warn\s*\(/g,
    replacement: 'logger.warn(',
    severity: 'warn',
  },
  {
    pattern: /console\.error\s*\(/g,
    replacement: 'logger.error(',
    severity: 'error',
  },
  {
    pattern: /console\.info\s*\(/g,
    replacement: 'logger.info(',
    severity: 'info',
  },
  {
    pattern: /console\.debug\s*\(/g,
    replacement: 'logger.debug(',
    severity: 'debug',
  },
];

// Dev console patterns (legitimate patterns to preserve)
const DEV_CONSOLE_PATTERNS = [
  'devConsole.log',
  'devConsole.warn',
  'devConsole.error',
  'devConsole.info',
  '.bind(console)',
  'console.log.bind(console)',
  'console.warn.bind(console)',
  'console.error.bind(console)',
];

function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(
    pattern =>
      filePath.includes(pattern) ||
      filePath.match(new RegExp(pattern.replace('*', '.*')))
  );
}

function hasDevConsolePattern(content) {
  return DEV_CONSOLE_PATTERNS.some(pattern => content.includes(pattern));
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;
    let consoleCount = 0;

    // Skip files that use devConsole patterns (they're already properly wrapped)
    if (hasDevConsolePattern(content)) {
      console.log(`⏭️  Skipping ${filePath} (uses devConsole pattern)`);
      return { processed: false, reason: 'devConsole' };
    }

    // Check if file has console statements to replace
    const hasConsole = CONSOLE_PATTERNS.some(({ pattern }) =>
      pattern.test(content)
    );
    if (!hasConsole) {
      return { processed: false, reason: 'no-console' };
    }

    // Add logger import if not present and if we're going to make changes
    const hasLoggerImport =
      content.includes('logger') &&
      (content.includes('import') || content.includes('require'));

    if (!hasLoggerImport) {
      // Determine the appropriate import based on file type and location
      let loggerImport = '';
      if (filePath.includes('packages/')) {
        loggerImport = "import { logger } from '../utils/logger';\n";
      } else if (filePath.includes('apps/')) {
        loggerImport =
          "import { logger } from '@cosmichub/config/src/utils/logger';\n";
      } else {
        // Fallback: create simple logger
        loggerImport = `
// Simple logger for structured logging
const logger = {
  info: (msg, data) => console.log(\`[INFO] \${msg}\`, data),
  warn: (msg, data) => console.warn(\`[WARN] \${msg}\`, data),
  error: (msg, data) => console.error(\`[ERROR] \${msg}\`, data),
  debug: (msg, data) => console.debug(\`[DEBUG] \${msg}\`, data)
};
`;
      }

      // Insert after existing imports or at the beginning
      const importMatch = content.match(/^((?:import.*\n)*)/m);
      if (importMatch) {
        newContent = content.replace(
          importMatch[0],
          importMatch[0] + loggerImport
        );
      } else {
        newContent = loggerImport + content;
      }
      hasChanges = true;
    }

    // Replace console statements
    CONSOLE_PATTERNS.forEach(({ pattern, replacement }) => {
      const matches = newContent.match(pattern);
      if (matches) {
        consoleCount += matches.length;
        newContent = newContent.replace(pattern, replacement);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, newContent);
      console.log(
        `✅ Processed ${filePath} (${consoleCount} console statements replaced)`
      );
      return { processed: true, consoleCount };
    }

    return { processed: false, reason: 'no-changes' };
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { processed: false, reason: 'error', error: error.message };
  }
}

function walkDirectory(dir, callback) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!shouldExclude(filePath)) {
        walkDirectory(filePath, callback);
      }
    } else if (stat.isFile()) {
      // Process TypeScript, JavaScript, and JSX files
      if (/\.(ts|tsx|js|jsx)$/.test(file) && !shouldExclude(filePath)) {
        callback(filePath);
      }
    }
  });
}

function main() {
  const startTime = Date.now();
  console.log('🚀 Starting console statement replacement...');
  console.log('📁 Processing workspace:', process.cwd());

  let totalFiles = 0;
  let processedFiles = 0;
  let totalConsoleReplacements = 0;
  let skippedFiles = { devConsole: 0, noConsole: 0, error: 0 };

  walkDirectory(process.cwd(), filePath => {
    totalFiles++;
    const result = processFile(filePath);

    if (result.processed) {
      processedFiles++;
      totalConsoleReplacements += result.consoleCount || 0;
    } else if (result.reason) {
      skippedFiles[result.reason] = (skippedFiles[result.reason] || 0) + 1;
    }
  });

  const duration = Date.now() - startTime;

  console.log('\n📊 Summary:');
  console.log(`⏱️  Duration: ${duration}ms`);
  console.log(`📁 Total files scanned: ${totalFiles}`);
  console.log(`✅ Files processed: ${processedFiles}`);
  console.log(`🔄 Console statements replaced: ${totalConsoleReplacements}`);
  console.log(`⏭️  Files skipped:`);
  console.log(`   - Dev console pattern: ${skippedFiles.devConsole || 0}`);
  console.log(`   - No console statements: ${skippedFiles.noConsole || 0}`);
  console.log(`   - Errors: ${skippedFiles.error || 0}`);

  if (processedFiles > 0) {
    console.log('\n🎉 Console statement replacement complete!');
    console.log('🔧 Next steps:');
    console.log('   1. Review the changes');
    console.log('   2. Run lint/build to check for issues');
    console.log('   3. Test the application');
    console.log('   4. Configure log file output in production');
  } else {
    console.log('\n✨ No console statements found to replace!');
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export functions for potential use as module
export { processFile, walkDirectory };
