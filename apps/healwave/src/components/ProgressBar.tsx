import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  percentage: number;
  color?: 'purple' | 'blue';
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  percentage, 
  color = 'purple', 
  className = '' 
}) => {
  const clampedPercentage = Math.min(100, Math.max(0, Math.round(percentage)));
  
  const colorClasses = {
    purple: 'bg-purple-600',
    blue: 'bg-blue-600'
  };
  
  return (
    <div className={`${styles['progress-container']} ${className}`}>
      <div 
        className={`${styles['progress-bar']} ${colorClasses[color]}`}
        data-percentage={clampedPercentage}
      />
    </div>
  );
};

export default ProgressBar;
