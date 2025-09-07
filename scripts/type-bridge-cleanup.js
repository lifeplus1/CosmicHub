#!/usr/bin/env node

/**
 * Type Bridge Cleanup Script
 * 
 * Cleans up import issues and ensures proper Type Bridge integration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TypeBridgeCleanup {
  constructor() {
    this.cleanedFiles = 0;
    this.issuesFixed = 0;
  }

  /**
   * Clean up duplicate and unused imports
   */
  cleanupImports(content, filePath) {
    let updatedContent = content;
    let changes = [];

    // Remove duplicate TypeBridgeValidator imports
    const typeBridgeImportPattern = /import\s*{\s*[^}]*TypeBridgeValidator[^}]*}\s*from\s*'@cosmichub\/types\/type-bridge-validation';\s*\n/g;
    const matches = updatedContent.match(typeBridgeImportPattern);
    if (matches && matches.length > 1) {
      // Keep only the first import, remove duplicates
      let firstFound = false;
      updatedContent = updatedContent.replace(typeBridgeImportPattern, (match) => {
        if (!firstFound) {
          firstFound = true;
          return match;
        }
        return '';
      });
      changes.push('Removed duplicate TypeBridgeValidator imports');
    }

    // Clean up unused import declarations
    const unusedImportPatterns = [
      {
        pattern: /import\s+type\s*{\s*[^}]*}\s*from\s*'@cosmichub\/types';\s*\n/g,
        check: (content, match) => {
          // Check if any of the imported types are actually used
          const typeNames = match.match(/\w+/g);
          if (!typeNames) return false;
          
          return typeNames.some(typeName => {
            if (typeName === 'import' || typeName === 'type' || typeName === 'from' || typeName === 'cosmichub' || typeName === 'types') return false;
            const usageRegex = new RegExp(`\\b${typeName}\\b`, 'g');
            const usages = content.match(usageRegex);
            return usages && usages.length > 1; // More than just the import
          });
        },
        description: 'Removed unused type imports'
      }
    ];

    unusedImportPatterns.forEach(({ pattern, check, description }) => {
      const matches = updatedContent.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (!check(updatedContent, match)) {
            updatedContent = updatedContent.replace(match, '');
            changes.push(description);
          }
        });
      }
    });

    // Remove unused variable declarations
    const unusedVarPattern = /const\s+(\w+)\s*=\s*[^;]+;\s*\n/g;
    let match;
    while ((match = unusedVarPattern.exec(updatedContent)) !== null) {
      const varName = match[1];
      if (varName.startsWith('validated')) {
        // Check if this validated variable is used
        const usageRegex = new RegExp(`\\b${varName}\\b`, 'g');
        const usages = updatedContent.match(usageRegex);
        if (usages && usages.length === 1) { // Only declaration, no usage
          updatedContent = updatedContent.replace(match[0], '');
          changes.push(`Removed unused validated variable: ${varName}`);
        }
      }
    }

    return { content: updatedContent, changes };
  }

  /**
   * Simplify Type Bridge imports to avoid module resolution issues
   */
  simplifyTypeImports(content, filePath) {
    let updatedContent = content;
    let changes = [];

    // Replace problematic imports with simple ones
    const replacements = [
      {
        from: /import type\s*{\s*[^}]*}\s*from\s*'@cosmichub\/types\/type-bridge-validation';\s*\n/g,
        to: '',
        description: 'Removed problematic type-bridge-validation imports'
      },
      {
        from: /import\s*{\s*[^}]*}\s*from\s*'@cosmichub\/types\/type-bridge-validation';\s*\n/g,
        to: '',
        description: 'Removed problematic type-bridge-validation imports'
      },
      {
        from: /import type\s*{\s*[^}]*}\s*from\s*'@cosmichub\/types';\s*\n(?![^]*from\s*'@cosmichub\/types')/g,
        to: '',
        description: 'Removed unused @cosmichub/types imports'
      }
    ];

    replacements.forEach(({ from, to, description }) => {
      if (from.test(updatedContent)) {
        updatedContent = updatedContent.replace(from, to);
        changes.push(description);
      }
    });

    // Add simple type imports only where needed
    if (updatedContent.includes('TCMResponse') || updatedContent.includes('ElementInfo')) {
      if (!updatedContent.includes("import type") || !updatedContent.includes('@cosmichub/types')) {
        const simpleImport = "import type { TCMResponse, ElementInfo, ElementalBalance } from '@cosmichub/types';\n";
        updatedContent = simpleImport + updatedContent;
        changes.push('Added simple TCM type imports');
      }
    }

    return { content: updatedContent, changes };
  }

  /**
   * Add basic TypeScript types without complex validation
   */
  addBasicTypes(content, filePath) {
    let updatedContent = content;
    let changes = [];

    // Add simple FC type for React components
    if (updatedContent.includes('const ') && updatedContent.includes(' = (') && 
        updatedContent.includes('props') && !updatedContent.includes(': FC')) {
      
      // Check if React import exists
      if (updatedContent.includes('import React')) {
        updatedContent = updatedContent.replace(
          /import React(?:,\s*\{([^}]+)\})?\s+from ['"]react['"];?/,
          (match, hooks) => {
            const existingHooks = hooks ? hooks.split(',').map(h => h.trim()) : [];
            if (!existingHooks.includes('type FC')) {
              existingHooks.push('type FC');
            }
            return `import React, { ${existingHooks.join(', ')} } from 'react';`;
          }
        );
        changes.push('Added FC type to React import');
      }
    }

    // Add basic prop interfaces for components without them
    const componentMatch = updatedContent.match(/const\s+(\w+)\s*=\s*\([^)]*props[^)]*\)/);
    if (componentMatch && !updatedContent.includes('interface') && !updatedContent.includes('type ')) {
      const componentName = componentMatch[1];
      const basicInterface = `
interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
}

`;
      updatedContent = updatedContent.replace(/import React/, `import React${basicInterface}import React`);
      changes.push(`Added basic ${componentName}Props interface`);
    }

    return { content: updatedContent, changes };
  }

  /**
   * Process a single file
   */
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let updatedContent = content;
      let allChanges = [];

      // Apply cleanup transformations
      const cleanups = [
        this.cleanupImports.bind(this),
        this.simplifyTypeImports.bind(this),
        this.addBasicTypes.bind(this)
      ];

      for (const cleanup of cleanups) {
        const result = cleanup(updatedContent, filePath);
        updatedContent = result.content;
        allChanges.push(...result.changes);
      }

      // Write file if changes were made
      if (allChanges.length > 0) {
        fs.writeFileSync(filePath, updatedContent);
        this.cleanedFiles++;
        this.issuesFixed += allChanges.length;
        
        console.log(`🧹 ${path.relative(process.cwd(), filePath)}`);
        allChanges.forEach(change => console.log(`   • ${change}`));
      }

    } catch (error) {
      console.warn(`⚠️ Error cleaning ${filePath}: ${error.message}`);
    }
  }

  /**
   * Get files that need cleanup
   */
  getTargetFiles() {
    const problematicFiles = [
      'packages/ui/src/components/analytics/AnalyticsDashboard.tsx',
      'packages/ui/src/components/analytics/AnalyticsPanel.tsx',
      'packages/ui/src/components/analytics/AnalyticsWebSocket.tsx',
      'packages/ui/src/components/analytics/PerformanceDashboard.tsx',
      'packages/ui/src/components/SacredGeometryVisualizer.tsx'
    ];

    return problematicFiles
      .map(file => path.join(process.cwd(), file))
      .filter(file => fs.existsSync(file));
  }

  /**
   * Run the cleanup
   */
  async runCleanup() {
    console.log('🧹 Type Bridge Cleanup...\n');
    console.log('🎯 Fixing:');
    console.log('   • Duplicate imports');
    console.log('   • Unused imports and variables');
    console.log('   • Module resolution issues');
    console.log('   • Basic TypeScript types\n');

    const targetFiles = this.getTargetFiles();
    console.log(`📁 Cleaning ${targetFiles.length} files...\n`);

    for (const filePath of targetFiles) {
      await this.processFile(filePath);
    }

    console.log(`\n✨ Cleanup Complete!`);
    console.log(`   🧹 Files cleaned: ${this.cleanedFiles}`);
    console.log(`   🔧 Issues fixed: ${this.issuesFixed}\n`);
    
    console.log('🔄 Next Steps:');
    console.log('   1. Run: pnpm run type-check');
    console.log('   2. Build types package: pnpm run build:types');
    console.log('   3. Test components work correctly');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleanup = new TypeBridgeCleanup();
  cleanup.runCleanup().catch(console.error);
}

export { TypeBridgeCleanup };
