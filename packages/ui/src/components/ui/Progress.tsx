import React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '../../utils/cn';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showValue?: boolean;
  variant?: 'default' | 'sm' | 'lg' | 'xl';
  animated?: boolean;
}

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({
  value,
  max = 100,
  className,
  showValue = false,
  variant = 'default',
  ...props
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('progress-container', variant !== 'default' && `progress-${variant}`, className)}>
      <ProgressPrimitive.Root
        ref={ref}
        className="progress-track"
        value={percentage}
        max={100}
        {...props}
      >
        <ProgressPrimitive.Indicator
          style={{ '--progress-value': `${percentage}%` } as React.CSSProperties}
        />
      </ProgressPrimitive.Root>
      {showValue && (
        <div className="progress-text">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
});

Progress.displayName = 'Progress';
