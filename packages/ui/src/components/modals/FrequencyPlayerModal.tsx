/**
 * Frequency Player Modal Component
 */

import React from 'react';

export interface FrequencyPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FrequencyPlayerModal: React.FC<FrequencyPlayerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Frequency Player</h2>
          <div className="text-center py-8 text-gray-500">
            Frequency player placeholder
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrequencyPlayerModal;
