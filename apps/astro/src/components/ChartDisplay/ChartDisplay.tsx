import React from 'react';

export interface ChartDisplayProps {
  data?: any;
  isLoading?: boolean;
  className?: string;
}

export const ChartDisplay: React.FC<ChartDisplayProps> = ({ 
  data, 
  isLoading = false, 
  className = '' 
}) => {
  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg h-96 ${className}`}>
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-500">Loading chart...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`bg-gray-100 rounded-lg h-96 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">No chart data available</span>
      </div>
    );
  }

  return (
    <div className={`chart-display ${className}`}>
      <div className="chart-container">
        {/* Chart visualization would go here */}
        <div className="flex items-center justify-center h-96 bg-cosmic-dark rounded-lg">
          <span className="text-gold-400">Chart visualization placeholder</span>
        </div>
      </div>
    </div>
  );
};

export default ChartDisplay;