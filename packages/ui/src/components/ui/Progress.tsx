import * as React from 'react';
import { cn } from '../../utils/cn';

export interface ProgressComponentProps {
  value?: number;
  max?: number;
  size?: 'sm' | 'default' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressComponentProps>(
  ({ value = 0, max = 100, size = 'default', showText = false, className, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    // Round to nearest 5% for the step classes
    const stepValue = Math.round(percentage / 5) * 5;
    const widthClass = `w-step-${stepValue}`;

    return (
      <div
        ref={ref}
        className={cn('progress-container', size !== 'default' && `progress-${size}`, className)}
        {...props}
      >
        <div className="progress-track">
          <div 
            className={cn('progress-fill progress-fill-animated', widthClass)}
            role="progressbar"
            aria-label={`Progress: ${Math.round(percentage)}% complete`}
          />
        </div>
        {showText && (
          <div className="progress-text">
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
