/**
 * Astrology Chart Component
 * Renders birth charts and astrological data
 */

import React from 'react';

export interface AstrologyChartProps {
  birthData?: {
    date: string;
    time: string;
    location: string;
  };
  chartType?: 'natal' | 'transit' | 'composite';
  className?: string;
}

export const AstrologyChart: React.FC<AstrologyChartProps> = ({
  birthData,
  chartType = 'natal',
  className = ''
}) => {
  return (
    <div className={`astrology-chart ${className}`}>
      <div className="chart-container p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Astrology Chart ({chartType})</h3>
        {birthData ? (
          <div className="chart-content">
            <p>Date: {birthData.date}</p>
            <p>Time: {birthData.time}</p>
            <p>Location: {birthData.location}</p>
            <div className="chart-svg mt-4 h-64 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-gray-500">Chart visualization placeholder</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No birth data provided
          </div>
        )}
      </div>
    </div>
  );
};

export default AstrologyChart;
