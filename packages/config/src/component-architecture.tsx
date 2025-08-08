/**
 * Advanced Component Architecture Optimization
 * Implements design patterns, composition strategies, and architectural improvements
 */

import React, { 
  createContext, 
  useContext, 
  useCallback, 
  useMemo, 
  useRef, 
  forwardRef,
  memo,
  ComponentType,
  ReactNode,
  RefObject
} from 'react';
import { performanceMonitor } from './performance';

// Component composition patterns
export interface ComposableComponent<T = {}> {
  children?: ReactNode;
  className?: string;
  'data-testid'?: string;
}

// Higher-Order Component for performance tracking
export function withPerformanceTracking<P extends object>(
  WrappedComponent: ComponentType<P>,
  componentName: string
) {
  const PerformanceTrackedComponent = memo(
    forwardRef<any, P>((props, ref) => {
      const startTime = useRef<number>(0);
      const mountTime = useRef<number>(0);

      // Track mount performance
      React.useEffect(() => {
        mountTime.current = performance.now();
        const mountDuration = mountTime.current - startTime.current;
        
        performanceMonitor.recordMetric('ComponentMount', mountDuration, {
          componentName,
          propsCount: Object.keys(props).length
        });

        return () => {
          const unmountTime = performance.now();
          const lifetimeDuration = unmountTime - mountTime.current;
          
          performanceMonitor.recordMetric('ComponentLifetime', lifetimeDuration, {
            componentName
          });
        };
      }, [props]);

      // Track render performance
      startTime.current = performance.now();
      
      const component = <WrappedComponent {...props} ref={ref} />;
      
      const renderTime = performance.now() - startTime.current;
      
      React.useEffect(() => {
        performanceMonitor.recordMetric('ComponentRender', renderTime, {
          componentName
        });
      });

      return component;
    })
  );

  PerformanceTrackedComponent.displayName = `withPerformanceTracking(${componentName})`;
  
  return PerformanceTrackedComponent;
}

// Compound Component Pattern
export interface CompoundComponentAPI {
  Header: ComponentType<ComposableComponent>;
  Body: ComponentType<ComposableComponent>;
  Footer: ComponentType<ComposableComponent>;
  Actions: ComponentType<ComposableComponent>;
}

export function createCompoundComponent<T extends ComposableComponent>(
  BaseComponent: ComponentType<T>,
  componentName: string
): ComponentType<T> & CompoundComponentAPI {
  const Header: ComponentType<ComposableComponent> = ({ children, className = '', ...props }) => (
    <div className={`compound-header ${className}`} {...props}>
      {children}
    </div>
  );

  const Body: ComponentType<ComposableComponent> = ({ children, className = '', ...props }) => (
    <div className={`compound-body ${className}`} {...props}>
      {children}
    </div>
  );

  const Footer: ComponentType<ComposableComponent> = ({ children, className = '', ...props }) => (
    <div className={`compound-footer ${className}`} {...props}>
      {children}
    </div>
  );

  const Actions: ComponentType<ComposableComponent> = ({ children, className = '', ...props }) => (
    <div className={`compound-actions ${className}`} {...props}>
      {children}
    </div>
  );

  const CompoundComponent = withPerformanceTracking(BaseComponent, componentName) as ComponentType<T> & CompoundComponentAPI;
  
  CompoundComponent.Header = Header;
  CompoundComponent.Body = Body;
  CompoundComponent.Footer = Footer;
  CompoundComponent.Actions = Actions;

  return CompoundComponent;
}

// Render Props Pattern
export interface RenderPropsComponent<T> {
  children: (data: T) => ReactNode;
  fallback?: ReactNode;
  errorBoundary?: ComponentType<{ error: Error; reset: () => void }>;
}

export function createRenderPropsComponent<T>(
  useDataHook: () => { data: T | null; loading: boolean; error: Error | null; refetch: () => void },
  componentName: string
): ComponentType<RenderPropsComponent<T>> {
  return memo(({ children, fallback, errorBoundary: ErrorBoundary }) => {
    const { data, loading, error, refetch } = useDataHook();

    if (error && ErrorBoundary) {
      return <ErrorBoundary error={error} reset={refetch} />;
    }

    if (loading || !data) {
      return <>{fallback || <div>Loading...</div>}</>;
    }

    return <>{children(data)}</>;
  });
}

// Polymorphic Component Pattern
export interface PolymorphicProps<T extends React.ElementType> {
  as?: T;
  children?: ReactNode;
  className?: string;
}

export type PolymorphicComponentProps<
  T extends React.ElementType,
  Props = {}
> = PolymorphicProps<T> & 
  Props & 
  Omit<React.ComponentPropsWithoutRef<T>, keyof PolymorphicProps<T> | keyof Props>;

export function createPolymorphicComponent<DefaultElement extends React.ElementType, Props = {}>(
  defaultElement: DefaultElement,
  componentName: string
) {
  return memo(
    forwardRef<
      React.ElementRef<DefaultElement>,
      PolymorphicComponentProps<DefaultElement, Props>
    >(({ as, className = '', children, ...props }, ref) => {
      const Element = as || defaultElement;
      
      return (
        <Element
          ref={ref}
          className={`polymorphic-${componentName.toLowerCase()} ${className}`}
          {...props}
        >
          {children}
        </Element>
      );
    })
  );
}

// Context-based Component Communication
export interface ComponentContext {
  theme: 'light' | 'dark' | 'cosmic';
  size: 'small' | 'medium' | 'large';
  variant: 'primary' | 'secondary' | 'accent';
  disabled: boolean;
  readonly: boolean;
}

const defaultContext: ComponentContext = {
  theme: 'cosmic',
  size: 'medium',
  variant: 'primary',
  disabled: false,
  readonly: false
};

const ComponentContextProvider = createContext<ComponentContext>(defaultContext);

export const useComponentContext = () => {
  const context = useContext(ComponentContextProvider);
  if (!context) {
    throw new Error('useComponentContext must be used within a ComponentProvider');
  }
  return context;
};

export const ComponentProvider: React.FC<{
  children: ReactNode;
  value?: Partial<ComponentContext>;
}> = ({ children, value = {} }) => {
  const contextValue = useMemo(
    () => ({ ...defaultContext, ...value }),
    [value]
  );

  return (
    <ComponentContextProvider.Provider value={contextValue}>
      {children}
    </ComponentContextProvider.Provider>
  );
};

// Component Factory Pattern
export interface ComponentFactory<T> {
  create: (config: T) => ComponentType<any>;
  register: (name: string, component: ComponentType<any>) => void;
  get: (name: string) => ComponentType<any> | undefined;
  list: () => string[];
}

export function createComponentFactory<T>(): ComponentFactory<T> {
  const registry = new Map<string, ComponentType<any>>();

  return {
    create: (config: T) => {
      // Factory logic based on config
      return memo((props: any) => {
        const context = useComponentContext();
        
        return (
          <div 
            className={`factory-component ${context.theme} ${context.size}`}
            data-config={JSON.stringify(config)}
            {...props}
          />
        );
      });
    },

    register: (name: string, component: ComponentType<any>) => {
      registry.set(name, component);
      
      performanceMonitor.recordMetric('ComponentRegistration', 0, {
        componentName: name,
        registrySize: registry.size
      });
    },

    get: (name: string) => {
      return registry.get(name);
    },

    list: () => {
      return Array.from(registry.keys());
    }
  };
}

// Component Composition Utilities
export interface CompositionConfig {
  components: ComponentType<any>[];
  strategy: 'sequential' | 'parallel' | 'conditional';
  fallback?: ComponentType<any>;
  errorBoundary?: ComponentType<{ error: Error; children: ReactNode }>;
}

export function composeComponents(config: CompositionConfig): ComponentType<any> {
  return memo((props: any) => {
    const { components, strategy, fallback: Fallback, errorBoundary: ErrorBoundary } = config;

    const renderComponents = useCallback(() => {
      switch (strategy) {
        case 'sequential':
          return components.map((Component, index) => (
            <Component key={index} {...props} />
          ));

        case 'parallel':
          return (
            <div className="composition-parallel">
              {components.map((Component, index) => (
                <div key={index} className="composition-item">
                  <Component {...props} />
                </div>
              ))}
            </div>
          );

        case 'conditional':
          // Render first component that doesn't throw
          for (const Component of components) {
            try {
              return <Component {...props} />;
            } catch {
              continue;
            }
          }
          return Fallback ? <Fallback {...props} /> : null;

        default:
          return components.map((Component, index) => (
            <Component key={index} {...props} />
          ));
      }
    }, [components, strategy, props, Fallback]);

    if (ErrorBoundary) {
      return (
        <ErrorBoundary error={new Error('Composition error')}>
          {renderComponents()}
        </ErrorBoundary>
      );
    }

    return <>{renderComponents()}</>;
  });
}

// Memoization Strategies
export interface MemoizationStrategy {
  shallow: boolean;
  deep: boolean;
  custom?: (prevProps: any, nextProps: any) => boolean;
}

export function withMemoization<P extends object>(
  Component: ComponentType<P>,
  strategy: MemoizationStrategy = { shallow: true, deep: false }
) {
  if (strategy.custom) {
    return memo(Component, strategy.custom);
  }

  if (strategy.deep) {
    return memo(Component, (prevProps, nextProps) => {
      return JSON.stringify(prevProps) === JSON.stringify(nextProps);
    });
  }

  return memo(Component);
}

// Virtualization Helper
export interface VirtualizationConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  threshold?: number;
}

export function useVirtualization<T>(
  items: T[],
  config: VirtualizationConfig
) {
  const { itemHeight, containerHeight, overscan = 5, threshold = 50 } = config;
  const [scrollTop, setScrollTop] = React.useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
    items.length
  );

  const visibleItems = React.useMemo(() => {
    if (items.length < threshold) {
      return items.map((item, index) => ({ item, index }));
    }

    return items
      .slice(startIndex, endIndex)
      .map((item, relativeIndex) => ({
        item,
        index: startIndex + relativeIndex
      }));
  }, [items, startIndex, endIndex, threshold]);

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (event: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(event.currentTarget.scrollTop);
    }
  };
}

// Component Performance Analyzer
export class ComponentPerformanceAnalyzer {
  private static instance: ComponentPerformanceAnalyzer;
  private performanceData = new Map<string, Array<{
    metric: string;
    value: number;
    timestamp: number;
  }>>();

  static getInstance(): ComponentPerformanceAnalyzer {
    if (!ComponentPerformanceAnalyzer.instance) {
      ComponentPerformanceAnalyzer.instance = new ComponentPerformanceAnalyzer();
    }
    return ComponentPerformanceAnalyzer.instance;
  }

  recordComponentMetric(componentName: string, metric: string, value: number) {
    if (!this.performanceData.has(componentName)) {
      this.performanceData.set(componentName, []);
    }

    this.performanceData.get(componentName)!.push({
      metric,
      value,
      timestamp: performance.now()
    });

    // Keep only last 100 entries per component
    const entries = this.performanceData.get(componentName)!;
    if (entries.length > 100) {
      entries.splice(0, entries.length - 100);
    }
  }

  getComponentAnalysis(componentName: string) {
    const data = this.performanceData.get(componentName) || [];
    
    const metrics = data.reduce((acc, entry) => {
      if (!acc[entry.metric]) {
        acc[entry.metric] = [];
      }
      acc[entry.metric].push(entry.value);
      return acc;
    }, {} as Record<string, number[]>);

    const analysis: Record<string, any> = {};

    Object.entries(metrics).forEach(([metric, values]) => {
      analysis[metric] = {
        count: values.length,
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        median: values.sort((a, b) => a - b)[Math.floor(values.length / 2)]
      };
    });

    return analysis;
  }

  getAllComponentsAnalysis() {
    const allComponents: Record<string, any> = {};
    
    this.performanceData.forEach((_, componentName) => {
      allComponents[componentName] = this.getComponentAnalysis(componentName);
    });

    return allComponents;
  }

  generateRecommendations(componentName: string) {
    const analysis = this.getComponentAnalysis(componentName);
    const recommendations: string[] = [];

    // Check render performance
    if (analysis.ComponentRender?.average > 16) {
      recommendations.push(
        `Consider memoizing ${componentName} - average render time is ${analysis.ComponentRender.average.toFixed(2)}ms`
      );
    }

    // Check mount performance
    if (analysis.ComponentMount?.average > 100) {
      recommendations.push(
        `${componentName} has slow mount time (${analysis.ComponentMount.average.toFixed(2)}ms) - consider lazy loading`
      );
    }

    // Check lifetime
    if (analysis.ComponentLifetime?.average < 1000) {
      recommendations.push(
        `${componentName} has short lifetime (${analysis.ComponentLifetime.average.toFixed(2)}ms) - check if it's re-mounting unnecessarily`
      );
    }

    return recommendations;
  }
}

// Hook for component architecture analysis
export function useComponentAnalysis(componentName: string) {
  const analyzer = React.useMemo(
    () => ComponentPerformanceAnalyzer.getInstance(),
    []
  );

  const recordMetric = useCallback(
    (metric: string, value: number) => {
      analyzer.recordComponentMetric(componentName, metric, value);
    },
    [analyzer, componentName]
  );

  const getAnalysis = useCallback(() => {
    return analyzer.getComponentAnalysis(componentName);
  }, [analyzer, componentName]);

  const getRecommendations = useCallback(() => {
    return analyzer.generateRecommendations(componentName);
  }, [analyzer, componentName]);

  return {
    recordMetric,
    getAnalysis,
    getRecommendations
  };
}
