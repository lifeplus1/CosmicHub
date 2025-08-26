#!/usr/bin/env node

/**
 * Tree Shaking Analyzer - PERF-001 Implementation
 * 
 * Analyzes TypeScript/JavaScript files to identify unused exports and
 * generates recommendations for tree-shaking optimizations.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const METRICS_DIR = path.join(ROOT_DIR, 'metrics');

// Directories to analyze
const ANALYSIS_DIRS = [
  'packages/types/src',
  'packages/ui/src',
  'packages/config/src',
  'packages/auth/src',
  'packages/integrations/src',
  'packages/storage/src',
  'apps/astro/src',
  'apps/healwave/src'
];

// File extensions to analyze
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

class TreeShakingAnalyzer {
  constructor() {
    this.exports = new Map(); // file -> [exports]
    this.imports = new Map(); // file -> [imports]
    this.unusedExports = [];
    this.recommendations = [];
    this.stats = {
      totalFiles: 0,
      totalExports: 0,
      unusedExports: 0,
      potentialSavingsKB: 0
    };
  }

  async analyze() {
    console.log('🌳 Starting tree-shaking analysis...');
    
    // Ensure metrics directory exists
    await fs.mkdir(METRICS_DIR, { recursive: true });
    
    // Analyze each directory
    for (const dir of ANALYSIS_DIRS) {
      const fullPath = path.join(ROOT_DIR, dir);
      if (await this.pathExists(fullPath)) {
        await this.analyzeDirectory(fullPath, dir);
      }
    }
    
    // Find unused exports
    this.findUnusedExports();
    
    // Generate recommendations
    this.generateRecommendations();
    
    // Save results
    await this.saveResults();
    
    // Log summary
    this.logSummary();
    
    return {
      unusedCount: this.unusedExports.length,
      recommendations: this.recommendations,
      stats: this.stats
    };
  }

  async pathExists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async analyzeDirectory(dirPath, relativePath) {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dirPath, file.name);
      const relativeFilePath = path.join(relativePath, file.name);
      
      if (file.isDirectory() && !file.name.startsWith('.') && !file.name.includes('node_modules')) {
        await this.analyzeDirectory(filePath, relativeFilePath);
      } else if (file.isFile() && EXTENSIONS.some(ext => file.name.endsWith(ext))) {
        await this.analyzeFile(filePath, relativeFilePath);
        this.stats.totalFiles++;
      }
    }
  }

  async analyzeFile(filePath, relativeFilePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      const fileExports = this.extractExports(content, relativeFilePath);
      const fileImports = this.extractImports(content, relativeFilePath);
      
      if (fileExports.length > 0) {
        this.exports.set(relativeFilePath, fileExports);
        this.stats.totalExports += fileExports.length;
      }
      
      if (fileImports.length > 0) {
        this.imports.set(relativeFilePath, fileImports);
      }
      
    } catch (error) {
      console.warn(`⚠️ Failed to analyze ${relativeFilePath}:`, error.message);
    }
  }

  extractExports(content, filePath) {
    const exports = [];
    
    // Named exports: export { foo, bar }
    const namedExportMatches = content.matchAll(/export\s*{\s*([^}]+)\s*}/g);
    for (const match of namedExportMatches) {
      const names = match[1].split(',').map(s => s.trim().split(' as ')[0].trim());
      exports.push(...names);
    }
    
    // Direct exports: export const foo = ...
    const directExportMatches = content.matchAll(/export\s+(const|let|var|function|class|interface|type|enum)\s+(\w+)/g);
    for (const match of directExportMatches) {
      exports.push(match[2]);
    }
    
    // Default export
    if (content.includes('export default')) {
      exports.push('default');
    }
    
    // Re-exports: export * from ...
    const reExportMatches = content.matchAll(/export\s+\*\s+from\s+['"`]([^'"`]+)['"`]/g);
    for (const match of reExportMatches) {
      exports.push(`*:${match[1]}`);
    }
    
    return exports.map(name => ({
      name,
      file: filePath,
      line: this.findExportLine(content, name),
      type: this.getExportType(content, name)
    }));
  }

  extractImports(content, filePath) {
    const imports = [];
    
    // Named imports: import { foo, bar } from './module'
    const namedImportMatches = content.matchAll(/import\s*{\s*([^}]+)\s*}\s*from\s*['"`]([^'"`]+)['"`]/g);
    for (const match of namedImportMatches) {
      const names = match[1].split(',').map(s => s.trim().split(' as ')[0].trim());
      const source = match[2];
      imports.push(...names.map(name => ({ name, source, file: filePath })));
    }
    
    // Default imports: import foo from './module'
    const defaultImportMatches = content.matchAll(/import\s+(\w+)\s+from\s+['"`]([^'"`]+)['"`]/g);
    for (const match of defaultImportMatches) {
      imports.push({ name: 'default', alias: match[1], source: match[2], file: filePath });
    }
    
    return imports;
  }

  findExportLine(content, exportName) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(`export`) && lines[i].includes(exportName)) {
        return i + 1;
      }
    }
    return 1;
  }

  getExportType(content, exportName) {
    if (exportName === 'default') return 'default';
    if (content.includes(`export const ${exportName}`)) return 'const';
    if (content.includes(`export function ${exportName}`)) return 'function';
    if (content.includes(`export class ${exportName}`)) return 'class';
    if (content.includes(`export interface ${exportName}`)) return 'interface';
    if (content.includes(`export type ${exportName}`)) return 'type';
    if (content.includes(`export enum ${exportName}`)) return 'enum';
    return 'unknown';
  }

  findUnusedExports() {
    // Create a set of all imported names for quick lookup
    const usedImports = new Set();
    
    for (const imports of this.imports.values()) {
      for (const imp of imports) {
        usedImports.add(imp.name);
        if (imp.alias) {
          usedImports.add(imp.alias);
        }
      }
    }
    
    // Find exports that aren't imported anywhere
    for (const [file, exports] of this.exports.entries()) {
      for (const exp of exports) {
        // Skip certain patterns that are likely used
        if (this.shouldSkipExport(exp, file)) {
          continue;
        }
        
        if (!usedImports.has(exp.name) && exp.name !== 'default') {
          this.unusedExports.push({
            ...exp,
            estimatedSizeKB: this.estimateExportSize(exp),
            reason: this.getUnusedReason(exp)
          });
        }
      }
    }
    
    this.stats.unusedExports = this.unusedExports.length;
    this.stats.potentialSavingsKB = this.unusedExports.reduce((sum, exp) => sum + exp.estimatedSizeKB, 0);
  }

  shouldSkipExport(exportItem, file) {
    // Skip index.ts barrel exports
    if (file.endsWith('index.ts') || file.endsWith('index.tsx')) {
      return true;
    }
    
    // Skip test-related exports
    if (file.includes('.test.') || file.includes('.spec.') || file.includes('__tests__')) {
      return true;
    }
    
    // Skip story files
    if (file.includes('.stories.')) {
      return true;
    }
    
    // Skip re-exports
    if (exportItem.name.startsWith('*:')) {
      return true;
    }
    
    return false;
  }

  estimateExportSize(exportItem) {
    // Rough size estimation based on export type
    const sizeMap = {
      'function': 3,
      'class': 5,
      'const': 1,
      'interface': 0, // TypeScript interfaces don't add runtime size
      'type': 0,
      'enum': 2,
      'default': 4
    };
    
    return sizeMap[exportItem.type] || 2;
  }

  getUnusedReason(exportItem) {
    if (exportItem.name.includes('Test') || exportItem.name.includes('Mock')) {
      return 'Test utility - safe to remove';
    }
    if (exportItem.name.includes('Debug') || exportItem.name.includes('Dev')) {
      return 'Development utility - safe to remove';
    }
    if (exportItem.type === 'interface' || exportItem.type === 'type') {
      return 'TypeScript type - no runtime impact';
    }
    return 'Unused export - verify before removal';
  }

  generateRecommendations() {
    // Group unused exports by file
    const byFile = new Map();
    for (const exp of this.unusedExports) {
      if (!byFile.has(exp.file)) {
        byFile.set(exp.file, []);
      }
      byFile.get(exp.file).push(exp);
    }
    
    // Recommend cleanup for files with multiple unused exports
    for (const [file, exports] of byFile.entries()) {
      if (exports.length >= 3) {
        this.recommendations.push({
          type: 'cleanup',
          file,
          count: exports.length,
          description: `Clean up ${exports.length} unused exports in ${file}`,
          priority: 'high',
          estimatedSavingsKB: exports.reduce((sum, exp) => sum + exp.estimatedSizeKB, 0)
        });
      }
    }
    
    // General recommendations
    if (this.unusedExports.length > 10) {
      this.recommendations.push({
        type: 'general',
        description: `Remove ${this.unusedExports.length} unused exports to improve tree-shaking`,
        priority: 'medium',
        estimatedSavingsKB: this.stats.potentialSavingsKB
      });
    }
    
    if (this.stats.potentialSavingsKB > 20) {
      this.recommendations.push({
        type: 'general',
        description: 'Significant tree-shaking opportunities detected - prioritize cleanup',
        priority: 'high',
        estimatedSavingsKB: this.stats.potentialSavingsKB
      });
    }
    
    // Package-specific recommendations
    const packageFiles = this.unusedExports.filter(exp => exp.file.startsWith('packages/'));
    if (packageFiles.length > 0) {
      this.recommendations.push({
        type: 'packages',
        description: 'Clean up unused exports in shared packages to improve all apps',
        priority: 'high',
        count: packageFiles.length
      });
    }
  }

  async saveResults() {
    const results = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      unusedExports: this.unusedExports,
      recommendations: this.recommendations
    };
    
    const outputPath = path.join(METRICS_DIR, 'tree-shaking-analysis.json');
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
    
    console.log(`💾 Analysis saved to ${outputPath}`);
  }

  logSummary() {
    console.log('\n🌳 Tree-Shaking Analysis Summary:');
    console.log('==================================');
    console.log(`Files analyzed: ${this.stats.totalFiles}`);
    console.log(`Total exports: ${this.stats.totalExports}`);
    console.log(`Unused exports: ${this.stats.unusedExports}`);
    console.log(`Potential savings: ~${this.stats.potentialSavingsKB}KB`);
    
    if (this.unusedExports.length > 0) {
      console.log('\n📋 Top unused exports:');
      const topUnused = this.unusedExports
        .sort((a, b) => b.estimatedSizeKB - a.estimatedSizeKB)
        .slice(0, 10);
        
      for (const exp of topUnused) {
        console.log(`  • ${exp.name} (${exp.type}) in ${exp.file} - ${exp.reason}`);
      }
    }
    
    if (this.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      for (const rec of this.recommendations) {
        console.log(`  ${rec.priority === 'high' ? '🔥' : '💡'} ${rec.description}`);
      }
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new TreeShakingAnalyzer();
  analyzer.analyze().catch(error => {
    console.error('❌ Tree-shaking analysis failed:', error);
    process.exit(1);
  });
}

export { TreeShakingAnalyzer };
