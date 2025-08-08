/**
 * Micro-optimizations and Performance Monitoring
 * Implements granular performance optimizations and comprehensive monitoring
 */

// Performance monitoring types
export interface PerformanceMetrics {
  // Core Web Vitals
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  
  // Custom metrics
  componentRenderTime: number;
  bundleLoadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  
  // Resource metrics
  domNodes: number;
  scriptCount: number;
  stylesheetCount: number;
  imageCount: number;
  
  // Navigation metrics
  navigationTiming: NavigationTiming;
  resourceTiming: ResourceTiming[];
}

export interface NavigationTiming {
  redirectStart: number;
  redirectEnd: number;
  fetchStart: number;
  domainLookupStart: number;
  domainLookupEnd: number;
  connectStart: number;
  connectEnd: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
  domLoading: number;
  domInteractive: number;
  domContentLoadedEventStart: number;
  domContentLoadedEventEnd: number;
  domComplete: number;
  loadEventStart: number;
  loadEventEnd: number;
}

export interface ResourceTiming {
  name: string;
  duration: number;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
  type: 'navigation' | 'resource' | 'measure' | 'paint';
}

export interface PerformanceBudget {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  bundleSize: number;
  apiResponseTime: number;
  memoryUsage: number;
}

// Micro-optimization utilities
export class MicroOptimizations {
  private static rafId: number | null = null;
  private static idleCallbacks: Array<() => void> = [];
  private static intersectionObserver: IntersectionObserver | null = null;
  private static resizeObserver: ResizeObserver | null = null;

  // Debounced function execution
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate?: boolean
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      
      const callNow = immediate && !timeout;
      
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      
      if (callNow) func(...args);
    };
  }

  // Throttled function execution
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let lastFunc: NodeJS.Timeout;
    let lastRan: number;
    
    return function throttledFunction(...args: Parameters<T>) {
      if (!lastRan) {
        func(...args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(() => {
          if ((Date.now() - lastRan) >= limit) {
            func(...args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  }

  // Optimized requestAnimationFrame batching
  static batchAnimationFrame(callback: () => void): void {
    if (this.rafId !== null) {
      return;
    }

    this.rafId = requestAnimationFrame(() => {
      callback();
      this.rafId = null;
    });
  }

  // Idle time task scheduling
  static scheduleIdleTask(task: () => void, timeout: number = 5000): void {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(task, { timeout });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(task, 0);
    }
  }

  // Batch idle tasks
  static addIdleTask(task: () => void): void {
    this.idleCallbacks.push(task);
    
    if (this.idleCallbacks.length === 1) {
      this.scheduleIdleTask(() => {
        const tasks = [...this.idleCallbacks];
        this.idleCallbacks.length = 0;
        
        tasks.forEach(task => {
          try {
            task();
          } catch (error) {
            console.error('Idle task failed:', error);
          }
        });
      });
    }
  }

  // Optimized intersection observer
  static createOptimizedIntersectionObserver(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ): IntersectionObserver {
    const defaultOptions: IntersectionObserverInit = {
      rootMargin: '50px',
      threshold: [0, 0.25, 0.5, 0.75, 1],
      ...options
    };

    return new IntersectionObserver(callback, defaultOptions);
  }

  // Shared intersection observer for lazy loading
  static getSharedIntersectionObserver(): IntersectionObserver {
    if (!this.intersectionObserver) {
      this.intersectionObserver = this.createOptimizedIntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const element = entry.target as HTMLElement;
              const callback = element.dataset.intersectionCallback;
              
              if (callback && (window as any)[callback]) {
                (window as any)[callback](entry);
              }
            }
          });
        },
        { rootMargin: '100px' }
      );
    }
    return this.intersectionObserver;
  }

  // Optimized resize observer
  static getSharedResizeObserver(): ResizeObserver {
    if (!this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(
        this.throttle((entries: ResizeObserverEntry[]) => {
          entries.forEach(entry => {
            const element = entry.target as HTMLElement;
            const callback = element.dataset.resizeCallback;
            
            if (callback && (window as any)[callback]) {
              (window as any)[callback](entry);
            }
          });
        }, 16) // ~60fps
      );
    }
    return this.resizeObserver;
  }

  // Memory optimization for large datasets
  static createVirtualizedList<T>(
    items: T[],
    containerHeight: number,
    itemHeight: number,
    renderItem: (item: T, index: number) => HTMLElement
  ): {
    container: HTMLElement;
    scrollTo: (index: number) => void;
    update: (newItems: T[]) => void;
  } {
    const container = document.createElement('div');
    container.style.height = `${containerHeight}px`;
    container.style.overflow = 'auto';
    container.style.position = 'relative';

    const virtualContainer = document.createElement('div');
    virtualContainer.style.height = `${items.length * itemHeight}px`;
    virtualContainer.style.position = 'relative';
    container.appendChild(virtualContainer);

    const visibleItems = Math.ceil(containerHeight / itemHeight) + 2;
    let startIndex = 0;
    let renderedElements: HTMLElement[] = [];

    const updateVisibleItems = this.throttle(() => {
      const scrollTop = container.scrollTop;
      const newStartIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(newStartIndex + visibleItems, items.length);

      if (newStartIndex !== startIndex) {
        startIndex = newStartIndex;

        // Clear existing elements
        renderedElements.forEach(el => el.remove());
        renderedElements = [];

        // Render visible items
        for (let i = startIndex; i < endIndex; i++) {
          const element = renderItem(items[i], i);
          element.style.position = 'absolute';
          element.style.top = `${i * itemHeight}px`;
          element.style.height = `${itemHeight}px`;
          virtualContainer.appendChild(element);
          renderedElements.push(element);
        }
      }
    }, 16);

    container.addEventListener('scroll', updateVisibleItems);
    updateVisibleItems(); // Initial render

    return {
      container,
      scrollTo: (index: number) => {
        container.scrollTop = index * itemHeight;
      },
      update: (newItems: T[]) => {
        items = newItems;
        virtualContainer.style.height = `${newItems.length * itemHeight}px`;
        updateVisibleItems();
      }
    };
  }

  // Optimized DOM manipulation
  static batchDOMUpdates(updates: Array<() => void>): void {
    const fragment = document.createDocumentFragment();
    const tempContainer = document.createElement('div');
    fragment.appendChild(tempContainer);

    // Execute all updates in a batch
    this.batchAnimationFrame(() => {
      updates.forEach(update => {
        try {
          update();
        } catch (error) {
          console.error('DOM update failed:', error);
        }
      });
    });
  }

  // Efficient event delegation
  static createEventDelegator(
    container: HTMLElement,
    eventType: string,
    selector: string,
    handler: (event: Event, target: HTMLElement) => void
  ): () => void {
    const delegatedHandler = (event: Event) => {
      const target = event.target as HTMLElement;
      const match = target.closest(selector) as HTMLElement;
      
      if (match && container.contains(match)) {
        handler(event, match);
      }
    };

    container.addEventListener(eventType, delegatedHandler, {
      passive: true,
      capture: false
    });

    return () => {
      container.removeEventListener(eventType, delegatedHandler);
    };
  }
}

// Performance monitoring system
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private budget: PerformanceBudget;
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  constructor() {
    this.budget = {
      fcp: 1800, // 1.8s
      lcp: 2500, // 2.5s
      fid: 100,  // 100ms
      cls: 0.1,  // 0.1
      bundleSize: 250000, // 250kb
      apiResponseTime: 1000, // 1s
      memoryUsage: 50 * 1024 * 1024 // 50MB
    };
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;

    console.log('📊 Starting performance monitoring...');
    this.isMonitoring = true;

    this.setupCoreWebVitalsObservers();
    this.setupResourceTimingObserver();
    this.setupNavigationTimingObserver();
    this.setupMemoryMonitoring();
    this.setupCustomMetrics();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    console.log('📊 Performance monitoring stopped');
  }

  private setupCoreWebVitalsObservers(): void {
    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('fcp', entry.startTime);
        }
      });
    });
    fcpObserver.observe({ entryTypes: ['paint'] });
    this.observers.push(fcpObserver);

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('lcp', lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(lcpObserver);

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.recordMetric('fid', entry.processingStart - entry.startTime);
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
    this.observers.push(fidObserver);

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      const entries = list.getEntries();
      
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      this.recordMetric('cls', clsValue);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(clsObserver);
  }

  private setupResourceTimingObserver(): void {
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry: any) => {
        // Monitor API response times
        if (entry.name.includes('/api/')) {
          this.recordMetric('apiResponseTime', entry.duration);
        }

        // Monitor bundle load times
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          this.recordMetric('bundleLoadTime', entry.duration);
        }
      });
    });
    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.push(resourceObserver);
  }

  private setupNavigationTimingObserver(): void {
    const navigationObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry: any) => {
        this.recordMetric('ttfb', entry.responseStart - entry.requestStart);
      });
    });
    navigationObserver.observe({ entryTypes: ['navigation'] });
    this.observers.push(navigationObserver);
  }

  private setupMemoryMonitoring(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.recordMetric('memoryUsage', memory.usedJSHeapSize);
      }, 5000); // Every 5 seconds
    }
  }

  private setupCustomMetrics(): void {
    // Monitor DOM complexity
    setInterval(() => {
      this.recordMetric('domNodes', document.querySelectorAll('*').length);
      this.recordMetric('scriptCount', document.querySelectorAll('script').length);
      this.recordMetric('stylesheetCount', document.querySelectorAll('link[rel="stylesheet"]').length);
      this.recordMetric('imageCount', document.querySelectorAll('img').length);
    }, 10000); // Every 10 seconds
  }

  recordMetric(name: keyof PerformanceMetrics, value: number): void {
    const timestamp = Date.now();
    const existingMetric = this.metrics.find(m => Math.abs(m.timestamp - timestamp) < 1000);

    if (existingMetric) {
      (existingMetric as any)[name] = value;
    } else {
      const newMetric = {
        timestamp,
        [name]: value
      } as any;
      this.metrics.push(newMetric);
    }

    this.checkBudget(name, value);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  private checkBudget(metric: keyof PerformanceMetrics, value: number): void {
    const budgetValue = (this.budget as any)[metric];
    
    if (budgetValue && value > budgetValue) {
      console.warn(`⚠️ Performance budget exceeded for ${metric}: ${value} > ${budgetValue}`);
      
      // Emit custom event for budget violations
      window.dispatchEvent(new CustomEvent('performance-budget-exceeded', {
        detail: { metric, value, budget: budgetValue }
      }));
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  getAverageMetrics(): Partial<PerformanceMetrics> {
    if (this.metrics.length === 0) return {};

    const averages: any = {};
    const keys = Object.keys(this.metrics[0]).filter(key => key !== 'timestamp');

    keys.forEach(key => {
      const values = this.metrics
        .map(m => (m as any)[key])
        .filter(v => typeof v === 'number');
      
      if (values.length > 0) {
        averages[key] = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    });

    return averages;
  }

  generateReport(): {
    summary: Partial<PerformanceMetrics>;
    budgetViolations: Array<{ metric: string; value: number; budget: number }>;
    recommendations: string[];
    trend: 'improving' | 'degrading' | 'stable';
  } {
    const latest = this.getLatestMetrics();
    const averages = this.getAverageMetrics();
    const budgetViolations: Array<{ metric: string; value: number; budget: number }> = [];
    const recommendations: string[] = [];

    // Check budget violations
    if (latest) {
      Object.keys(this.budget).forEach(key => {
        const value = (latest as any)[key];
        const budget = (this.budget as any)[key];
        
        if (value && value > budget) {
          budgetViolations.push({ metric: key, value, budget });
        }
      });
    }

    // Generate recommendations
    if (averages.lcp && averages.lcp > 2500) {
      recommendations.push('Optimize Largest Contentful Paint - consider image optimization and lazy loading');
    }

    if (averages.fid && averages.fid > 100) {
      recommendations.push('Reduce First Input Delay - minimize JavaScript execution time');
    }

    if (averages.cls && averages.cls > 0.1) {
      recommendations.push('Improve Cumulative Layout Shift - add size attributes to images and ads');
    }

    if (averages.memoryUsage && averages.memoryUsage > this.budget.memoryUsage) {
      recommendations.push('Optimize memory usage - implement lazy loading and cleanup unused objects');
    }

    // Determine trend
    const trend = this.calculateTrend();

    return {
      summary: averages,
      budgetViolations,
      recommendations,
      trend
    };
  }

  private calculateTrend(): 'improving' | 'degrading' | 'stable' {
    if (this.metrics.length < 10) return 'stable';

    const recent = this.metrics.slice(-5);
    const older = this.metrics.slice(-10, -5);

    const recentAvg = this.calculateOverallScore(recent);
    const olderAvg = this.calculateOverallScore(older);

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (change > 10) return 'degrading';
    if (change < -10) return 'improving';
    return 'stable';
  }

  private calculateOverallScore(metrics: PerformanceMetrics[]): number {
    // Simplified overall performance score
    return metrics.reduce((sum, metric) => {
      let score = 0;
      if (metric.lcp) score += metric.lcp / 2500 * 30; // 30% weight
      if (metric.fid) score += metric.fid / 100 * 25; // 25% weight
      if (metric.cls) score += metric.cls / 0.1 * 25; // 25% weight
      if (metric.fcp) score += metric.fcp / 1800 * 20; // 20% weight
      return sum + score;
    }, 0) / metrics.length;
  }

  setBudget(budget: Partial<PerformanceBudget>): void {
    this.budget = { ...this.budget, ...budget };
  }

  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      budget: this.budget,
      report: this.generateReport()
    }, null, 2);
  }
}

// Export utilities
export const PerformanceOptimization = {
  MicroOptimizations,
  PerformanceMonitor
};
