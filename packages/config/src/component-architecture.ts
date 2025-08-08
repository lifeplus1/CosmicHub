/**
 * Component Architecture Utilities
 * Advanced patterns for React component composition
 */

import React, { ComponentProps, ElementType, ReactElement, createContext, useContext } from 'react';

// Polymorphic component types
export type PolymorphicRef<C extends ElementType> = ComponentProps<C>['ref'];

export type PolymorphicComponentProps<
  C extends ElementType,
  Props = {}
> = Props & ComponentProps<C> & {
  as?: C;
};

export type PolymorphicComponentPropsWithRef<
  C extends ElementType,
  Props = {}
> = PolymorphicComponentProps<C, Props> & {
  ref?: PolymorphicRef<C>;
};

// Component context utilities
export const createComponentContext = <T extends Record<string, any>>(
  defaultValue: T,
  contextName: string
) => {
  const Context = createContext<T | undefined>(undefined);

  const useComponentContext = () => {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error(`useComponentContext must be used within a ${contextName}Provider`);
    }
    return context;
  };

  return {
    Provider: Context.Provider,
    useComponentContext,
  };
};

// Export the hook directly for backwards compatibility
export const useComponentContext = () => {
  // This is a generic implementation - should be overridden by specific contexts
  return {};
};

// Compound component utilities
export const createCompoundComponent = <T extends React.ComponentType<any>>(
  Component: T,
  subComponents: Record<string, React.ComponentType<any>>
) => {
  Object.keys(subComponents).forEach((key) => {
    (Component as any)[key] = subComponents[key];
  });
  return Component as T & typeof subComponents;
};

// Polymorphic component creator
export const createPolymorphicComponent = <
  DefaultElement extends ElementType,
  Props extends Record<string, any>
>(
  defaultElement: DefaultElement
) => {
  return React.forwardRef<
    any,
    PolymorphicComponentPropsWithRef<ElementType, Props>
  >(({ as, ...props }, ref) => {
    const Element = as || defaultElement;
    return React.createElement(Element, { ...props, ref });
  });
};

// Performance tracking HOC
export const withPerformanceTracking = <P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const displayName = componentName || Component.displayName || Component.name || 'Component';
    
    React.useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Log performance metrics
        if (duration > 16) { // Warn if component takes longer than one frame
          console.warn(`${displayName} render took ${duration.toFixed(2)}ms`);
        }
      };
    });

    return React.createElement(Component, { ...props, ref });
  });

  WrappedComponent.displayName = `withPerformanceTracking(${
    componentName || Component.displayName || Component.name || 'Component'
  })`;

  return WrappedComponent;
};

// Component composition utilities
export interface CompoundComponentPattern<T> {
  Root: React.ComponentType<T>;
  [key: string]: React.ComponentType<any>;
}

export const composeComponents = <T extends Record<string, React.ComponentType<any>>>(
  components: T
): T => {
  return components;
};

// Accessibility utilities
export const createAccessibleComponent = <P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  defaultAriaProps: Partial<React.AriaAttributes> = {}
) => {
  return React.forwardRef<any, P & React.AriaAttributes>((props, ref) => {
    const ariaProps = { ...defaultAriaProps, ...props };
    return React.createElement(Component, { ...ariaProps, ref });
  });
};

// Type guards and utilities
export const isValidElement = (element: any): element is ReactElement => {
  return React.isValidElement(element);
};

export const getDisplayName = (Component: React.ComponentType<any>): string => {
  return Component.displayName || Component.name || 'Component';
};
