import React from 'react';
import * as Progress from '@radix-ui/react-progress';
import { cn } from '../utils/cn';

interface ProgressBarProps {
  percentage: number;
  color?: 'purple' | 'blue' | 'cyan' | 'green';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  animate?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  color = 'purple',
  className = '',
  size = 'md',
  showPercentage = false,
  animate = true,
}) => {
  const clampedPercentage = Math.min(100, Math.max(0, Math.round(percentage)));

  const colorVariants = {
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

  return (
    <div className={cn('space-y-1', className)}>
      {showPercentage && (
        <div className='flex justify-between text-sm text-white/70'>
          <span>Progress</span>
          <span>{clampedPercentage}%</span>
        </div>
      )}

      <Progress.Root
        className={cn(
          'relative overflow-hidden bg-white/10 rounded-full',
          sizeVariants[size]
        )}
        value={clampedPercentage}
        max={100}
      >
        <Progress.Indicator
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorVariants[color],
            animate && 'animate-pulse'
          )}
          style={{
            transform: `translateX(-${100 - clampedPercentage}%)`,
          }}
        />
      </Progress.Root>
    </div>
  );
};

export default ProgressBar;
