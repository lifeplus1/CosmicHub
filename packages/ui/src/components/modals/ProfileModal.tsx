/**
 * Profile Modal Component
 */

import React from 'react';

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <div className="text-center py-8 text-gray-500">
            Profile content placeholder
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
