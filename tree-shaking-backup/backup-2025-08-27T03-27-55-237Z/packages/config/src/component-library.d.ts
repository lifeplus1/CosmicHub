/**
 * Minimal stable component architecture exports.
 * Keep lean; extend via new modules (do not bloat this surface).
 */
import React from 'react';
import type { ComponentType, ReactNode, ElementType, ReactElement, FC } from 'react';
export interface ComponentContext {
    theme: 'light' | 'dark' | 'cosmic';
    size: 'small' | 'medium' | 'large';
    variant: 'primary' | 'secondary' | 'accent';
    disabled: boolean;
    readonly: boolean;
}
export declare const ComponentProvider: FC<{
    value?: Partial<ComponentContext>;
    children: ReactNode;
}>;
export declare const useComponentContext: () => ComponentContext;
export declare function withPerformanceTracking<P extends Record<string, unknown>>(Wrapped: ComponentType<P>, name: string): FC<P>;
export interface ComposableComponentProps {
    children?: ReactNode;
    className?: string;
    'data-testid'?: string;
}
export interface CompoundComponentAPI {
    Header: FC<ComposableComponentProps>;
    Body: FC<ComposableComponentProps>;
    Footer: FC<ComposableComponentProps>;
    Actions: FC<ComposableComponentProps>;
}
export declare function createCompoundComponent<T extends ComposableComponentProps & Record<string, unknown>>(Base: ComponentType<T>, name: string): FC<T> & CompoundComponentAPI;
    children?: ReactNode;
    className?: string;
}
export type PolymorphicComponentProps<T extends ElementType, P extends object = object> = PolymorphicProps<T> & P & Omit<React.ComponentPropsWithoutRef<T>, keyof PolymorphicProps<T> | keyof P>;
export interface PolymorphicForwardComponent<TDefault extends ElementType> {
    <TAs extends ElementType = TDefault>(props: PolymorphicComponentProps<TAs> & {
        ref?: React.ComponentPropsWithRef<TAs>['ref'];
    }): ReactElement | null;
    displayName?: string;
}
export declare function createPolymorphicComponent<TDefault extends ElementType = 'div'>(defaultTag: TDefault, displayName?: string): PolymorphicForwardComponent<TDefault>;
export declare class ComponentPerformanceAnalyzer {
    private static instance;
    private data;
    static getInstance(): ComponentPerformanceAnalyzer;
    recordComponentMetric(component: string, metric: string, value: number): void;
    getComponentAnalysis(component: string): Record<string, {
        count: number;
        average: number;
        min: number;
        max: number;
    }>;
    generateRecommendations(component: string): string[];
}
export declare function useComponentAnalysis(name: string): {
    recordMetric: (metric: string, value: number) => void;
    getAnalysis: () => Record<string, {
        count: number;
        average: number;
        min: number;
        max: number;
    }>;
    getRecommendations: () => string[];
};
export interface ComponentFactory<TConfig> {
    create(config: TConfig): FC;
    register(name: string, component: ComponentType<unknown>): void;
    get(name: string): ComponentType<unknown> | undefined;
    list(): string[];
}
export declare function createComponentFactory<TConfig extends Record<string, unknown>>(): ComponentFactory<TConfig>;
    strategy: 'sequential' | 'parallel' | 'conditional';
    fallback?: ComponentType<unknown>;
}
export declare function composeComponents(cfg: CompositionConfig): FC;
    deep?: boolean;
    custom?: (prev: unknown, next: unknown) => boolean;
}
export declare function withMemoization<P extends Record<string, unknown>>(Component: ComponentType<P>, strategy?: MemoizationStrategy): ComponentType<P>;
export declare const isValidElement: (el: unknown) => el is ReactElement;
export declare const getDisplayName: (C: ComponentType<unknown>) => string;
//# sourceMappingURL=component-library.d.ts.map
