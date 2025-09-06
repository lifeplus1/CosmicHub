// Progress Bar Component for AI-001 Dashboard
// Enhanced with Component Best Practices: Performance + Accessibility
import React, { useMemo, useCallback, useRef, useEffect } from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
  color?: string;
  label?: string;
  showPercentage?: boolean;
  animated?: boolean;
  onComplete?: () => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = React.memo(({
  progress,
  className = '',
  color = 'bg-cosmic-green',
  label,
  showPercentage = false,
  animated = true,
  onComplete,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  const previousProgressRef = useRef<number>(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Memoized progress calculation with proper clamping
  const clampedProgress = useMemo(() => {
    return Math.max(0, Math.min(progress, 100));
  }, [progress]);

  // Memoized width calculation using Tailwind classes
  const progressClasses = useMemo(() => {
    const widthClass = clampedProgress === 0 ? 'w-0' : 
                      clampedProgress >= 100 ? 'w-full' : 
                      `w-[${clampedProgress}%]`;
    
    return `${color} h-2 rounded-full ${animated ? 'transition-all duration-300 ease-out' : ''} ${widthClass}`;
  }, [clampedProgress, color, animated]);

  // Memoized ARIA attributes
  const ariaAttributes = useMemo(() => ({
    'aria-valuenow': clampedProgress,
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-label': ariaLabel ?? (label ? `${label}: ${clampedProgress} percent` : `Progress: ${clampedProgress} percent`),
    'aria-describedby': ariaDescribedBy,
  }), [clampedProgress, ariaLabel, label, ariaDescribedBy]);

  // Memoized completion detection and callback
  const handleCompletion = useCallback(() => {
    if (onComplete && clampedProgress === 100 && previousProgressRef.current < 100) {
      onComplete();
    }
    previousProgressRef.current = clampedProgress;
  }, [clampedProgress, onComplete]);

  // Effect for completion detection
  useEffect(() => {
    handleCompletion();
  }, [handleCompletion]);

  // Focus management for accessibility
  useEffect(() => {
    const progressElement = progressBarRef.current;
    if (progressElement && clampedProgress === 100) {
      // Announce completion to screen readers
      progressElement.setAttribute('aria-live', 'polite');
      progressElement.setAttribute('aria-atomic', 'true');
    }
  }, [clampedProgress]);

  // Memoized label rendering
  const renderLabel = useMemo(() => {
    if (!label && !showPercentage) return null;
    
    return (
      <div className="flex justify-between items-center mb-2 text-sm text-cosmic-silver">
        {label && <span>{label}</span>}
        {showPercentage && (
          <span className="font-semibold">
            {clampedProgress.toFixed(0)}%
          </span>
        )}
      </div>
    );
  }, [label, showPercentage, clampedProgress]);

  return (
    <div className={`w-full ${className}`}>
      {renderLabel}
      <div
        className="w-full bg-cosmic-dark/50 rounded-full h-2 overflow-hidden shadow-inner"
        role="progressbar"
        {...ariaAttributes}
      >
        <div
          ref={progressBarRef}
          className={progressClasses}
          aria-hidden="true" // Hide from screen readers since parent has ARIA attributes
        />
      </div>
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
