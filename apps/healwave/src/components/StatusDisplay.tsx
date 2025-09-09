import React from 'react';
import { Activity, Pause } from 'lucide-react';

interface StatusDisplayProps {
  isPlaying: boolean;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ isPlaying }) => {
  return (
    <div className="flex items-center space-x-2">
      {isPlaying ? (
        <>
          <Activity className="w-4 h-4 text-green-400 animate-pulse" />
          <span className="text-sm font-medium text-green-400">Playing</span>
        </>
      ) : (
        <>
          <Pause className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-400">Ready</span>
        </>
      )}
    </div>
  );
};
