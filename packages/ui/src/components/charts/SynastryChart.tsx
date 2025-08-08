/**
 * Synastry Chart Component
 * Relationship compatibility charts
 */

import React from 'react';

export interface SynastryChartProps {
  person1?: {
    name: string;
    birthData: { date: string; time: string; location: string };
  };
  person2?: {
    name: string;
    birthData: { date: string; time: string; location: string };
  };
  aspects?: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
  }>;
  className?: string;
}

export const SynastryChart: React.FC<SynastryChartProps> = ({
  person1,
  person2,
  aspects = [],
  className = ''
}) => {
  return (
    <div className={`synastry-chart ${className}`}>
      <div className="chart-container p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Synastry Chart</h3>
        {person1 && person2 ? (
          <>
            <div className="persons-info grid grid-cols-2 gap-4 mb-4">
              <div className="person-1 p-3 bg-blue-50 rounded">
                <h4 className="font-medium">{person1.name}</h4>
                <p className="text-sm">{person1.birthData.date}</p>
              </div>
              <div className="person-2 p-3 bg-pink-50 rounded">
                <h4 className="font-medium">{person2.name}</h4>
                <p className="text-sm">{person2.birthData.date}</p>
              </div>
            </div>
            <div className="synastry-visualization h-48 bg-gray-100 rounded flex items-center justify-center mb-4">
              <span className="text-gray-500">Synastry chart visualization placeholder</span>
            </div>
            {aspects.length > 0 && (
              <div className="aspects-list">
                <h4 className="font-medium mb-2">Key Aspects:</h4>
                <div className="space-y-2">
                  {aspects.slice(0, 5).map((aspect, index) => (
                    <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                      {aspect.planet1} {aspect.aspect} {aspect.planet2} (±{aspect.orb}°)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Please provide birth data for both individuals
          </div>
        )}
      </div>
    </div>
  );
};

export default SynastryChart;
