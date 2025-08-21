import React, { type ReactNode } from 'react';

/**
 * VisuallyHidden
 * Renders content that remains available to assistive technologies while being visually hidden.
 * Use for live updates, contextual labels for icon-only buttons, and status messages.
 */
export interface VisuallyHiddenProps {
  as?: keyof HTMLElementTagNameMap;
  children: ReactNode;
  /**
   * If true, element becomes visible when focused (for skip links). Ensure element is focusable.
   */
  focusable?: boolean;
  className?: string;
}

const baseClass = 'sr-only';
const focusableClass = 'sr-only-focusable';

export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  as: Component = 'span',
  children,
  focusable = false,
  className = ''
}) => {
  const classes = [baseClass, focusable ? focusableClass : '', className].filter(Boolean).join(' ');
  return <Component className={classes}>{children}</Component>;
};

VisuallyHidden.displayName = 'VisuallyHidden';

export default VisuallyHidden;
