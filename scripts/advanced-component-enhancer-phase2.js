#!/usr/bin/env node

/**
 * Advanced Component Enhancement - Phase 2
 * 
 * This script continues the Type Bridge implementation by focusing on:
 * 1. API endpoint validation enhancement
 * 2. More sophisticated type guards
 * 3. Performance optimization with lazy loading
 * 4. Enhanced error boundaries with types
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AdvancedComponentEnhancer {
  constructor() {
    this.enhancedFiles = 0;
    this.optimizationsApplied = 0;
    this.enhancements = [];
  }

  /**
   * Add lazy loading with type safety
   */
  addLazyLoading(content, filePath) {
    let updatedContent = content;
    let changes = [];

    // Add React.lazy for large components
    if (content.includes('export default') && 
        content.includes('const ') && 
        !content.includes('React.lazy') &&
        filePath.includes('Dashboard') || filePath.includes('Chart')) {
      
      const componentName = path.basename(filePath, '.tsx');
      const lazyWrapper = `
// Lazy loading wrapper for better performance
import { lazy, Suspense, type FC } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

const ${componentName}Component = lazy(() => import('./${componentName}Base'));

interface ${componentName}Props {
  loading?: boolean;
  error?: string | null;
}

const ${componentName}: FC<${componentName}Props> = (props) => (
  <ErrorBoundary>
    <Suspense fallback={<div>Loading ${componentName}...</div>}>
      <${componentName}Component {...props} />
    </Suspense>
  </ErrorBoundary>
);

export default ${componentName};
`;

      // If this isn't already a lazy component, suggest the pattern
      if (!content.includes('Suspense')) {
        changes.push(`Suggested lazy loading pattern for ${componentName}`);
      }
    }

    return { content: updatedContent, changes };
  }

  /**
   * Add enhanced API validation patterns
   */
  addAPIValidation(content, filePath) {
    let updatedContent = content;
    let changes = [];

    // Add comprehensive fetch validation
    if (content.includes('fetch(') && !content.includes('validateResponse')) {
      const validationPattern = `
// Enhanced API response validation
const validateResponse = async <T>(
  response: Response,
  schema: z.ZodSchema<T>
): Promise<T> => {
  if (!response.ok) {
    throw new Error(\`API Error: \${response.status} \${response.statusText}\`);
  }
  
  const data = await response.json();
  
  try {
    return schema.parse(data);
  } catch (error) {
    console.error('API Response Validation Failed:', error);
    throw new Error('Invalid API response format');
  }
};`;

      updatedContent = updatedContent.replace(
        /import React/,
        `import { z } from 'zod';\n${validationPattern}\nimport React`
      );
      changes.push('Added enhanced API response validation');
    }

    // Add error handling for async operations
    if (content.includes('async') && !content.includes('try') && content.includes('await')) {
      changes.push('Suggested error handling for async operations');
    }

    return { content: updatedContent, changes };
  }

  /**
   * Add performance monitoring hooks
   */
  addPerformanceMonitoring(content, filePath) {
    let updatedContent = content;
    let changes = [];

    // Add performance timing for complex components
    if (content.includes('useMemo') || content.includes('useCallback')) {
      const performanceHook = `
// Performance monitoring hook
const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // Slower than 60fps
        console.warn(\`\${componentName} render took \${renderTime.toFixed(2)}ms\`);
      }
    };
  });
};`;

      if (!content.includes('usePerformanceMonitor')) {
        updatedContent = updatedContent.replace(
          /import React/,
          `${performanceHook}\nimport React`
        );
        changes.push('Added performance monitoring hook');
      }
    }

    return { content: updatedContent, changes };
  }

  /**
   * Add enhanced type guards
   */
  addEnhancedTypeGuards(content, filePath) {
    let updatedContent = content;
    let changes = [];

    // Add type guards for props validation
    if (content.includes('interface') && content.includes('Props') && !content.includes('isValid')) {
      const typeGuardPattern = `
// Type guard for props validation
const isValidProps = <T>(props: unknown): props is T => {
  return typeof props === 'object' && props !== null;
};

// Runtime props validation
const validateProps = <T>(props: unknown, componentName: string): T => {
  if (!isValidProps<T>(props)) {
    throw new Error(\`Invalid props for \${componentName}\`);
  }
  return props;
};`;

      updatedContent = updatedContent.replace(
        /interface.*Props/,
        `${typeGuardPattern}\n$&`
      );
      changes.push('Added enhanced type guards for props');
    }

    return { content: updatedContent, changes };
  }

  /**
   * Add error boundaries with types
   */
  addTypedErrorBoundaries(content, filePath) {
    let updatedContent = content;
    let changes = [];

    // Add error boundary wrapper for components
    if (content.includes('export default') && !content.includes('ErrorBoundary')) {
      const errorBoundaryPattern = `
// Typed error boundary for component safety
interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );
};`;

      if (!content.includes('withErrorBoundary')) {
        changes.push('Suggested error boundary wrapper pattern');
      }
    }

    return { content: updatedContent, changes };
  }

  /**
   * Process a single file with all enhancements
   */
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let updatedContent = content;
      let allChanges = [];

      // Apply all enhancement patterns
      const enhancements = [
        this.addLazyLoading.bind(this),
        this.addAPIValidation.bind(this),
        this.addPerformanceMonitoring.bind(this),
        this.addEnhancedTypeGuards.bind(this),
        this.addTypedErrorBoundaries.bind(this)
      ];

      for (const enhance of enhancements) {
        const result = enhance(updatedContent, filePath);
        updatedContent = result.content;
        allChanges.push(...result.changes);
      }

      // Only suggest improvements without modifying files for now
      if (allChanges.length > 0) {
        this.enhancedFiles++;
        this.optimizationsApplied += allChanges.length;
        
        console.log(`💡 ${path.relative(process.cwd(), filePath)}`);
        allChanges.forEach(change => console.log(`   💭 ${change}`));
        
        this.enhancements.push({
          file: path.relative(process.cwd(), filePath),
          suggestions: allChanges
        });
      }

    } catch (error) {
      console.warn(`⚠️ Error analyzing ${filePath}: ${error.message}`);
    }
  }

  /**
   * Get target files for enhancement
   */
  getTargetFiles() {
    const extensions = ['.tsx', '.ts'];
    const directories = [
      'apps/astro/src/components',
      'apps/healwave/src/components', 
      'packages/ui/src/components'
    ];

    const files = [];
    
    directories.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      if (fs.existsSync(fullPath)) {
        const dirFiles = this.getFilesRecursively(fullPath, extensions);
        files.push(...dirFiles);
      }
    });

    // Focus on complex components that would benefit from these enhancements
    return files.filter(file => {
      const fileName = path.basename(file).toLowerCase();
      return fileName.includes('dashboard') || 
             fileName.includes('chart') || 
             fileName.includes('analytics') ||
             fileName.includes('complex') ||
             fileName.includes('ai') ||
             file.includes('demos/');
    }).slice(0, 10); // Analyze top 10 candidates
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
            if (!item.includes('.test.') && !item.includes('.spec.') && !item.includes('.stories.')) {
              files.push(fullPath);
            }
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
   * Run advanced component enhancement analysis
   */
  async runEnhancement() {
    console.log('🚀 Advanced Component Enhancement - Phase 2\n');
    console.log('🎯 Enhancement Areas:');
    console.log('   • Lazy loading with type safety');
    console.log('   • Enhanced API validation patterns');
    console.log('   • Performance monitoring hooks');
    console.log('   • Advanced type guards');
    console.log('   • Typed error boundaries\n');

    const targetFiles = this.getTargetFiles();
    console.log(`📁 Analyzing ${targetFiles.length} complex components...\n`);

    for (const filePath of targetFiles) {
      await this.processFile(filePath);
    }

    this.printAnalysisSummary();
  }

  /**
   * Print enhancement analysis summary
   */
  printAnalysisSummary() {
    console.log('\n🔍 Enhancement Analysis Complete!\n');
    console.log(`📊 Analysis Summary:`);
    console.log(`   🔎 Components analyzed: ${this.enhancedFiles}`);
    console.log(`   💡 Enhancement suggestions: ${this.optimizationsApplied}\n`);

    if (this.enhancements.length > 0) {
      console.log('🏆 Top Enhancement Opportunities:');
      const suggestionTypes = {};
      this.enhancements.forEach(enhancement => {
        enhancement.suggestions.forEach(suggestion => {
          const type = suggestion.includes('lazy') ? 'Lazy Loading' :
                      suggestion.includes('validation') ? 'API Validation' :
                      suggestion.includes('performance') ? 'Performance' :
                      suggestion.includes('guard') ? 'Type Guards' :
                      suggestion.includes('error') ? 'Error Handling' : 'Other';
          suggestionTypes[type] = (suggestionTypes[type] || 0) + 1;
        });
      });

      Object.entries(suggestionTypes).forEach(([type, count]) => {
        console.log(`   • ${type}: ${count} opportunities`);
      });

      console.log('\n📋 Next Implementation Steps:');
      console.log('   1. Review enhancement suggestions');
      console.log('   2. Implement lazy loading for large components');
      console.log('   3. Add comprehensive API validation');
      console.log('   4. Set up performance monitoring');
      console.log('   5. Create error boundary wrappers');

      console.log('\n🎯 Priority Focus:');
      console.log('   • Components with most suggestions get priority');
      console.log('   • Start with API validation (highest impact)');
      console.log('   • Add performance monitoring (development aid)');
      console.log('   • Implement lazy loading (user experience)');
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const enhancer = new AdvancedComponentEnhancer();
  enhancer.runEnhancement().catch(console.error);
}

export { AdvancedComponentEnhancer };
