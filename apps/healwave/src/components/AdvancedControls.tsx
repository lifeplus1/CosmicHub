import React from 'react';
import { Sparkles } from 'lucide-react';

interface AdvancedControlsProps {
  showSacredGeometry: boolean;
  onSacredGeometryToggle: (enabled: boolean) => void;
}

export const AdvancedControls: React.FC<AdvancedControlsProps> = ({
  showSacredGeometry,
  onSacredGeometryToggle
}) => {
  return (
    <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-400" />
        Advanced Features
      </h3>

      <div className="space-y-4">
        {/* Sacred Geometry Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">
              Sacred Geometry Visualization
            </label>
            <p className="text-xs text-slate-400">
              Display geometric patterns synchronized with frequency
            </p>
          </div>
          <button
            onClick={() => onSacredGeometryToggle(!showSacredGeometry)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ${
              showSacredGeometry ? 'bg-amber-600' : 'bg-slate-600'
            }`}
            aria-label={showSacredGeometry ? 'Disable sacred geometry' : 'Enable sacred geometry'}
            title={showSacredGeometry ? 'Disable sacred geometry' : 'Enable sacred geometry'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showSacredGeometry ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
