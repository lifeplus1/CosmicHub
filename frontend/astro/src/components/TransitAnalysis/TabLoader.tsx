import React from 'react';

export const TabLoader: React.FC = () => (
  <div className="cosmic-card">
    <div className="flex items-center justify-center p-6">
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 border-b-2 rounded-full animate-spin border-cosmic-gold"></div>
        <span className="text-cosmic-silver">Loading...</span>
      </div>
    </div>
  </div>
);