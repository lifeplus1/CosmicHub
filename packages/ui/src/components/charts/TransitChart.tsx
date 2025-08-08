/**
 * Transit Chart Component
 * Shows planetary transits and their effects
 */

import React from 'react';

export interface TransitChartProps {
  date?: string;
  location?: string;
  aspects?: string[];
  className?: string;
}

export const TransitChart: React.FC<TransitChartProps> = ({
  date = new Date().toISOString().split('T')[0],
  location = '',
  aspects = [],
  className = ''
}) => {
  return (
    <div className={`transit-chart ${className}`}>
      <div className="chart-container p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Transit Chart</h3>
        <div className="chart-info mb-4">
          <p>Date: {date}</p>
          {location && <p>Location: {location}</p>}
        </div>
        <div className="transit-visualization h-48 bg-gray-100 rounded flex items-center justify-center mb-4">
          <span className="text-gray-500">Transit chart visualization placeholder</span>
        </div>
        {aspects.length > 0 && (
          <div className="aspects-list">
            <h4 className="font-medium mb-2">Current Aspects:</h4>
            <ul className="text-sm space-y-1">
              {aspects.map((aspect, index) => (
                <li key={index} className="text-gray-600">{aspect}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransitChart;
