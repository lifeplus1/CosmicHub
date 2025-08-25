/**
 * Minimal stable component architecture exports.
 * Keep lean; extend via new modules (do not bloat this surface).
 */
import React, { createContext, useContext, useMemo, useRef, useCallback, memo, type ReactNode, type ElementType, type ReactElement, type ComponentType, type FC } from 'react';
import { logger } from './utils/logger';

// ---------------- Context ----------------
export interface ComponentContext { theme: 'light' | 'dark' | 'cosmic'; size: 'small' | 'medium' | 'large'; variant: 'primary' | 'secondary' | 'accent'; disabled: boolean; readonly: boolean }
const defaultContext: ComponentContext = { theme: 'cosmic', size: 'medium', variant: 'primary', disabled: false, readonly: false };
const Ctx = createContext<ComponentContext>(defaultContext);
export const ComponentProvider: FC<{ value?: Partial<ComponentContext>; children: ReactNode }> = ({ value = {}, children }) => {
  const merged = useMemo(() => ({ ...defaultContext, ...value }), [value]);
  return <Ctx.Provider value={merged}>{children}</Ctx.Provider>;
};
export const useComponentContext = (): ComponentContext => useContext(Ctx);

// -------------- Performance HOC --------------
export function withPerformanceTracking<P extends Record<string, unknown>>(Wrapped: ComponentType<P>, name: string): FC<P> {
  const Tracked: FC<P> = (props) => {
    const mountStart = useRef<number>(performance.now());
    React.useEffect(() => {
      const ms = performance.now() - mountStart.current;
      logger.debug('component.mount', { component: name, ms });
      return () => { logger.debug('component.unmount', { component: name }); };
    }, []);
    const renderStart = performance.now();
    const element = <Wrapped {...props} />;
    logger.debug('component.render', { component: name, ms: performance.now() - renderStart });
    return element;
  };
  Tracked.displayName = `WithPerf(${(Wrapped as { displayName?: string; name?: string }).displayName ?? (Wrapped as { name?: string }).name ?? 'Component'})`;
  return memo(Tracked);
}

// -------------- Compound Components --------------
export interface ComposableComponentProps { children?: ReactNode; className?: string; 'data-testid'?: string }
export interface CompoundComponentAPI { Header: FC<ComposableComponentProps>; Body: FC<ComposableComponentProps>; Footer: FC<ComposableComponentProps>; Actions: FC<ComposableComponentProps> }
export function createCompoundComponent<T extends ComposableComponentProps & Record<string, unknown>>(Base: ComponentType<T>, name: string): FC<T> & CompoundComponentAPI {
  const Header: FC<ComposableComponentProps> = ({ children, className = '', ...rest }) => <div className={`compound-header ${className}`} {...rest}>{children}</div>;
  const Body: FC<ComposableComponentProps> = ({ children, className = '', ...rest }) => <div className={`compound-body ${className}`} {...rest}>{children}</div>;
  const Footer: FC<ComposableComponentProps> = ({ children, className = '', ...rest }) => <div className={`compound-footer ${className}`} {...rest}>{children}</div>;
  const Actions: FC<ComposableComponentProps> = ({ children, className = '', ...rest }) => <div className={`compound-actions ${className}`} {...rest}>{children}</div>;
  const PerfBase = withPerformanceTracking<T>(Base, name);
  const Combined = PerfBase as FC<T> & CompoundComponentAPI;
  Combined.Header = Header; Combined.Body = Body; Combined.Footer = Footer; Combined.Actions = Actions;
  return Combined;
}

// -------------- Polymorphic --------------
export interface PolymorphicProps<T extends ElementType> { as?: T; children?: ReactNode; className?: string }
export type PolymorphicComponentProps<T extends ElementType, P extends object = object> = PolymorphicProps<T> & P & Omit<React.ComponentPropsWithoutRef<T>, keyof PolymorphicProps<T> | keyof P>;
export interface PolymorphicForwardComponent<TDefault extends ElementType> {
  <TAs extends ElementType = TDefault>(props: PolymorphicComponentProps<TAs> & { ref?: React.ComponentPropsWithRef<TAs>['ref'] }): ReactElement | null;
  displayName?: string;
}
export function createPolymorphicComponent<TDefault extends ElementType = 'div'>(defaultTag: TDefault, displayName?: string): PolymorphicForwardComponent<TDefault> {
  type AnyElement = ElementType;
  // Define the inner component with proper generic typing
  const Poly = (({ as, ...rest }: { as?: AnyElement } & Record<string, unknown>) => {
    const Tag: AnyElement = as ?? defaultTag;
    return React.createElement(Tag, rest as Record<string, unknown>);
  }) as unknown as PolymorphicForwardComponent<TDefault>;
  Poly.displayName = displayName ?? `Poly(${String(defaultTag)})`;
  return Poly;
}

// -------------- Performance Analyzer --------------
interface PerfEntry { metric: string; value: number; t: number }
export class ComponentPerformanceAnalyzer {
  private static instance: ComponentPerformanceAnalyzer | null = null;
  private data = new Map<string, PerfEntry[]>();
  static getInstance(): ComponentPerformanceAnalyzer { return this.instance ?? (this.instance = new ComponentPerformanceAnalyzer()); }
  recordComponentMetric(component: string, metric: string, value: number): void {
    const arr = this.data.get(component) ?? [];
    arr.push({ metric, value, t: performance.now() });
    if (arr.length > 200) arr.shift();
    this.data.set(component, arr);
  }
  getComponentAnalysis(component: string): Record<string, { count: number; average: number; min: number; max: number }> {
    const rows = this.data.get(component) ?? [];
    const grouped: Record<string, number[]> = {};
    for (const r of rows) (grouped[r.metric] ||= []).push(r.value);
    const out: Record<string, { count: number; average: number; min: number; max: number }> = {};
    Object.entries(grouped).forEach(([metric, vals]) => {
      out[metric] = { count: vals.length, average: vals.reduce((a, b) => a + b, 0) / vals.length, min: Math.min(...vals), max: Math.max(...vals) };
    });
    return out;
  }
  generateRecommendations(component: string): string[] {
    const a = this.getComponentAnalysis(component);
    const rec: string[] = [];
  if (a['ComponentRender']?.average !== undefined && a['ComponentRender'].average > 16) {
    rec.push(`Optimize ${component} render time`);
  }
  if (a['ComponentMount']?.average !== undefined && a['ComponentMount'].average > 100) {
    rec.push(`${component} mount is slow`);
  }
    return rec;
  }
}
export function useComponentAnalysis(name: string): { recordMetric: (metric: string, value: number) => void; getAnalysis: () => Record<string, { count: number; average: number; min: number; max: number }>; getRecommendations: () => string[] } {
  const analyzer = useMemo(() => ComponentPerformanceAnalyzer.getInstance(), []);
  const recordMetric = useCallback((metric: string, value: number) => analyzer.recordComponentMetric(name, metric, value), [analyzer, name]);
  return {
    recordMetric,
    getAnalysis: () => analyzer.getComponentAnalysis(name),
    getRecommendations: () => analyzer.generateRecommendations(name)
  };
}

// -------------- Utilities --------------
export interface ComponentFactory<TConfig> { create(config: TConfig): FC; register(name: string, component: ComponentType<unknown>): void; get(name: string): ComponentType<unknown> | undefined; list(): string[] }
export function createComponentFactory<TConfig extends Record<string, unknown>>(): ComponentFactory<TConfig> {
  const reg = new Map<string, ComponentType<unknown>>();
  return {
    create(config): FC {
      const serialized = JSON.stringify(config);
      const Comp: FC = () => <div data-config={serialized} />;
      return Comp;
    },
    register(name, component): void { reg.set(name, component); logger.debug('component.register', { name, size: reg.size }); },
    get: (name) => reg.get(name),
    list: () => [...reg.keys()]
  };
}

export interface CompositionConfig { components: ComponentType<unknown>[]; strategy: 'sequential' | 'parallel' | 'conditional'; fallback?: ComponentType<unknown> }
export function composeComponents(cfg: CompositionConfig): FC {
  const { components, strategy, fallback: Fallback } = cfg;
  const Composed: FC = (props) => {
    if (strategy === 'sequential') return <>{components.map((C, i) => <C key={i} {...props} />)}</>;
    if (strategy === 'parallel') return <div className="composition-parallel">{components.map((C, i) => <div key={i}><C {...props} /></div>)}</div>;
    if (strategy === 'conditional') {
      for (const C of components) {
        try { return <C {...props} />; } catch { /* continue */ }
      }
      return Fallback ? <Fallback {...props} /> : null;
    }
    return <>{components.map((C, i) => <C key={i} {...props} />)}</>;
  };
  Composed.displayName = 'ComposedComponents';
  return Composed;
}

export interface MemoizationStrategy { shallow?: boolean; deep?: boolean; custom?: (prev: unknown, next: unknown) => boolean }
export function withMemoization<P extends Record<string, unknown>>(Component: ComponentType<P>, strategy: MemoizationStrategy = { shallow: true }): ComponentType<P> {
  if (strategy.custom) return memo(Component, strategy.custom as (a: P, b: P) => boolean) as unknown as ComponentType<P>;
  if (strategy.deep === true) return memo(Component, (a, b) => JSON.stringify(a) === JSON.stringify(b)) as unknown as ComponentType<P>;
  return memo(Component) as unknown as ComponentType<P>;
}

export const isValidElement = (el: unknown): el is ReactElement => React.isValidElement(el);
export const getDisplayName = (C: ComponentType<unknown>): string => (C as { displayName?: string; name?: string }).displayName ?? (C as { name?: string }).name ?? 'Component';

