/**
 * Frequency Visualizer Component
 * Displays audio frequency data and healing frequencies
 */

import React from 'react';

export interface FrequencyVisualizerProps {
  frequencies?: number[];
  type?: 'solfeggio' | 'binaural' | 'custom';
  isPlaying?: boolean;
  className?: string;
}

export const FrequencyVisualizer: React.FC<FrequencyVisualizerProps> = ({
  frequencies = [528, 639, 741],
  type = 'solfeggio',
  isPlaying = false,
  className = ''
}) => {
  return (
    <div className={`frequency-visualizer ${className}`}>
      <div className="visualizer-container p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Frequency Visualizer ({type})</h3>
        <div className="frequency-display grid grid-cols-3 gap-4 mb-4">
          {frequencies.map((freq, index) => (
            <div key={index} className="frequency-item text-center p-2 bg-blue-50 rounded">
              <div className="text-lg font-mono">{freq} Hz</div>
            </div>
          ))}
        </div>
        <div className="visualizer-canvas h-32 bg-gray-100 rounded flex items-center justify-center">
          {isPlaying ? (
            <div className="animate-pulse text-blue-600">Playing frequencies...</div>
          ) : (
            <span className="text-gray-500">Frequency visualization placeholder</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FrequencyVisualizer;
