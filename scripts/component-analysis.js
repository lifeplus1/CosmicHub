#!/usr/bin/env node

/**
 * Component Best Practices #3: Automated Component Analysis & Optimization
 * 
 * This script analyzes React components and identifies optimization opportunities:
 * - Missing React.memo
 * - Missing useCallback/useMemo
 * - Accessibility issues
 * - Performance bottlenecks
 * - Code quality issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const HEALWAVE_COMPONENTS_DIR = path.join(__dirname, '../apps/healwave/src/components');
const ANALYSIS_OUTPUT = path.join(__dirname, '../HEALWAVE_COMPONENT_ANALYSIS_REPORT.md');

class ComponentAnalyzer {
  constructor() {
    this.results = {
      total: 0,
      analyzed: 0,
      needsOptimization: [],
      performanceIssues: [],
      accessibilityIssues: [],
      qualityIssues: [],
      recommendations: []
    };
  }

  /**
   * Analyze a single component file
   */
  analyzeComponent(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    const componentName = path.basename(filePath, '.tsx');
    
    const analysis = {
      name: componentName,
      path: relativePath,
      issues: [],
      score: 100,
      recommendations: []
    };

    // Performance Analysis
    const perfIssues = this.analyzePerformance(content, componentName);
    analysis.issues.push(...perfIssues);
    analysis.score -= perfIssues.length * 15;

    // Accessibility Analysis
    const a11yIssues = this.analyzeAccessibility(content, componentName);
    analysis.issues.push(...a11yIssues);
    analysis.score -= a11yIssues.length * 10;

    // Code Quality Analysis
    const qualityIssues = this.analyzeCodeQuality(content, componentName);
    analysis.issues.push(...qualityIssues);
    analysis.score -= qualityIssues.length * 5;

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis.issues);

    return analysis;
  }

  /**
   * Analyze performance optimization opportunities
   */
  analyzePerformance(content, componentName) {
    const issues = [];

    // Check for React.memo
    if (!content.includes('React.memo') && !content.includes('memo(')) {
      if (content.includes('export const') || content.includes('export default function')) {
        issues.push({
          type: 'performance',
          severity: 'medium',
          code: 'missing-memo',
          message: 'Component not memoized - may cause unnecessary re-renders',
          fix: 'Wrap component with React.memo()'
        });
      }
    }

    // Check for missing useCallback
    const hasEventHandlers = content.match(/on[A-Z]\w+\s*=\s*\{/g);
    const hasUseCallback = content.includes('useCallback');
    if (hasEventHandlers && hasEventHandlers.length > 1 && !hasUseCallback) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        code: 'missing-useCallback',
        message: 'Multiple event handlers without useCallback - may cause child re-renders',
        fix: 'Wrap event handlers with useCallback()'
      });
    }

    // Check for missing useMemo
    const hasExpensiveOperations = content.match(/(\.map\(|\.filter\(|\.reduce\(|\.sort\()/g);
    const hasUseMemo = content.includes('useMemo');
    if (hasExpensiveOperations && hasExpensiveOperations.length > 2 && !hasUseMemo) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        code: 'missing-useMemo',
        message: 'Expensive operations without memoization - may cause performance issues',
        fix: 'Wrap expensive calculations with useMemo()'
      });
    }

    // Check for inline object creation
    const inlineObjects = content.match(/style=\{\{[^}]+\}\}/g);
    if (inlineObjects && inlineObjects.length > 0) {
      issues.push({
        type: 'performance',
        severity: 'low',
        code: 'inline-objects',
        message: 'Inline object creation detected - causes new object on each render',
        fix: 'Move objects outside component or use useMemo()'
      });
    }

    return issues;
  }

  /**
   * Analyze accessibility compliance
   */
  analyzeAccessibility(content, componentName) {
    const issues = [];

    // Check for missing ARIA labels on interactive elements
    if (content.includes('<button') && !content.includes('aria-label') && !content.includes('aria-labelledby')) {
      issues.push({
        type: 'accessibility',
        severity: 'high',
        code: 'missing-aria-label',
        message: 'Interactive elements missing accessible labels',
        fix: 'Add aria-label or aria-labelledby attributes'
      });
    }

    // Check for keyboard accessibility
    if (content.includes('onClick') && !content.includes('onKeyDown') && !content.includes('onKeyPress')) {
      issues.push({
        type: 'accessibility',
        severity: 'medium',
        code: 'missing-keyboard-support',
        message: 'Click handlers without keyboard support',
        fix: 'Add keyboard event handlers for accessibility'
      });
    }

    // Check for focus management
    if (content.includes('useState') && content.includes('isOpen') && !content.includes('focus()')) {
      issues.push({
        type: 'accessibility',
        severity: 'medium',
        code: 'missing-focus-management',
        message: 'Modal/dropdown without focus management',
        fix: 'Implement proper focus management when opening/closing'
      });
    }

    return issues;
  }

  /**
   * Analyze code quality issues
   */
  analyzeCodeQuality(content, componentName) {
    const issues = [];

    // Check for missing prop types or interfaces
    if (!content.includes('interface') && !content.includes('type') && content.includes('props')) {
      issues.push({
        type: 'quality',
        severity: 'medium',
        code: 'missing-types',
        message: 'Component props not properly typed',
        fix: 'Define TypeScript interface for props'
      });
    }

    // Check for missing cleanup in useEffect
    if (content.includes('addEventListener') && !content.includes('removeEventListener')) {
      issues.push({
        type: 'quality',
        severity: 'high',
        code: 'memory-leak',
        message: 'Event listeners not cleaned up - potential memory leak',
        fix: 'Add cleanup function in useEffect return'
      });
    }

    // Check for missing error boundaries
    if (content.includes('useState') && content.includes('Error') && !content.includes('ErrorBoundary')) {
      issues.push({
        type: 'quality',
        severity: 'low',
        code: 'missing-error-boundary',
        message: 'Component handles errors but not wrapped in ErrorBoundary',
        fix: 'Wrap in ErrorBoundary or add error handling'
      });
    }

    return issues;
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(issues) {
    const recommendations = [];
    const types = [...new Set(issues.map(i => i.type))];

    if (types.includes('performance')) {
      recommendations.push('🚀 **Performance**: Apply React.memo, useCallback, and useMemo optimizations');
    }
    if (types.includes('accessibility')) {
      recommendations.push('♿ **Accessibility**: Add ARIA attributes and keyboard navigation support');
    }
    if (types.includes('quality')) {
      recommendations.push('🛡️ **Quality**: Improve TypeScript typing and add proper cleanup');
    }

    return recommendations;
  }

  /**
   * Scan all component files
   */
  async scanComponents() {
    const files = this.getComponentFiles(HEALWAVE_COMPONENTS_DIR);
    
    console.log(`🔍 Analyzing ${files.length} HealWave component files...`);
    
    for (const file of files) {
      try {
        this.results.total++;
        const analysis = this.analyzeComponent(file);
        this.results.analyzed++;
        
        if (analysis.issues.length > 0) {
          this.results.needsOptimization.push(analysis);
        }
        
        // Categorize issues
        analysis.issues.forEach(issue => {
          if (issue.type === 'performance') {
            this.results.performanceIssues.push({ component: analysis.name, ...issue });
          } else if (issue.type === 'accessibility') {
            this.results.accessibilityIssues.push({ component: analysis.name, ...issue });
          } else if (issue.type === 'quality') {
            this.results.qualityIssues.push({ component: analysis.name, ...issue });
          }
        });
        
      } catch (error) {
        console.warn(`⚠️ Failed to analyze ${file}: ${error.message}`);
      }
    }

    this.generateReport();
  }

  /**
   * Get all component files recursively
   */
  getComponentFiles(dir) {
    const files = [];
    
    function scanDir(currentDir) {
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
   * Generate comprehensive analysis report
   */
  generateReport() {
    const { total, analyzed, needsOptimization, performanceIssues, accessibilityIssues, qualityIssues } = this.results;
    
    // Sort by severity and issue count
    const prioritized = needsOptimization
      .sort((a, b) => b.issues.length - a.issues.length)
      .slice(0, 20); // Top 20 components needing attention

    const report = `# 🎯 HealWave Component Best Practices Analysis Report

**Generated:** ${new Date().toISOString()}
**Components Analyzed:** ${analyzed}/${total}
**Components Needing Optimization:** ${needsOptimization.length}

## 📊 Analysis Summary

### Issue Distribution
- 🚀 **Performance Issues:** ${performanceIssues.length}
- ♿ **Accessibility Issues:** ${accessibilityIssues.length}
- 🛡️ **Quality Issues:** ${qualityIssues.length}

### Top Components Requiring Attention

${prioritized.map((comp, index) => `
#### ${index + 1}. ${comp.name}
**Path:** \`${comp.path}\`
**Score:** ${comp.score}/100
**Issues:** ${comp.issues.length}

${comp.issues.map(issue => `- ${this.getSeverityIcon(issue.severity)} **${issue.code}**: ${issue.message}`).join('\n')}

**Recommendations:**
${comp.recommendations.map(rec => `- ${rec}`).join('\n')}
`).join('\n')}

## 🚀 Performance Optimization Opportunities

${this.groupIssuesByType(performanceIssues, 'performance')}

## ♿ Accessibility Enhancement Opportunities

${this.groupIssuesByType(accessibilityIssues, 'accessibility')}

## 🛡️ Code Quality Improvements

${this.groupIssuesByType(qualityIssues, 'quality')}

## 🎯 Next Steps

### Immediate Actions (High Priority)
1. **Implement React.memo** for ${performanceIssues.filter(i => i.code === 'missing-memo').length} components
2. **Add ARIA labels** for ${accessibilityIssues.filter(i => i.code === 'missing-aria-label').length} interactive elements
3. **Fix memory leaks** in ${qualityIssues.filter(i => i.code === 'memory-leak').length} components

### Medium Priority
1. **Add useCallback/useMemo** optimizations
2. **Implement keyboard navigation** support
3. **Improve TypeScript typing**

### Automation Opportunities
1. **ESLint rules** for performance patterns
2. **Automated memoization** suggestions
3. **Accessibility testing** integration

---

**Generated by CosmicHub HealWave Component Analyzer v1.0**
`;

    fs.writeFileSync(ANALYSIS_OUTPUT, report);
    console.log(`📋 Analysis complete! Report saved to: ${ANALYSIS_OUTPUT}`);
    
    // Console summary
    console.log('\n🎯 Component Analysis Summary:');
    console.log(`   📁 Components analyzed: ${analyzed}`);
    console.log(`   ⚠️  Need optimization: ${needsOptimization.length}`);
    console.log(`   🚀 Performance issues: ${performanceIssues.length}`);
    console.log(`   ♿ Accessibility issues: ${accessibilityIssues.length}`);
    console.log(`   🛡️  Quality issues: ${qualityIssues.length}`);
  }

  /**
   * Get severity icon
   */
  getSeverityIcon(severity) {
    switch (severity) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }

  /**
   * Group issues by type for reporting
   */
  groupIssuesByType(issues, type) {
    const grouped = {};
    issues.forEach(issue => {
      if (!grouped[issue.code]) {
        grouped[issue.code] = [];
      }
      grouped[issue.code].push(issue);
    });

    return Object.entries(grouped).map(([code, items]) => 
      `### ${code.replace(/-/g, ' ').toUpperCase()} (${items.length} components)
${items.slice(0, 5).map(item => `- **${item.component}**: ${item.message}`).join('\n')}
${items.length > 5 ? `- ...and ${items.length - 5} more` : ''}
`).join('\n');
  }
}

// Run the analysis
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new ComponentAnalyzer();
  analyzer.scanComponents().catch(console.error);
}

export { ComponentAnalyzer };
