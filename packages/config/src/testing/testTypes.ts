// Shared types for test runner and event system to avoid circular dependencies.

export interface TestResult {
  suite: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  coverage: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  performance: {
    renderTime: number;
    mountTime: number;
    memoryUsage: number;
  };
  accessibility: {
    violations: Array<{
      id: string;
      impact: 'minor' | 'moderate' | 'serious' | 'critical';
      description: string;
      nodes: number;
    }>;
    warnings: Array<{
      id: string;
      description: string;
      nodes: number;
    }>;
  };
  errors: string[];
  metadata: Record<string, string | number | boolean | null>;
}

export interface TestRunSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  coverage: {
    overall: number;
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  performance: {
    averageRenderTime: number;
    maxRenderTime: number;
    totalMemoryUsage: number;
  };
  accessibility: {
    totalViolations: number;
    criticalViolations: number;
    totalWarnings: number;
  };
  quality: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    recommendations: string[];
  };
}
