import React from 'react';
import type { TabProps } from './types';

const ProfileTab: React.FC<TabProps> = ({ humanDesignData }) => {
  return (
    <div className="cosmic-card">
      <div className="p-4">
        <h2 className="text-lg font-bold">
          Profile {humanDesignData.profile.line1}/{humanDesignData.profile.line2}
        </h2>
      </div>
      <div className="p-4">
        <p className="mb-4 text-lg">
          {humanDesignData.profile.description}
        </p>
        <hr className="mb-4 border-cosmic-silver/30" />
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="mb-3 font-bold text-md">Conscious Line {humanDesignData.profile.line1}</h3>
            <p>Your conscious personality theme</p>
          </div>
          <div>
            <h3 className="mb-3 font-bold text-md">Unconscious Line {humanDesignData.profile.line2}</h3>
            <p>Your unconscious design theme</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
