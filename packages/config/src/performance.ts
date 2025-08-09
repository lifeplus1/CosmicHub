/**
 * Performance Monitoring System for CosmicHub
 * Provides comprehensive performance tracking for components, operations, and pages
 */

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ComponentMetric extends PerformanceMetric {
  componentName: string;
  type: 'render' | 'mount' | 'interaction' | 'custom';
}

export interface OperationMetric extends PerformanceMetric {
  operationName: string;
  success: boolean;
}

export interface PageMetric extends PerformanceMetric {
  pageName: string;
  type: 'load' | 'interactive' | 'visibility';
}

export interface PerformanceReport {
  components: ComponentMetric[];
  operations: OperationMetric[];
  pages: PageMetric[];
  summary: {
    totalMetrics: number;
    averageRenderTime: number;
    slowestComponent: string;
    fastestComponent: string;
    errorRate: number;
  };
}

class PerformanceMonitor {
  private componentMetrics: ComponentMetric[] = [];
  private operationMetrics: OperationMetric[] = [];
  private pageMetrics: PageMetric[] = [];
  private subscribers: Set<(report: PerformanceReport) => void> = new Set();

  recordComponentMetric(
    componentName: string, 
    duration: number, 
    metadata: { type: 'render' | 'mount' | 'interaction' | 'custom'; label?: string } & Record<string, any>
  ): void {
    const metric: ComponentMetric = {
      name: `${componentName}:${metadata.type}`,
      duration,
      timestamp: Date.now(),
      componentName,
      type: metadata.type,
      metadata
    };

    this.componentMetrics.push(metric);
    this.notifySubscribers();

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 [${componentName}] ${metadata.type}: ${duration.toFixed(2)}ms`, metadata);
    }
  }

  recordOperationMetric(
    operationName: string,
    duration: number,
    success: boolean,
    metadata?: Record<string, any>
  ): void {
    const metric: OperationMetric = {
      name: operationName,
      duration,
      timestamp: Date.now(),
      operationName,
      success,
      metadata
    };

    this.operationMetrics.push(metric);
    this.notifySubscribers();

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ [${operationName}] ${success ? '✅' : '❌'}: ${duration.toFixed(2)}ms`, metadata);
    }
  }

  recordPageMetric(
    pageName: string,
    duration: number,
    type: 'load' | 'interactive' | 'visibility',
    metadata?: Record<string, any>
  ): void {
    const metric: PageMetric = {
      name: `${pageName}:${type}`,
      duration,
      timestamp: Date.now(),
      pageName,
      type,
      metadata
    };

    this.pageMetrics.push(metric);
    this.notifySubscribers();

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 [${pageName}] ${type}: ${duration.toFixed(2)}ms`, metadata);
    }
  }

  recordMetric(name: string, duration: number, metadata?: Record<string, any>): void {
    // Generic metric recording for backwards compatibility
    this.recordOperationMetric(name, duration, true, metadata);
  }

  getPerformanceReport(): PerformanceReport {
    const totalMetrics = this.componentMetrics.length + this.operationMetrics.length + this.pageMetrics.length;
    
    const renderMetrics = this.componentMetrics.filter(m => m.type === 'render');
    const averageRenderTime = renderMetrics.length > 0 
      ? renderMetrics.reduce((sum, m) => sum + m.duration, 0) / renderMetrics.length 
      : 0;

    const slowestComponent = renderMetrics.length > 0
      ? renderMetrics.reduce((max, m) => m.duration > max.duration ? m : max).componentName
      : '';

    const fastestComponent = renderMetrics.length > 0
      ? renderMetrics.reduce((min, m) => m.duration < min.duration ? m : min).componentName
      : '';

    const failedOperations = this.operationMetrics.filter(m => !m.success).length;
    const errorRate = this.operationMetrics.length > 0 
      ? (failedOperations / this.operationMetrics.length) * 100 
      : 0;

    return {
      components: this.componentMetrics,
      operations: this.operationMetrics,
      pages: this.pageMetrics,
      summary: {
        totalMetrics,
        averageRenderTime,
        slowestComponent,
        fastestComponent,
        errorRate
      }
    };
  }

  getMetrics(): { averageRenderTime: number; totalMetrics: number; performanceScore: number } {
    const report = this.getPerformanceReport();
    const performanceScore = Math.max(0, 100 - (report.summary.averageRenderTime / 2) - report.summary.errorRate);
    
    return {
      averageRenderTime: report.summary.averageRenderTime,
      totalMetrics: report.summary.totalMetrics,
      performanceScore: Math.round(performanceScore)
    };
  }

  enableRealTimeUpdates(callback: (report: PerformanceReport) => void): () => void {
    this.subscribers.add(callback);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  clearMetrics(): void {
    this.componentMetrics = [];
    this.operationMetrics = [];
    this.pageMetrics = [];
    this.notifySubscribers();
  }

  private notifySubscribers(): void {
    const report = this.getPerformanceReport();
    this.subscribers.forEach(callback => callback(report));
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export minimal function for Docker build compatibility
export const reportPerformance = () => {
  return performanceMonitor.getPerformanceReport();
};
