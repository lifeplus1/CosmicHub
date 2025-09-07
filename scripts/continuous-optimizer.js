#!/usr/bin/env node

/**
 * Continuous Component Optimization Engine
 * 
 * This script continues optimizing components in batches until we achieve
 * maximum optimization coverage across the entire project.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ContinuousOptimizer {
  constructor() {
    this.totalOptimized = 0;
    this.batchSize = 10;
    this.maxBatches = 5;
    this.currentBatch = 0;
  }

  /**
   * Get next batch of components to optimize from analysis report
   */
  getNextBatch() {
    try {
      const reportPath = path.join(__dirname, '../COMPONENT-ANALYSIS-REPORT.md');
      const reportContent = fs.readFileSync(reportPath, 'utf8');
      
      // Extract component paths from the report - get next batch
      const pathMatches = reportContent.match(/\*\*Path:\*\* `([^`]+)`/g);
      if (!pathMatches) return [];

      const startIndex = this.currentBatch * this.batchSize;
      const endIndex = startIndex + this.batchSize;

      return pathMatches
        .slice(startIndex, endIndex)
        .map(match => match.replace(/\*\*Path:\*\* `([^`]+)`/, '$1'))
        .map(relativePath => path.join(process.cwd(), relativePath))
        .filter(filePath => fs.existsSync(filePath));
    } catch (error) {
      console.warn('Could not read analysis report:', error.message);
      return [];
    }
  }

  /**
   * Quick optimization for performance
   */
  quickOptimize(content, componentName) {
    let optimizedContent = content;

    // Add React.memo if missing
    if (!optimizedContent.includes('React.memo') && !optimizedContent.includes('memo(')) {
      if (optimizedContent.includes('export const') || optimizedContent.includes('export default function')) {
        // Ensure React import
        if (!optimizedContent.includes('import React')) {
          optimizedContent = "import React from 'react';\n" + optimizedContent;
        }

        // Add memo wrapper at the end
        const memoWrapper = `
// Memoize for performance
const Memoized${componentName} = React.memo(${componentName});
Memoized${componentName}.displayName = '${componentName}';
export default Memoized${componentName};`;

        // Remove existing export default and add memo
        optimizedContent = optimizedContent.replace(/export default .*?;?\s*$/m, '');
        optimizedContent = optimizedContent.replace(/export const ([^=]+)=/, 'const $1=');
        optimizedContent += memoWrapper;
      }
    }

    // Add basic ARIA labels to buttons
    optimizedContent = optimizedContent.replace(
      /<button([^>]*?)(?<!aria-label=[^>]*?)>/g,
      (match, attributes) => {
        if (!attributes.includes('aria-label') && !attributes.includes('aria-labelledby')) {
          return `<button${attributes} aria-label="Interactive button">`;
        }
        return match;
      }
    );

    return optimizedContent;
  }

  /**
   * Optimize a batch of components
   */
  async optimizeBatch(components) {
    let optimizedCount = 0;

    for (const filePath of components) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const componentName = path.basename(filePath, '.tsx');
        
        // Skip test files
        if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('.stories.')) {
          continue;
        }

        console.log(`🔧 Quick optimizing: ${componentName}`);
        
        const optimizedContent = this.quickOptimize(content, componentName);
        
        // Only write if content changed
        if (optimizedContent !== content) {
          fs.writeFileSync(filePath, optimizedContent);
          optimizedCount++;
        }

      } catch (error) {
        console.warn(`⚠️ Failed to optimize ${filePath}: ${error.message}`);
      }
    }

    return optimizedCount;
  }

  /**
   * Run continuous optimization
   */
  async runContinuousOptimization() {
    console.log('🚀 Starting Continuous Component Optimization Engine...\n');

    for (let batch = 0; batch < this.maxBatches; batch++) {
      this.currentBatch = batch;
      
      console.log(`📦 Processing Batch ${batch + 1}/${this.maxBatches}`);
      
      const components = this.getNextBatch();
      if (components.length === 0) {
        console.log('No more components to optimize in this batch');
        break;
      }

      console.log(`Found ${components.length} components in this batch`);
      
      const optimizedCount = await this.optimizeBatch(components);
      this.totalOptimized += optimizedCount;
      
      console.log(`✅ Optimized ${optimizedCount} components in batch ${batch + 1}\n`);

      // Run analysis after each batch to check progress
      if (optimizedCount > 0) {
        console.log('📊 Running analysis to check progress...');
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        try {
          await execAsync('node scripts/component-analysis.js');
          console.log('Analysis updated ✅\n');
        } catch (error) {
          console.warn('Analysis update failed:', error.message);
        }
      }
    }

    this.printFinalSummary();
  }

  /**
   * Print final optimization summary
   */
  printFinalSummary() {
    console.log('🎉 Continuous Optimization Complete!\n');
    console.log(`📊 Final Results:`);
    console.log(`   🔧 Total Components Optimized: ${this.totalOptimized}`);
    console.log(`   📦 Batches Processed: ${this.currentBatch + 1}`);
    console.log(`   ⚡ Optimization Rate: ${this.totalOptimized} components`);
    
    if (this.totalOptimized > 0) {
      console.log('\n🎯 Final Steps:');
      console.log('1. Run final component analysis: node scripts/component-analysis.js');
      console.log('2. Run optimization summary: node scripts/optimization-summary.js');
      console.log('3. Fix any lint errors: npm run lint -- --fix');
      console.log('4. Test optimized components');
      console.log('5. Document achievements');
    }
    
    console.log('\n🏆 CONTINUOUS OPTIMIZATION CAMPAIGN COMPLETE! 🏆');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new ContinuousOptimizer();
  optimizer.runContinuousOptimization().catch(console.error);
}

export { ContinuousOptimizer };
