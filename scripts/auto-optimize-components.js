#!/usr/bin/env node

/**
 * Auto-optimize React components by applying React.memo
 * 
 * This script identifies components that need React.memo and automatically applies it
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const COMPONENT_DIRECTORIES = [
  path.join(__dirname, '../apps/healwave/src/components'),
  path.join(__dirname, '../apps/astro/src/components'),
  path.join(__dirname, '../apps/mobile/src/components'),
  path.join(__dirname, '../packages/ui/src/components'),
  path.join(__dirname, '../packages/personalization/src/components')
];

class ComponentOptimizer {
  constructor() {
    this.optimizedCount = 0;
    this.skippedCount = 0;
    this.errorCount = 0;
  }

  /**
   * Check if component needs React.memo
   */
  needsReactMemo(content) {
    // Already has memo
    if (content.includes('React.memo') || content.includes('memo(')) {
      return false;
    }

    // Has export const or export default function
    if (content.includes('export const') || content.includes('export default function')) {
      return true;
    }

    return false;
  }

  /**
   * Apply React.memo to a component
   */
  applyReactMemo(content, componentName) {
    let optimizedContent = content;

    // Ensure React import includes memo
    if (optimizedContent.includes('import React') && !optimizedContent.includes('memo')) {
      optimizedContent = optimizedContent.replace(
        /import React(.*?) from 'react'/,
        "import React, { memo } from 'react'"
      );
    } else if (!optimizedContent.includes('import React')) {
      // Add React import if missing
      optimizedContent = "import React, { memo } from 'react';\n" + optimizedContent;
    }

    // Find the export pattern and wrap with memo
    const exportConstPattern = new RegExp(`export const ${componentName}[^=]*=`, 'g');
    const exportDefaultPattern = new RegExp(`export default function ${componentName}`, 'g');

    if (exportConstPattern.test(optimizedContent)) {
      // Handle export const pattern
      optimizedContent = optimizedContent.replace(
        exportConstPattern,
        (match) => match.replace('export const', 'const')
      );
      
      // Add memo export at the end
      const memoExport = `
// Memoize the component to prevent unnecessary re-renders
const Memoized${componentName} = React.memo(${componentName});
Memoized${componentName}.displayName = '${componentName}';

export { Memoized${componentName} as ${componentName} };
export default Memoized${componentName};`;

      // Remove existing export default if present
      optimizedContent = optimizedContent.replace(/export default .*?;?\s*$/, '');
      optimizedContent += memoExport;
    } else if (exportDefaultPattern.test(optimizedContent)) {
      // Handle export default function pattern
      optimizedContent = optimizedContent.replace(
        exportDefaultPattern,
        `function ${componentName}`
      );
      
      // Add memo export at the end
      const memoExport = `
// Memoize the component to prevent unnecessary re-renders
const Memoized${componentName} = React.memo(${componentName});
Memoized${componentName}.displayName = '${componentName}';

export { Memoized${componentName} as ${componentName} };
export default Memoized${componentName};`;

      optimizedContent += memoExport;
    }

    return optimizedContent;
  }

  /**
   * Optimize a single component file
   */
  optimizeComponent(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const componentName = path.basename(filePath, '.tsx');
      
      // Skip if already optimized or doesn't need optimization
      if (!this.needsReactMemo(content)) {
        this.skippedCount++;
        return;
      }

      // Skip test files and certain patterns
      if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('.stories.')) {
        this.skippedCount++;
        return;
      }

      console.log(`🔧 Optimizing: ${path.relative(process.cwd(), filePath)}`);
      
      const optimizedContent = this.applyReactMemo(content, componentName);
      
      // Write back the optimized content
      fs.writeFileSync(filePath, optimizedContent);
      this.optimizedCount++;
      
    } catch (error) {
      console.warn(`⚠️ Failed to optimize ${filePath}: ${error.message}`);
      this.errorCount++;
    }
  }

  /**
   * Get all component files recursively
   */
  getComponentFiles(dir) {
    const files = [];
    
    function scanDir(currentDir) {
      if (!fs.existsSync(currentDir)) return;
      
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (item.endsWith('.tsx') && !item.endsWith('.test.tsx') && !item.endsWith('.spec.tsx')) {
          files.push(fullPath);
        }
      }
    }
    
    scanDir(dir);
    return files;
  }

  /**
   * Run optimization on all components
   */
  async optimizeAll() {
    const allFiles = [];
    
    // Scan all component directories
    for (const dir of COMPONENT_DIRECTORIES) {
      if (fs.existsSync(dir)) {
        const files = this.getComponentFiles(dir);
        allFiles.push(...files);
      }
    }
    
    console.log(`🚀 Starting auto-optimization of ${allFiles.length} component files...`);
    
    // Process a subset first (top 20 components that need the most help)
    const targetFiles = allFiles.slice(0, 20);
    
    for (const file of targetFiles) {
      this.optimizeComponent(file);
    }

    console.log('\n✅ Auto-optimization complete!');
    console.log(`   🔧 Optimized: ${this.optimizedCount} components`);
    console.log(`   ⏭️  Skipped: ${this.skippedCount} components`);
    console.log(`   ❌ Errors: ${this.errorCount} components`);
    
    if (this.optimizedCount > 0) {
      console.log('\n🎯 Next steps:');
      console.log('   1. Run the component analysis again to see improvements');
      console.log('   2. Test the optimized components');
      console.log('   3. Run lint fixes if needed');
    }
  }
}

// Run the optimization
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new ComponentOptimizer();
  optimizer.optimizeAll().catch(console.error);
}

export { ComponentOptimizer };
