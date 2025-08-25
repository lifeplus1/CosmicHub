/**
 * Chart Modal Component
 * Modal for displaying detailed charts
 */

import React from 'react';

export interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartType?: 'astrology' | 'frequency' | 'transit' | 'synastry';
  title?: string;
  children?: React.ReactNode;
}

export const ChartModal: React.FC<ChartModalProps> = ({
  isOpen,
  onClose,
  chartType = 'astrology',
  title,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={onClose} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (onClose)(e); } }} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        tabIndex={0}
        role="button"
        aria-label="Close modal"
      />
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            {title ?? `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
            title="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
          {children ?? (
            <div className="text-center py-8 text-gray-500">
              Chart content would appear here
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartModal;
