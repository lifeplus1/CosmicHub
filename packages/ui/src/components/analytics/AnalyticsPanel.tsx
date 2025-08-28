/**
 * Analytics Panel Component
 * Displays analytics and metrics data
 */

import React from 'react';

interface AnalyticsPanelProps {
  className?: string;
  showDetailed?: boolean;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  className = '',
  showDetailed = false,
}) => {
  return (
    <div className={`analytics-panel ${className}`}>
      <div className='panel-container p-4 border rounded-lg'>
        <h3 className='text-lg font-semibold mb-4'>Analytics</h3>
        <div className='metrics-display'>
          <p className='text-gray-600'>
            {showDetailed
              ? 'Detailed analytics data'
              : 'Basic analytics summary'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
