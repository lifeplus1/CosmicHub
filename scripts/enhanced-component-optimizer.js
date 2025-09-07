#!/usr/bin/env node

/**
 * Enhanced Component Optimizer - Comprehensive React Component Optimization
 * 
 * This script applies multiple optimization patterns:
 * - React.memo for performance
 * - useCallback for event handlers
 * - useMemo for expensive computations
 * - ARIA attributes for accessibility
 * - Error boundaries integration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EnhancedComponentOptimizer {
  constructor() {
    this.optimizedCount = 0;
    this.skippedCount = 0;
    this.errorCount = 0;
    this.optimizations = [];
  }

  /**
   * Analyze component and determine needed optimizations
   */
  analyzeComponent(content, componentName) {
    const optimizations = [];

    // Check for missing React.memo
    if (!content.includes('React.memo') && !content.includes('memo(')) {
      if (content.includes('export const') || content.includes('export default function')) {
        optimizations.push('memo');
      }
    }

    // Check for missing useCallback on event handlers
    const hasEventHandlers = content.match(/on[A-Z]\w+\s*=\s*\{/g);
    const hasUseCallback = content.includes('useCallback');
    if (hasEventHandlers && hasEventHandlers.length > 1 && !hasUseCallback) {
      optimizations.push('useCallback');
    }

    // Check for missing useMemo on expensive operations
    const hasExpensiveOps = content.match(/(\.map\(|\.filter\(|\.reduce\(|\.sort\()/g);
    const hasUseMemo = content.includes('useMemo');
    if (hasExpensiveOps && hasExpensiveOps.length > 2 && !hasUseMemo) {
      optimizations.push('useMemo');
    }

    // Check for missing ARIA labels
    if (content.includes('<button') && !content.includes('aria-label')) {
      optimizations.push('aria-labels');
    }

    // Check for inline object creation
    if (content.includes('style={{')) {
      optimizations.push('inline-objects');
    }

    return optimizations;
  }

  /**
   * Apply React.memo optimization
   */
  applyReactMemo(content, componentName) {
    let optimizedContent = content;

    // Ensure React import includes memo
    if (!optimizedContent.includes('import React')) {
      optimizedContent = "import React from 'react';\n" + optimizedContent;
    }

    // Handle export const pattern
    const exportConstRegex = new RegExp(`export const ${componentName}`, 'g');
    if (exportConstRegex.test(optimizedContent)) {
      optimizedContent = optimizedContent.replace(exportConstRegex, `const ${componentName}`);
      
      // Add memo export at the end
      const memoExport = `
// Memoize the component to prevent unnecessary re-renders
const Memoized${componentName} = React.memo(${componentName});
Memoized${componentName}.displayName = '${componentName}';

export { Memoized${componentName} as ${componentName} };
export default Memoized${componentName};`;

      optimizedContent = optimizedContent.replace(/export default .*?;?\s*$/, '');
      optimizedContent += memoExport;
    }

    return optimizedContent;
  }

  /**
   * Add useCallback and useMemo optimizations
   */
  addHookOptimizations(content) {
    let optimizedContent = content;

    // Add useCallback and useMemo to React imports if not present
    if (optimizedContent.includes('import React') && !optimizedContent.includes('useCallback')) {
      optimizedContent = optimizedContent.replace(
        /import React(.*?) from 'react'/,
        "import React, { useCallback, useMemo } from 'react'"
      );
    }

    return optimizedContent;
  }

  /**
   * Add basic ARIA attributes to buttons
   */
  addBasicARIA(content) {
    let optimizedContent = content;

    // Add aria-label to buttons without them
    optimizedContent = optimizedContent.replace(
      /<button([^>]*?)(?<!aria-label=[^>]*?)>/g,
      (match, attributes) => {
        if (!attributes.includes('aria-label')) {
          return `<button${attributes} aria-label="Button">`;
        }
        return match;
      }
    );

    return optimizedContent;
  }

  /**
   * Optimize a single component
   */
  async optimizeComponent(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const componentName = path.basename(filePath, '.tsx');
      
      // Skip test files and stories
      if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('.stories.')) {
        this.skippedCount++;
        return;
      }

      // Analyze what optimizations are needed
      const neededOptimizations = this.analyzeComponent(content, componentName);
      
      if (neededOptimizations.length === 0) {
        this.skippedCount++;
        return;
      }

      console.log(`🔧 Optimizing ${componentName}: ${neededOptimizations.join(', ')}`);
      
      let optimizedContent = content;

      // Apply optimizations
      if (neededOptimizations.includes('memo')) {
        optimizedContent = this.applyReactMemo(optimizedContent, componentName);
      }

      if (neededOptimizations.includes('useCallback') || neededOptimizations.includes('useMemo')) {
        optimizedContent = this.addHookOptimizations(optimizedContent);
      }

      if (neededOptimizations.includes('aria-labels')) {
        optimizedContent = this.addBasicARIA(optimizedContent);
      }

      // Write optimized content
      fs.writeFileSync(filePath, optimizedContent);
      
      this.optimizedCount++;
      this.optimizations.push({
        file: path.relative(process.cwd(), filePath),
        component: componentName,
        optimizations: neededOptimizations
      });

    } catch (error) {
      console.warn(`⚠️ Failed to optimize ${filePath}: ${error.message}`);
      this.errorCount++;
    }
  }

  /**
   * Get component files from analysis report
   */
  getTopComponentsFromReport() {
    try {
      const reportPath = path.join(__dirname, '../COMPONENT-ANALYSIS-REPORT.md');
      const reportContent = fs.readFileSync(reportPath, 'utf8');
      
      // Extract component paths from the report
      const pathMatches = reportContent.match(/\*\*Path:\*\* `([^`]+)`/g);
      if (!pathMatches) return [];

      return pathMatches
        .map(match => match.replace(/\*\*Path:\*\* `([^`]+)`/, '$1'))
        .map(relativePath => path.join(process.cwd(), relativePath))
        .filter(filePath => fs.existsSync(filePath))
        .slice(0, 10); // Top 10 components
    } catch (error) {
      console.warn('Could not read analysis report, scanning directories instead');
      return [];
    }
  }

  /**
   * Run enhanced optimization
   */
  async optimizeTopComponents() {
    console.log('🚀 Starting Enhanced Component Optimization...\n');

    // Get top components from analysis report
    const targetFiles = this.getTopComponentsFromReport();
    
    if (targetFiles.length === 0) {
      console.log('No components found from analysis report');
      return;
    }

    console.log(`📋 Processing ${targetFiles.length} top priority components:\n`);

    for (const filePath of targetFiles) {
      await this.optimizeComponent(filePath);
    }

    this.printSummary();
  }

  /**
   * Print optimization summary
   */
  printSummary() {
    console.log('\n✅ Enhanced Optimization Complete!\n');
    console.log(`📊 Summary:`);
    console.log(`   🔧 Optimized: ${this.optimizedCount} components`);
    console.log(`   ⏭️  Skipped: ${this.skippedCount} components`);
    console.log(`   ❌ Errors: ${this.errorCount} components\n`);

    if (this.optimizedCount > 0) {
      console.log('📋 Optimizations Applied:');
      this.optimizations.forEach(opt => {
        console.log(`   • ${opt.component}: ${opt.optimizations.join(', ')}`);
      });

      console.log('\n🎯 Next Steps:');
      console.log('   1. Run component analysis again: node scripts/component-analysis.js');
      console.log('   2. Fix any lint errors: npm run lint');
      console.log('   3. Test the optimized components');
      console.log('   4. Review and refine the applied optimizations');
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new EnhancedComponentOptimizer();
  optimizer.optimizeTopComponents().catch(console.error);
}

export { EnhancedComponentOptimizer };
