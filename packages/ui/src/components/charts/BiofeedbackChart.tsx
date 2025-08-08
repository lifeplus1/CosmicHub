/**
 * Biofeedback Chart Component
 * Displays biometric and wellness data
 */

import React from 'react';

export interface BiofeedbackChartProps {
  data?: {
    heartRate?: number[];
    hrv?: number[];
    stress?: number[];
    timestamp: string[];
  };
  type?: 'realtime' | 'historical';
  duration?: '1h' | '24h' | '7d' | '30d';
  className?: string;
}

export const BiofeedbackChart: React.FC<BiofeedbackChartProps> = ({
  data,
  type = 'realtime',
  duration = '1h',
  className = ''
}) => {
  const hasData = data && data.timestamp.length > 0;

  return (
    <div className={`biofeedback-chart ${className}`}>
      <div className="chart-container p-4 border rounded-lg">
        <div className="header flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Biofeedback Chart</h3>
          <div className="controls flex gap-2">
            <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
              {type}
            </span>
            <span className="text-sm px-2 py-1 bg-gray-100 text-gray-800 rounded">
              {duration}
            </span>
          </div>
        </div>
        
        {hasData ? (
          <>
            <div className="metrics grid grid-cols-3 gap-4 mb-4">
              {data.heartRate && (
                <div className="metric p-3 bg-red-50 rounded">
                  <div className="text-xs text-red-600 uppercase tracking-wide">Heart Rate</div>
                  <div className="text-lg font-semibold text-red-700">
                    {data.heartRate[data.heartRate.length - 1]} BPM
                  </div>
                </div>
              )}
              {data.hrv && (
                <div className="metric p-3 bg-green-50 rounded">
                  <div className="text-xs text-green-600 uppercase tracking-wide">HRV</div>
                  <div className="text-lg font-semibold text-green-700">
                    {data.hrv[data.hrv.length - 1]} ms
                  </div>
                </div>
              )}
              {data.stress && (
                <div className="metric p-3 bg-orange-50 rounded">
                  <div className="text-xs text-orange-600 uppercase tracking-wide">Stress</div>
                  <div className="text-lg font-semibold text-orange-700">
                    {data.stress[data.stress.length - 1]}%
                  </div>
                </div>
              )}
            </div>
            
            <div className="chart-visualization h-40 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-gray-500">Biofeedback visualization placeholder</span>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No biofeedback data available
          </div>
        )}
      </div>
    </div>
  );
};

export default BiofeedbackChart;
