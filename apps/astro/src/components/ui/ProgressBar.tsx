// Progress Bar Component for AI-001 Dashboard
import React from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  className = '',
  color = 'bg-cosmic-green' 
}) => {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(progress, 100));
  
  // Generate width class using Tailwind's arbitrary values
  const getWidthClass = (progressValue: number): string => {
    if (progressValue === 0) return 'w-0';
    if (progressValue >= 100) return 'w-full';
    
    // Use Tailwind's arbitrary value syntax
    return `w-[${progressValue}%]`;
  };
  
  const widthClass = getWidthClass(clampedProgress);
  
  return (
    <div className={`w-full bg-cosmic-dark/50 rounded-full h-2 overflow-hidden ${className}`}>
      <div 
        className={`${color} h-2 rounded-full transition-all duration-300 ${widthClass}`}
        role="progressbar"
        {...({
          'aria-valuenow': clampedProgress,
          'aria-valuemin': 0,
          'aria-valuemax': 100,
          'aria-label': `Progress: ${clampedProgress} percent`
        } as React.AriaAttributes)}
      />
    </div>
  );
};

export default ProgressBar;
