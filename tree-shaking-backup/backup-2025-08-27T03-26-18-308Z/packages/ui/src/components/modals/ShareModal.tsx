/**
 * Share Modal Component
 */

import React from 'react';

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div
        className='fixed inset-0 bg-black bg-opacity-50'
        onClick={onClose}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
            e.preventDefault();
            onClose();
          }
        }}
        role='button'
        tabIndex={0}
        aria-label='Close modal'
      />
      <div className='relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4'>
        <div className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Share</h2>
          <div className='text-center py-8 text-gray-500'>
            Share options placeholder
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
