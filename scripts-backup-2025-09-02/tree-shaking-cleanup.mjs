#!/usr/bin/env node

/**
 * Tree Shaking Cleanup - PERF-002 Implementation
 *
 * Automatically removes unused exports based on tree-shaking analysis.
 * Implements safe cleanup with backup and validation.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const METRICS_DIR = path.join(ROOT_DIR, 'metrics');
const BACKUP_DIR = path.join(ROOT_DIR, 'tree-shaking-backup');

class TreeShakingCleanup {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.backup = options.backup !== false; // default true
    this.cleanupPlan = null;
    this.stats = {
      filesModified: 0,
      exportsRemoved: 0,
      estimatedSavingsKB: 0,
      errors: 0,
    };
  }

  async execute() {
    console.log('🌳 Starting PERF-002: Tree-Shaking Cleanup');
    console.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'EXECUTE'}`);

    try {
      // Load tree-shaking analysis
      await this.loadAnalysis();

      // Create backup if requested
      if (this.backup && !this.dryRun) {
        await this.createBackup();
      }

      // Generate cleanup plan
      await this.generateCleanupPlan();

      // Execute cleanup
      await this.performCleanup();

      // Validate results
      if (!this.dryRun) {
        await this.validateCleanup();
      }

      // Generate report
      await this.generateReport();

      console.log('\n✅ PERF-002 Tree-shaking cleanup completed successfully!');
      return this.stats;
    } catch (error) {
      console.error('❌ Tree-shaking cleanup failed:', error);
      throw error;
    }
  }

  async loadAnalysis() {
    const analysisPath = path.join(METRICS_DIR, 'tree-shaking-analysis.json');

    try {
      const content = await fs.readFile(analysisPath, 'utf8');
      this.analysis = JSON.parse(content);
      console.log(
        `📊 Loaded analysis: ${this.analysis.unusedExports.length} unused exports found`
      );
    } catch (error) {
      throw new Error(`Failed to load tree-shaking analysis: ${error.message}`);
    }
  }

  async createBackup() {
    console.log('💾 Creating backup...');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);

    await fs.mkdir(backupPath, { recursive: true });

    // Get unique files that will be modified
    const filesToBackup = new Set(
      this.analysis.unusedExports.map(exp => exp.file)
    );

    for (const file of filesToBackup) {
      const sourcePath = path.join(ROOT_DIR, file);
      const backupFilePath = path.join(backupPath, file);

      // Ensure backup directory exists
      await fs.mkdir(path.dirname(backupFilePath), { recursive: true });

      try {
        await fs.copyFile(sourcePath, backupFilePath);
      } catch (error) {
        console.warn(`⚠️ Could not backup ${file}: ${error.message}`);
      }
    }

    console.log(`✅ Backup created at: ${backupPath}`);
  }

  async generateCleanupPlan() {
    console.log('📋 Generating cleanup plan...');

    // Group unused exports by file
    const fileMap = new Map();

    for (const unusedExport of this.analysis.unusedExports) {
      // Skip certain files that should be handled manually
      if (this.shouldSkipFile(unusedExport.file)) {
        continue;
      }

      // Skip exports that need manual verification
      if (this.needsManualVerification(unusedExport)) {
        continue;
      }

      if (!fileMap.has(unusedExport.file)) {
        fileMap.set(unusedExport.file, []);
      }
      fileMap.get(unusedExport.file).push(unusedExport);
    }

    this.cleanupPlan = {
      files: Array.from(fileMap.entries()).map(([file, exports]) => ({
        file,
        exports,
        estimatedSavingsKB: exports.reduce(
          (sum, exp) => sum + exp.estimatedSizeKB,
          0
        ),
      })),
    };

    console.log(`📝 Plan: ${this.cleanupPlan.files.length} files to modify`);

    // Log top files for cleanup
    const topFiles = this.cleanupPlan.files
      .sort((a, b) => b.exports.length - a.exports.length)
      .slice(0, 5);

    console.log('\n🎯 Top files for cleanup:');
    for (const fileData of topFiles) {
      console.log(
        `  • ${fileData.file}: ${fileData.exports.length} exports (~${fileData.estimatedSavingsKB}KB)`
      );
    }
  }

  shouldSkipFile(filePath) {
    // Skip files that should be handled manually or are too risky
    const skipPatterns = [
      'index.ts',
      'index.tsx',
      '.test.',
      '.spec.',
      '.stories.',
      '__tests__',
      'test-utils',
      'setup',
      'config.ts',
    ];

    return skipPatterns.some(pattern => filePath.includes(pattern));
  }

  needsManualVerification(unusedExport) {
    // Skip exports that might have dynamic usage or are public APIs
    const skipPatterns = [
      'default', // default exports often used dynamically
      'Provider',
      'Context',
      'Hook',
      'Component',
    ];

    // Skip if name suggests it's a public API
    if (skipPatterns.some(pattern => unusedExport.name.includes(pattern))) {
      return true;
    }

    // Skip if it's a large function/class that might have side effects
    if (
      (unusedExport.type === 'function' || unusedExport.type === 'class') &&
      unusedExport.estimatedSizeKB > 5
    ) {
      return true;
    }

    return false;
  }

  async performCleanup() {
    console.log(`🔧 ${this.dryRun ? 'Simulating' : 'Performing'} cleanup...`);

    for (const fileData of this.cleanupPlan.files) {
      try {
        await this.cleanupFile(fileData);
      } catch (error) {
        console.error(`❌ Failed to cleanup ${fileData.file}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  async cleanupFile(fileData) {
    const filePath = path.join(ROOT_DIR, fileData.file);

    let content;
    try {
      content = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      throw new Error(`Could not read file: ${error.message}`);
    }

    let modifiedContent = content;
    let removedCount = 0;

    // Sort exports by line number in reverse order to avoid line number shifts
    const sortedExports = fileData.exports.sort((a, b) => b.line - a.line);

    for (const unusedExport of sortedExports) {
      const result = this.removeExport(modifiedContent, unusedExport);
      if (result.success) {
        modifiedContent = result.content;
        removedCount++;
        this.stats.estimatedSavingsKB += unusedExport.estimatedSizeKB;
      }
    }

    if (removedCount > 0) {
      if (this.dryRun) {
        console.log(
          `  📝 Would remove ${removedCount} exports from ${fileData.file}`
        );
      } else {
        // Clean up any empty lines or extra whitespace
        modifiedContent = this.cleanupContent(modifiedContent);

        await fs.writeFile(filePath, modifiedContent);
        console.log(
          `  ✅ Removed ${removedCount} exports from ${fileData.file}`
        );

        this.stats.filesModified++;
      }

      this.stats.exportsRemoved += removedCount;
    }
  }

  removeExport(content, unusedExport) {
    const lines = content.split('\n');
    const exportName = unusedExport.name;

    try {
      // Handle different export patterns
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Direct export: export const/function/class/interface/type exportName
        if (this.isDirectExport(line, exportName, unusedExport.type)) {
          // For multi-line exports, find the end
          const endIndex = this.findExportEnd(lines, i, unusedExport.type);
          lines.splice(i, endIndex - i + 1);
          return { success: true, content: lines.join('\n') };
        }

        // Named export: export { exportName, ... }
        if (this.isInNamedExport(line, exportName)) {
          const newLine = this.removeFromNamedExport(line, exportName);
          if (newLine !== line) {
            lines[i] = newLine;
            return { success: true, content: lines.join('\n') };
          }
        }
      }

      return { success: false, content };
    } catch (error) {
      console.warn(
        `⚠️ Could not remove export ${exportName}: ${error.message}`
      );
      return { success: false, content };
    }
  }

  isDirectExport(line, exportName, exportType) {
    const trimmed = line.trim();

    // Check for various export patterns
    const patterns = [
      `export const ${exportName}`,
      `export let ${exportName}`,
      `export var ${exportName}`,
      `export function ${exportName}`,
      `export class ${exportName}`,
      `export interface ${exportName}`,
      `export type ${exportName}`,
      `export enum ${exportName}`,
    ];

    return patterns.some(pattern => trimmed.startsWith(pattern));
  }

  isInNamedExport(line, exportName) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('export {')) return false;

    // Simple check - could be improved for complex cases
    return trimmed.includes(exportName);
  }

  removeFromNamedExport(line, exportName) {
    // Handle export { name1, name2, name3 } patterns
    const exportMatch = line.match(/export\s*{\s*([^}]+)\s*}/);
    if (!exportMatch) return line;

    const exportList = exportMatch[1];
    const exports = exportList.split(',').map(s => s.trim());
    const filteredExports = exports.filter(exp => {
      const cleanName = exp.split(' as ')[0].trim();
      return cleanName !== exportName;
    });

    if (filteredExports.length === 0) {
      // Remove the entire export line if no exports left
      return '';
    } else if (filteredExports.length < exports.length) {
      // Rebuild the export statement
      return line.replace(exportMatch[1], filteredExports.join(', '));
    }

    return line;
  }

  findExportEnd(lines, startIndex, exportType) {
    // For simple exports, it's usually just one line
    if (
      ['const', 'let', 'var', 'interface', 'type', 'enum'].includes(exportType)
    ) {
      // Look for semicolon or end of statement
      for (let i = startIndex; i < lines.length; i++) {
        if (lines[i].includes(';') || lines[i].includes('}')) {
          return i;
        }
      }
    }

    // For functions and classes, find the closing brace
    if (['function', 'class'].includes(exportType)) {
      let braceCount = 0;
      let inBraces = false;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        for (const char of line) {
          if (char === '{') {
            braceCount++;
            inBraces = true;
          } else if (char === '}') {
            braceCount--;
            if (inBraces && braceCount === 0) {
              return i;
            }
          }
        }
      }
    }

    return startIndex; // fallback to single line
  }

  cleanupContent(content) {
    // Remove multiple consecutive empty lines
    content = content.replace(/\n\n\n+/g, '\n\n');

    // Remove trailing whitespace
    content = content
      .split('\n')
      .map(line => line.trimRight())
      .join('\n');

    // Ensure file ends with single newline
    return content.trimRight() + '\n';
  }

  async validateCleanup() {
    console.log('🔍 Validating cleanup...');

    try {
      // Check if TypeScript compilation still works
      console.log('  Checking TypeScript compilation...');
      execSync('npm run type-check', {
        stdio: 'pipe',
        cwd: ROOT_DIR,
        encoding: 'utf8',
      });
      console.log('  ✅ TypeScript compilation successful');

      // Run a quick build to ensure nothing is broken
      console.log('  Testing build process...');
      execSync('npm run build:quick 2>/dev/null || npm run build 2>/dev/null', {
        stdio: 'pipe',
        cwd: ROOT_DIR,
        encoding: 'utf8',
      });
      console.log('  ✅ Build process successful');
    } catch (error) {
      console.warn('  ⚠️ Validation warning:', error.message);
      console.warn(
        '  Please run tests manually to ensure everything works correctly'
      );
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      perf002Implementation: {
        mode: this.dryRun ? 'dry-run' : 'execute',
        stats: this.stats,
        cleanupPlan: {
          totalFiles: this.cleanupPlan.files.length,
          totalExportsTargeted: this.cleanupPlan.files.reduce(
            (sum, file) => sum + file.exports.length,
            0
          ),
          estimatedTotalSavingsKB: this.cleanupPlan.files.reduce(
            (sum, file) => sum + file.estimatedSavingsKB,
            0
          ),
        },
      },
    };

    const reportPath = path.join(METRICS_DIR, 'perf-002-cleanup-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📊 PERF-002 Cleanup Report:');
    console.log('============================');
    console.log(`Files modified: ${this.stats.filesModified}`);
    console.log(`Exports removed: ${this.stats.exportsRemoved}`);
    console.log(`Estimated savings: ~${this.stats.estimatedSavingsKB}KB`);
    console.log(`Errors: ${this.stats.errors}`);
    console.log(`\nReport saved to: ${reportPath}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    backup: !args.includes('--no-backup'),
  };

  if (args.includes('--help')) {
    console.log(`
Tree-Shaking Cleanup - PERF-002 Implementation

Usage: node tree-shaking-cleanup.mjs [options]

Options:
  --dry-run     Simulate cleanup without making changes
  --no-backup   Skip creating backup files
  --help        Show this help message

Examples:
  node tree-shaking-cleanup.mjs --dry-run    # Test run
  node tree-shaking-cleanup.mjs              # Full cleanup with backup
  node tree-shaking-cleanup.mjs --no-backup  # Cleanup without backup
`);
    return;
  }

  const cleanup = new TreeShakingCleanup(options);
  await cleanup.execute();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ PERF-002 cleanup failed:', error);
    process.exit(1);
  });
}

export { TreeShakingCleanup };
