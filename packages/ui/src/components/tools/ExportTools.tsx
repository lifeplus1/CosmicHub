/**
 * Export Tools Component
 * Provides various export functionality
 */

import React from 'react';

interface ExportToolsProps {
  formats?: string[];
  className?: string;
}

export const ExportTools: React.FC<ExportToolsProps> = ({
  formats = ['pdf', 'png', 'json'],
  className = '',
}) => {
  return (
    <div className={`export-tools ${className}`}>
      <div className='tools-container p-4 border rounded-lg'>
        <h3 className='text-lg font-semibold mb-4'>Export Tools</h3>
        <div className='export-options flex gap-2'>
          {formats.map(format => (
            <button
              key={format}
              className='px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm'
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExportTools;
