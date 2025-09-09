import React from 'react';
import { GeometryPattern } from './sacredGeometry';

/**
 * Sacred Geometry Canvas Component
 * Renders the geometric patterns using SVG for crisp, scalable graphics
 */
export interface SacredGeometryCanvasProps {
  pattern: GeometryPattern;
  className?: string;
  width?: number;
  height?: number;
}

export const SacredGeometryCanvas: React.FC<SacredGeometryCanvasProps> = ({
  pattern,
  className = '',
  width = 300,
  height = 300
}) => {
  return (
    <svg
      className={`sacred-geometry-canvas ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
    >
      {/* Background gradient */}
      <defs>
        <radialGradient id="bg-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.8)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.95)" />
        </radialGradient>

        {/* Glow effect filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width={width} height={height} fill="url(#bg-gradient)" />

      {/* Render pattern paths */}
      {pattern.paths.map((path, pathIndex) => {
        const color = pattern.colors[pathIndex] ?? '#ffffff';
        const pathData = path.map((pointIndex, index) => {
          const point = pattern.points[pointIndex];
          if (!point) return '';

          const command = index === 0 ? 'M' : 'L';
          return `${command} ${point.x} ${point.y}`;
        }).join(' ');

        return (
          <path
            key={pathIndex}
            d={pathData}
            stroke={color}
            strokeWidth="1.5"
            fill="none"
            opacity={0.7 + pattern.resonance * 0.3}
            filter="url(#glow)"
          />
        );
      })}

      {/* Center point */}
      <circle
        cx={width / 2}
        cy={height / 2}
        r="2"
        fill="#ffffff"
        opacity={0.8}
        filter="url(#glow)"
      />
    </svg>
  );
};

export default SacredGeometryCanvas;
