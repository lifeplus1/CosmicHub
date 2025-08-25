/**
 * Settings Modal Component
 */

import React from 'react';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
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
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <div className="text-center py-8 text-gray-500">
            Settings content placeholder
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
