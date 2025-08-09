/**
 * Ephemeris chart component for displaying planetary positions.
 * 
 * This component uses the ephemeris service to fetch and display
 * real-time planetary positions for astrological analysis.
 */

import React from 'react';
import {
  useAllPlanetaryPositions,
  useEphemerisHealth,
  formatPlanetPosition,
  getAstrologicalSign,
  type PlanetName,
} from '../../services/ephemeris';

interface EphemerisChartProps {
  date: Date;
}

interface PlanetRowProps {
  planet: PlanetName;
  position: number;
  retrograde: boolean;
}

const PlanetRow: React.FC<PlanetRowProps> = ({ planet, position, retrograde }) => {
  const sign = getAstrologicalSign(position);
  
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="py-2 px-3 font-medium capitalize">{planet}</td>
      <td className="py-2 px-3">{sign.sign}</td>
      <td className="py-2 px-3 text-right">
        {sign.signDegrees}° {sign.signMinutes}'
        {retrograde && (
          <span className="ml-1 text-red-500" title="Retrograde">
            ℞
          </span>
        )}
      </td>
      <td className="py-2 px-3 text-right text-sm text-gray-600">
        {position.toFixed(2)}°
      </td>
    </tr>
  );
};

const HealthIndicator: React.FC = () => {
  const { data: health, isLoading, error } = useEphemerisHealth();
  
  if (isLoading) {
    return (
      <div className="flex items-center text-sm text-gray-500">
        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
        Checking service...
      </div>
    );
  }
  
  if (error || health?.status !== 'healthy') {
    return (
      <div className="flex items-center text-sm text-red-600">
        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
        Service unavailable
      </div>
    );
  }
  
  return (
    <div className="flex items-center text-sm text-green-600">
      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
      Service healthy
    </div>
  );
};

export const EphemerisChart: React.FC<EphemerisChartProps> = ({ date }) => {
  const {
    data: positions,
    isLoading,
    error,
    refetch,
  } = useAllPlanetaryPositions(date);
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Planetary Positions</h3>
          <HealthIndicator />
        </div>
        <div className="animate-pulse">
          <div className="space-y-3">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Planetary Positions</h3>
          <HealthIndicator />
        </div>
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">
            Failed to load planetary positions
          </div>
          <div className="text-gray-600 text-sm mb-4">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (!positions) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Planetary Positions</h3>
          <HealthIndicator />
        </div>
        <div className="text-center py-8 text-gray-600">
          No planetary position data available
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Planetary Positions</h3>
          <HealthIndicator />
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Planet
              </th>
              <th className="py-3 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sign
              </th>
              <th className="py-3 px-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="py-3 px-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Degree
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(positions).map(([planet, position]) => (
              <PlanetRow
                key={planet}
                planet={planet as PlanetName}
                position={position.position}
                retrograde={position.retrograde}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
