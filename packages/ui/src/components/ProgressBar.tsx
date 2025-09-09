import React from 'react';
import { cn } from '../utils/cn';

interface ProgressBarProps {
  // Support both percentage and progress props for compatibility
  percentage?: number;
  progress?: number;
  color?: 'purple' | 'blue' | 'cyan' | 'green' | (string & Record<never, never>); // Allow custom colors
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  animate?: boolean;
  animated?: boolean; // Alias for animate
  label?: string;
  onComplete?: () => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  progress,
  color = 'purple',
  className = '',
  size = 'md',
  showPercentage = false,
  animate = true,
  animated,
  label,
  onComplete,
}) => {
  // Support both percentage and progress props
  const value = percentage ?? progress ?? 0;
  const clampedPercentage = Math.min(100, Math.max(0, Math.round(value)));
  const isAnimated = animate || animated;

  const colorVariants: Record<string, string> = {
    purple: 'bg-gradient-to-r from-purple-500 to-pink-500',
    blue: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    cyan: 'bg-gradient-to-r from-cyan-400 to-blue-500',
    green: 'bg-gradient-to-r from-green-400 to-emerald-500',
  };

  const sizeVariants = {
    sm: 'h-1',
    md: 'h-2.5',
    lg: 'h-4',
  };

  // Get color class - either from variants or use as-is for custom colors
  const colorClass = colorVariants[color] ?? color ?? colorVariants.purple;

  // Handle completion callback
  React.useEffect(() => {
    if (onComplete && clampedPercentage === 100) {
      onComplete();
    }
  }, [clampedPercentage, onComplete]);

  return (
    <div className={cn('w-full', className)}>
      {(label ?? showPercentage) && (
        <div className='flex justify-between text-sm text-white/70 mb-2'>
          {label && <span>{label}</span>}
          {showPercentage && <span>{clampedPercentage}%</span>}
        </div>
      )}

      <div
        className={cn(
          'relative overflow-hidden bg-white/10 rounded-full w-full',
          sizeVariants[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorClass,
            isAnimated && 'animate-pulse'
          )}
          data-width={`${clampedPercentage}%`}
          {...{
            style: { width: `${clampedPercentage}%` }
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
