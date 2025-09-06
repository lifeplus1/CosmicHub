// StatefulAccordion - Enhanced with Component Best Practices: Performance + Accessibility
import React, { useMemo, useEffect, useCallback } from 'react';
import { Accordion } from '@cosmichub/ui';

interface StatefulAccordionProps {
  type: 'single' | 'multiple';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const StatefulAccordion: React.FC<StatefulAccordionProps> = React.memo(({
  type,
  children,
  className = '',
  disabled = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  // Memoized ARIA attributes
  const ariaAttributes = useMemo(() => {
    const attrs: Record<string, string | boolean> = {};
    
    if (ariaLabel) attrs['aria-label'] = ariaLabel;
    if (ariaDescribedBy) attrs['aria-describedby'] = ariaDescribedBy;
    if (disabled) attrs['aria-disabled'] = true;
    
    return attrs;
  }, [ariaLabel, ariaDescribedBy, disabled]);

  // Memoized enhanced className with accessibility and performance optimizations
  const enhancedClassName = useMemo(() => {
    const baseClasses = 'focus-within:ring-2 focus-within:ring-cosmic-blue focus-within:ring-offset-2 transition-all duration-200';
    const disabledClasses = disabled ? 'opacity-50 pointer-events-none' : '';
    
    return `${baseClasses} ${disabledClasses} ${className}`.trim();
  }, [disabled, className]);

  // Performance monitoring effect
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now();
      return () => {
        const endTime = performance.now();
        if (endTime - startTime > 16) {
          console.warn('StatefulAccordion render took longer than 16ms:', endTime - startTime);
        }
      };
    }
    return undefined;
  });

  // Accessibility enhancement: keyboard interaction and focus management
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    // Enhanced keyboard navigation for accessibility
    switch (event.key) {
      case 'Home': {
        event.preventDefault();
        // Focus first accordion item
        const firstItem = event.currentTarget.querySelector('[role="button"]') as HTMLElement;
        firstItem?.focus();
        break;
      }
      case 'End': {
        event.preventDefault();
        // Focus last accordion item
        const accordionItems = event.currentTarget.querySelectorAll('[role="button"]');
        const lastItem = accordionItems[accordionItems.length - 1] as HTMLElement;
        lastItem?.focus();
        break;
      }
      case 'ArrowDown': {
        event.preventDefault();
        // Focus next accordion item
        const nextItem = (event.target as HTMLElement).closest('[data-value]')?.nextElementSibling?.querySelector('[role="button"]') as HTMLElement;
        nextItem?.focus();
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        // Focus previous accordion item
        const prevItem = (event.target as HTMLElement).closest('[data-value]')?.previousElementSibling?.querySelector('[role="button"]') as HTMLElement;
        prevItem?.focus();
        break;
      }
      default:
        break;
    }
  }, [disabled]);

  // Enhanced Accordion with performance and accessibility improvements
  return (
    <div
      className={enhancedClassName}
      onKeyDown={handleKeyDown}
      {...ariaAttributes}
    >
      <Accordion
        type={type}
        collapsible={true}
        className="space-y-2"
      >
        {children}
      </Accordion>
    </div>
  );
});

StatefulAccordion.displayName = 'StatefulAccordion';

export default StatefulAccordion;
