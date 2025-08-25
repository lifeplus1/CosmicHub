/**
 * Advanced Component Design System
 * Automated design pattern recognition, consistency validation, and design token management
 */

import { performanceMonitor } from '../performance';
import { logger } from '../utils/logger';

// Design Token System
export interface DesignTokens {
  colors: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    neutral: Record<string, string>;
    semantic: Record<string, string>;
  };
  typography: {
    fontFamilies: Record<string, string>;
    fontSizes: Record<string, string>;
    fontWeights: Record<string, number>;
    lineHeights: Record<string, number>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  transitions: Record<string, string>;
  breakpoints: Record<string, string>;
}

export interface ComponentPattern {
  name: string;
  category: 'input' | 'navigation' | 'feedback' | 'display' | 'layout';
  variants: string[];
  states: string[];
  requiredProps: string[];
  optionalProps: string[];
  designTokens: string[];
  accessibility: {
    requiredRoles: string[];
    requiredAttributes: string[];
    keyboardSupport: string[];
  };
  interactions: {
    hover: boolean;
    focus: boolean;
    active: boolean;
    disabled: boolean;
  };
  responsiveness: {
    breakpoints: string[];
    behaviors: string[];
  };
}

export interface DesignConsistencyReport {
  timestamp: string;
  overallScore: number;
  grade: string;
  componentsAnalyzed: number;
  issues: Array<{
    component: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'color' | 'typography' | 'spacing' | 'pattern' | 'accessibility';
    description: string;
    recommendation: string;
  }>;
  patterns: Array<{
    name: string;
    usage: number;
    consistency: number;
    deviations: string[];
  }>;
  designTokenUsage: Record<string, {
    used: number;
    unused: number;
    inconsistent: number;
  }>;
  recommendations: string[];
}

interface ComponentAnalysis {
  consistencyScore: number;
  issues: DesignConsistencyReport['issues'];
  deviations: string[];
}

class DesignSystemEngine {
  private designTokens: DesignTokens;
  private componentPatterns: Map<string, ComponentPattern> = new Map();
  private analysisResults: Map<string, ComponentAnalysis> = new Map();

  constructor() {
    this.designTokens = this.initializeDesignTokens();
    this.initializeComponentPatterns();
  }

  private initializeDesignTokens(): DesignTokens {
    return {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e'
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75'
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717'
        },
        semantic: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6'
        }
      },
      typography: {
        fontFamilies: {
          sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
          serif: 'ui-serif, Georgia, Cambria, serif',
          mono: 'ui-monospace, SFMono-Regular, Monaco, Consolas, monospace'
        },
        fontSizes: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem'
        },
        fontWeights: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        lineHeights: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75
        }
      },
      spacing: {
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        base: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
      },
      transitions: {
        fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
        normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
        slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)'
      },
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      }
    };
  }

  private initializeComponentPatterns(): void {
    // Button Pattern
    this.componentPatterns.set('Button', {
      name: 'Button',
      category: 'input',
      variants: ['primary', 'secondary', 'outline', 'ghost', 'link'],
      states: ['default', 'hover', 'focus', 'active', 'disabled', 'loading'],
      requiredProps: ['children'],
      optionalProps: ['variant', 'size', 'disabled', 'loading', 'onClick'],
      designTokens: ['colors.primary', 'spacing.2', 'spacing.4', 'borderRadius.md', 'transitions.fast'],
      accessibility: {
        requiredRoles: ['button'],
        requiredAttributes: ['aria-disabled'],
        keyboardSupport: ['Enter', 'Space']
      },
      interactions: {
        hover: true,
        focus: true,
        active: true,
        disabled: true
      },
      responsiveness: {
        breakpoints: ['sm', 'md', 'lg'],
        behaviors: ['touch-friendly', 'scalable-text']
      }
    });

    // Input Pattern
    this.componentPatterns.set('Input', {
      name: 'Input',
      category: 'input',
      variants: ['text', 'email', 'password', 'number', 'search'],
      states: ['default', 'focus', 'error', 'disabled', 'readonly'],
      requiredProps: ['type'],
      optionalProps: ['placeholder', 'value', 'disabled', 'error', 'label'],
      designTokens: ['colors.neutral', 'spacing.3', 'borderRadius.md', 'transitions.fast'],
      accessibility: {
        requiredRoles: ['textbox'],
        requiredAttributes: ['aria-label', 'aria-describedby'],
        keyboardSupport: ['Tab', 'Enter', 'Escape']
      },
      interactions: {
        hover: true,
        focus: true,
        active: false,
        disabled: true
      },
      responsiveness: {
        breakpoints: ['sm', 'md', 'lg'],
        behaviors: ['full-width-mobile', 'comfortable-touch-target']
      }
    });

    // Modal Pattern
    this.componentPatterns.set('Modal', {
      name: 'Modal',
      category: 'feedback',
      variants: ['default', 'fullscreen', 'drawer'],
      states: ['open', 'closed', 'opening', 'closing'],
      requiredProps: ['isOpen', 'onClose'],
      optionalProps: ['title', 'size', 'closeOnOverlay', 'closeOnEscape'],
      designTokens: ['colors.neutral', 'shadows.xl', 'borderRadius.lg', 'transitions.normal'],
      accessibility: {
        requiredRoles: ['dialog'],
        requiredAttributes: ['aria-modal', 'aria-labelledby', 'aria-describedby'],
        keyboardSupport: ['Escape', 'Tab', 'Shift+Tab']
      },
      interactions: {
        hover: false,
        focus: true,
        active: false,
        disabled: false
      },
      responsiveness: {
        breakpoints: ['sm', 'md', 'lg'],
        behaviors: ['fullscreen-mobile', 'centered-desktop', 'scroll-content']
      }
    });

    // Card Pattern
    this.componentPatterns.set('Card', {
      name: 'Card',
      category: 'display',
      variants: ['default', 'elevated', 'outlined', 'interactive'],
      states: ['default', 'hover', 'focus', 'selected'],
      requiredProps: ['children'],
      optionalProps: ['variant', 'padding', 'interactive', 'onClick'],
      designTokens: ['colors.neutral', 'shadows.base', 'borderRadius.lg', 'spacing.4'],
      accessibility: {
        requiredRoles: [],
        requiredAttributes: [],
        keyboardSupport: []
      },
      interactions: {
        hover: true,
        focus: false,
        active: false,
        disabled: false
      },
      responsiveness: {
        breakpoints: ['sm', 'md', 'lg'],
        behaviors: ['stack-mobile', 'grid-desktop']
      }
    });
  }

  async analyzeDesignConsistency(componentPaths: string[]): Promise<DesignConsistencyReport> {
  const dsLogger = logger.child({ module: 'designSystem', action: 'analyzeConsistency' });
  dsLogger.info('Starting design consistency analysis');
    
    const startTime = performance.now();
    const issues: DesignConsistencyReport['issues'] = [];
    const patterns: DesignConsistencyReport['patterns'] = [];
    const designTokenUsage: Record<string, { used: number; unused: number; inconsistent: number; }> = {};

    // Analyze each component
    for (const componentPath of componentPaths) {
      const componentName = this.extractComponentName(componentPath);
  const analysis = await this.analyzeComponent(componentPath, componentName);
      
      this.analysisResults.set(componentName, analysis);
      
      // Collect issues
      issues.push(...analysis.issues);
      
      // Track pattern usage
      const pattern = this.componentPatterns.get(componentName);
      if (pattern) {
        patterns.push({
          name: pattern.name,
          usage: 1,
          consistency: analysis.consistencyScore,
          deviations: analysis.deviations
        });
      }
    }

    // Analyze design token usage
    this.analyzeDesignTokenUsage(designTokenUsage);

    // Calculate overall score
  const overallScore = this.calculateOverallScore(issues);
    const grade = this.calculateGrade(overallScore);

    const duration = performance.now() - startTime;
    
    // Record performance metric
    performanceMonitor.recordMetric('DesignSystemAnalysis', duration, {
      componentsAnalyzed: componentPaths.length,
      issuesFound: issues.length
    });

    const report: DesignConsistencyReport = {
      timestamp: new Date().toISOString(),
      overallScore,
      grade,
      componentsAnalyzed: componentPaths.length,
      issues: issues.sort((a, b) => this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity)),
      patterns,
      designTokenUsage,
      recommendations: this.generateRecommendations(issues, patterns, overallScore)
    };

    dsLogger.info('Design analysis complete', {
      grade,
      overallScore,
      issues: issues.length,
      components: componentPaths.length,
      durationMs: Number(duration.toFixed(2))
    });

    return report;
  }

  private analyzeComponent(componentPath: string, componentName: string): Promise<ComponentAnalysis> {
    const pattern = this.componentPatterns.get(componentName);
    const issues: DesignConsistencyReport['issues'] = [];
    const deviations: string[] = [];
    
    // Mock component analysis (in real implementation, this would parse actual component code)
    // componentPath would be used to read and parse the actual file
    const mockAnalysis = this.mockComponentAnalysis(componentName, componentPath);
    
    // Check color consistency
    if (mockAnalysis.colorsUsed.some(color => !this.isValidDesignToken(color))) {
      issues.push({
        component: componentName,
        severity: 'medium',
        category: 'color',
        description: 'Using colors not defined in design token system',
        recommendation: 'Use predefined color tokens from the design system'
      });
      deviations.push('non-standard-colors');
    }

    // Check spacing consistency
    if (mockAnalysis.spacingUsed.some(spacing => !this.isValidSpacing(spacing))) {
      issues.push({
        component: componentName,
        severity: 'low',
        category: 'spacing',
        description: 'Using spacing values not in design token system',
        recommendation: 'Use standardized spacing tokens (4px, 8px, 16px, etc.)'
      });
      deviations.push('non-standard-spacing');
    }

    // Check typography consistency
    if (mockAnalysis.fontSizes.some(size => !this.isValidFontSize(size))) {
      issues.push({
        component: componentName,
        severity: 'medium',
        category: 'typography',
        description: 'Using font sizes not defined in typography scale',
        recommendation: 'Use standardized font size tokens from typography system'
      });
      deviations.push('non-standard-typography');
    }

    // Check accessibility compliance
    if (pattern && !mockAnalysis.hasRequiredARIA) {
      issues.push({
        component: componentName,
        severity: 'high',
        category: 'accessibility',
        description: 'Missing required ARIA attributes for component pattern',
        recommendation: `Add required ARIA attributes: ${pattern.accessibility.requiredAttributes.join(', ')}`
      });
      deviations.push('accessibility-missing');
    }

    // Check pattern compliance
    if (pattern && !mockAnalysis.followsPattern) {
      issues.push({
        component: componentName,
        severity: 'medium',
        category: 'pattern',
        description: 'Component does not follow established design pattern',
        recommendation: `Follow ${pattern.name} pattern guidelines for consistency`
      });
      deviations.push('pattern-deviation');
    }

    // Calculate consistency score
    const totalChecks = 5;
    const passedChecks = totalChecks - issues.filter(issue => issue.component === componentName).length;
    const consistencyScore = Math.round((passedChecks / totalChecks) * 100);

  return Promise.resolve({
      consistencyScore,
      issues: issues.filter(issue => issue.component === componentName),
      deviations
  });
  }

  private mockComponentAnalysis(componentName: string, componentPath: string): {
    colorsUsed: string[];
    spacingUsed: string[];
    fontSizes: string[];
    hasRequiredARIA: boolean;
    followsPattern: boolean;
    usesDesignTokens: number;
  } {
    // Mock analysis results based on component name and known patterns
    // In real implementation, componentPath would be used to read and parse the actual file
    const isWellDesigned = ['Button', 'Input'].includes(componentName);
    const isInUIPackage = componentPath.includes('packages/ui/');
    
    return {
      colorsUsed: isWellDesigned ? ['primary.500', 'neutral.100'] : ['#ff0000', 'primary.500'],
      spacingUsed: isWellDesigned ? ['4', '8', '16'] : ['4', '8', '13'],
      fontSizes: isWellDesigned ? ['base', 'lg'] : ['base', '18px'],
      hasRequiredARIA: isWellDesigned && isInUIPackage,
      followsPattern: isWellDesigned,
      usesDesignTokens: isWellDesigned ? 90 : 60
    };
  }

  private isValidDesignToken(color: string): boolean {
    // Check if color is a valid design token
    if (color.startsWith('#')) return false; // Hard-coded hex colors are invalid
    return color.includes('primary.') || color.includes('secondary.') || color.includes('neutral.');
  }

  private isValidSpacing(spacing: string): boolean {
    return Object.keys(this.designTokens.spacing).includes(spacing);
  }

  private isValidFontSize(fontSize: string): boolean {
    if (fontSize.endsWith('px') || fontSize.endsWith('rem')) {
      return Object.values(this.designTokens.typography.fontSizes).includes(fontSize);
    }
    return Object.keys(this.designTokens.typography.fontSizes).includes(fontSize);
  }

  private analyzeDesignTokenUsage(usage: Record<string, { used: number; unused: number; inconsistent: number; }>): void {
    // Mock design token usage analysis
    usage.colors = { used: 12, unused: 8, inconsistent: 2 };
    usage.spacing = { used: 10, unused: 2, inconsistent: 1 };
    usage.typography = { used: 8, unused: 4, inconsistent: 0 };
    usage.shadows = { used: 3, unused: 2, inconsistent: 0 };
  }

  private calculateOverallScore(issues: DesignConsistencyReport['issues']): number {
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;
    const lowIssues = issues.filter(i => i.severity === 'low').length;

    // Weight issues by severity
    const weightedIssues = (criticalIssues * 4) + (highIssues * 3) + (mediumIssues * 2) + (lowIssues * 1);

    // Calculate score (higher is better)
    const score = Math.max(0, 100 - (weightedIssues * 5));
    return Math.round(score);
  }

  private calculateGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private getSeverityWeight(severity: DesignConsistencyReport['issues'][number]['severity']): number {
    switch (severity) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  private generateRecommendations(
    issues: DesignConsistencyReport['issues'], 
    patterns: DesignConsistencyReport['patterns'], 
    overallScore: number
  ): string[] {
    const recommendations: string[] = [];

    // Overall score recommendations
    if (overallScore < 70) {
      recommendations.push('Establish design system governance and guidelines');
    }

    // Issue-based recommendations
    const colorIssues = issues.filter(i => i.category === 'color');
    if (colorIssues.length > 0) {
      recommendations.push('Standardize color usage with design token system');
    }

    const typographyIssues = issues.filter(i => i.category === 'typography');
    if (typographyIssues.length > 0) {
      recommendations.push('Implement consistent typography scale across components');
    }

    const accessibilityIssues = issues.filter(i => i.category === 'accessibility');
    if (accessibilityIssues.length > 0) {
      recommendations.push('Improve accessibility compliance with ARIA standards');
    }

    const patternIssues = issues.filter(i => i.category === 'pattern');
    if (patternIssues.length > 0) {
      recommendations.push('Align components with established design patterns');
    }

    // Pattern consistency recommendations
    const inconsistentPatterns = patterns.filter(p => p.consistency < 80);
    if (inconsistentPatterns.length > 0) {
      recommendations.push(`Review and standardize: ${inconsistentPatterns.map(p => p.name).join(', ')}`);
    }

    return recommendations;
  }

  private extractComponentName(path: string): string {
    const parts = path.split('/');
    const filename = parts[parts.length - 1];
    return filename?.replace(/\.(tsx?|jsx?)$/, '') ?? 'Unknown';
  }

  getDesignTokens(): DesignTokens {
    return this.designTokens;
  }

  getComponentPattern(name: string): ComponentPattern | undefined {
    return this.componentPatterns.get(name);
  }

  getAllPatterns(): ComponentPattern[] {
    return Array.from(this.componentPatterns.values());
  }

  generateDesignSystemReport(report: DesignConsistencyReport): string {
    return `
# Design System Consistency Report
**Generated:** ${new Date(report.timestamp).toLocaleString()}

## Summary
- **Overall Grade:** ${report.grade} (${report.overallScore}%)
- **Components Analyzed:** ${report.componentsAnalyzed}
- **Issues Found:** ${report.issues.length}

## Issue Breakdown
${Object.entries(
  report.issues.reduce((acc, issue) => {
    acc[issue.severity] = (acc[issue.severity] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>)
).map(([severity, count]) => `- **${severity}**: ${count}`).join('\n')}

## Design Token Usage
${Object.entries(report.designTokenUsage).map(([category, usage]) => 
  `- **${category}**: ${usage.used} used, ${usage.unused} unused, ${usage.inconsistent} inconsistent`
).join('\n')}

## Top Issues
${report.issues.slice(0, 5).map(issue => 
  `- **${issue.component}** (${issue.severity}): ${issue.description}`
).join('\n')}

## Recommendations
${report.recommendations.map(rec => `- ${rec}`).join('\n')}
`;
  }
}

// Export singleton instance
export const designSystem = new DesignSystemEngine();
export { DesignSystemEngine };
