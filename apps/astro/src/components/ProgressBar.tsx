import React from 'react';
import styles from './UserProfile.module.css';

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
  
  return (
    <div className={`${styles['progress-container']} ${className}`}>
      <div 
        className={`${styles['progress-bar']} ${styles[`progress-bar-${color}`]}`}
        data-percentage={clampedPercentage}
      />
    </div>
  );
};

export default ProgressBar;