#!/usr/bin/env node

/**
 * Comprehensive Type Bridge Cleanup
 * 
 * Fixes all import issues and function naming problems
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ComprehensiveCleanup {
  constructor() {
    this.cleanedFiles = 0;
    this.totalFixes = 0;
  }

  /**
   * Remove all problematic type-bridge-validation imports
   */
  removeProblematicImports(content) {
    let updatedContent = content;
    let fixes = 0;

    // Remove all type-bridge-validation imports
    const patterns = [
      /import type\s*{\s*[^}]*}\s*from\s*'@cosmichub\/types\/type-bridge-validation';\s*\n?/g,
      /import\s*{\s*[^}]*}\s*from\s*'@cosmichub\/types\/type-bridge-validation';\s*\n?/g,
      /import\s*{\s*[^}]*TypeBridgeValidator[^}]*}\s*from\s*'@cosmichub\/types\/type-bridge-validation';\s*\n?/g
    ];

    patterns.forEach(pattern => {
      const matches = updatedContent.match(pattern);
      if (matches) {
        updatedContent = updatedContent.replace(pattern, '');
        fixes += matches.length;
      }
    });

    // Remove unused TCM imports if no validation
    if (!updatedContent.includes('TCMValidator') && !updatedContent.includes('TCMResponse')) {
      updatedContent = updatedContent.replace(
        /import type\s*{\s*[^}]*TCMResponse[^}]*}\s*from\s*'@cosmichub\/types';\s*\n?/g,
        ''
      );
      if (updatedContent.match(/import type\s*{\s*[^}]*TCMResponse[^}]*}\s*from\s*'@cosmichub\/types';\s*\n?/g)) {
        fixes++;
      }
    }

    return { content: updatedContent, fixes };
  }

  /**
   * Fix function exports that were renamed with underscores
   */
  fixFunctionExports(content) {
    let updatedContent = content;
    let fixes = 0;

    // Common function renames to fix
    const functionFixes = [
      { from: '_formatInterpretationContent', to: 'formatInterpretationContent' },
      { from: '_getConfidenceLevel', to: 'getConfidenceLevel' },
      { from: '_getInterpretationTypeEmoji', to: 'getInterpretationTypeEmoji' },
      { from: '_buildChartInterpretationRequest', to: 'buildChartInterpretationRequest' },
      { from: '_useAIInterpretation', to: 'useAIInterpretation' },
      { from: '_sortInterpretationsByDate', to: 'sortInterpretationsByDate' },
      { from: '_groupInterpretationsByType', to: 'groupInterpretationsByType' },
      { from: '_filterInterpretationsByTags', to: 'filterInterpretationsByTags' },
      { from: '_generateSummary', to: 'generateSummary' }
    ];

    functionFixes.forEach(({ from, to }) => {
      // Fix export declarations
      if (updatedContent.includes(`export const ${from}`)) {
        updatedContent = updatedContent.replace(`export const ${from}`, `export const ${to}`);
        fixes++;
      }
      
      // Fix import statements in other files
      if (updatedContent.includes(`import { ${to} }`)) {
        // This import should work now
      }
    });

    return { content: updatedContent, fixes };
  }

  /**
   * Clean up unused variables and duplicate identifiers
   */
  cleanupVariables(content) {
    let updatedContent = content;
    let fixes = 0;

    // Remove unused validated variables
    const lines = updatedContent.split('\n');
    const cleanedLines = lines.filter(line => {
      if (line.trim().includes('const validatedChart') || 
          line.trim().includes('const _validatedChart')) {
        fixes++;
        return false;
      }
      return true;
    });
    
    updatedContent = cleanedLines.join('\n');

    // Remove duplicate type guards that aren't being used
    if (updatedContent.includes('if (!isTCMResponse(data))') && 
        !updatedContent.includes('isTCMResponse') && 
        !updatedContent.includes('from \'@cosmichub/types\'')) {
      updatedContent = updatedContent.replace(
        /\s*\/\/\s*Type guard validation[\s\S]*?return;\s*}/g,
        ''
      );
      fixes++;
    }

    return { content: updatedContent, fixes };
  }

  /**
   * Add basic React types where needed
   */
  addBasicTypes(content) {
    let updatedContent = content;
    let fixes = 0;

    // Ensure React import has FC type if component is using it
    if (updatedContent.includes('React.FC') && 
        updatedContent.includes('import React') && 
        !updatedContent.includes('type FC')) {
      
      updatedContent = updatedContent.replace(
        /import React(?:,\s*\{([^}]*)\})?\s+from ['"]react['"];?/,
        (match, hooks) => {
          const existingHooks = hooks ? hooks.split(',').map(h => h.trim()) : [];
          if (!existingHooks.includes('type FC')) {
            existingHooks.push('type FC');
            fixes++;
          }
          return `import React, { ${existingHooks.join(', ')} } from 'react';`;
        }
      );
    }

    return { content: updatedContent, fixes };
  }

  /**
   * Process a single file
   */
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let updatedContent = content;
      let totalFixes = 0;

      // Apply all cleanup steps
      const steps = [
        this.removeProblematicImports.bind(this),
        this.fixFunctionExports.bind(this),
        this.cleanupVariables.bind(this),
        this.addBasicTypes.bind(this)
      ];

      for (const step of steps) {
        const result = step(updatedContent);
        updatedContent = result.content;
        totalFixes += result.fixes;
      }

      // Write file if changes were made
      if (totalFixes > 0) {
        fs.writeFileSync(filePath, updatedContent);
        this.cleanedFiles++;
        this.totalFixes += totalFixes;
        
        console.log(`🔧 ${path.relative(process.cwd(), filePath)} (${totalFixes} fixes)`);
      }

    } catch (error) {
      console.warn(`⚠️ Error processing ${filePath}: ${error.message}`);
    }
  }

  /**
   * Get all files that need cleanup
   */
  getAllTargetFiles() {
    const files = [];
    
    // Get problematic files from both UI and Astro
    const directories = [
      'packages/ui/src/components',
      'apps/astro/src/components',
      'apps/healwave/src/components'
    ];

    directories.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      if (fs.existsSync(fullPath)) {
        const dirFiles = this.getFilesRecursively(fullPath, ['.tsx', '.ts']);
        files.push(...dirFiles);
      }
    });

    return files.filter(file => {
      // Skip test files
      if (file.includes('.test.') || file.includes('.spec.')) return false;
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        // Include files that have problematic imports or function names
        return content.includes('type-bridge-validation') || 
               content.includes('_formatInterpretation') ||
               content.includes('_getConfidenceLevel') ||
               content.includes('_buildChartInterpretation') ||
               content.includes('_useAIInterpretation') ||
               content.includes('validatedChart');
      } catch {
        return false;
      }
    });
  }

  /**
   * Get files recursively
   */
  getFilesRecursively(dir, extensions) {
    const files = [];
    
    function scanDir(currentDir) {
      try {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            scanDir(fullPath);
          } else if (extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }
    
    scanDir(dir);
    return files;
  }

  /**
   * Run comprehensive cleanup
   */
  async runCleanup() {
    console.log('🧹 Comprehensive Type Bridge Cleanup...\n');
    console.log('🎯 Fixing:');
    console.log('   • Problematic type-bridge-validation imports');
    console.log('   • Function export/import mismatches');
    console.log('   • Unused variables and duplicates');
    console.log('   • Missing React types\n');

    const targetFiles = this.getAllTargetFiles();
    console.log(`📁 Processing ${targetFiles.length} files...\n`);

    for (const filePath of targetFiles) {
      await this.processFile(filePath);
    }

    console.log(`\n✨ Comprehensive Cleanup Complete!`);
    console.log(`   🧹 Files cleaned: ${this.cleanedFiles}`);
    console.log(`   🔧 Total fixes applied: ${this.totalFixes}\n`);
    
    console.log('🔄 Next Steps:');
    console.log('   1. Run: pnpm run type-check');
    console.log('   2. Verify no TypeScript errors');
    console.log('   3. Test component functionality');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleanup = new ComprehensiveCleanup();
  cleanup.runCleanup().catch(console.error);
}

export { ComprehensiveCleanup };
