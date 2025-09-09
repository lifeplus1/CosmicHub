import React, { useCallback } from 'react';

interface AdvancedControlsProps {
  showSacredGeometry: boolean;
  onShowSacredGeometryChange: (show: boolean) => void;
  onShowPresetCreator: () => void;
}

export const AdvancedControls: React.FC<AdvancedControlsProps> = ({
  showSacredGeometry,
  onShowSacredGeometryChange,
  onShowPresetCreator,
}) => {
  const handleSacredGeometryToggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onShowSacredGeometryChange(e.target.checked);
  }, [onShowSacredGeometryChange]);

  return (
    <div className="cosmic-glass p-6 rounded-xl border border-cosmic-purple/30">
      <h3 className="text-lg font-semibold text-cosmic-gold mb-4">🔮 Advanced</h3>
      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showSacredGeometry}
            onChange={handleSacredGeometryToggle}
            className="rounded border-cosmic-purple/30 bg-cosmic-purple/10"
          />
          <span className="text-cosmic-silver text-sm">Sacred Geometry ✨</span>
        </label>

        <button
          onClick={onShowPresetCreator}
          className="w-full py-2 px-3 text-sm bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-lg hover:from-cyan-500/30 hover:to-blue-500/30 text-white transition-all"
        >
          💾 Create Preset
        </button>
      </div>
    </div>
  );
};
