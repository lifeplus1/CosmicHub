import React, { useMemo, useCallback } from 'react';

export interface BinauralRange {
  min: number;
  max: number;
  name: string;
  color: 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'gray';
}

export type BinauralRangeKey = 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma' | 'custom';

export interface BinauralRangeWithKey extends BinauralRange {
  key: BinauralRangeKey;
}

interface BinauralRangeSelectorProps {
  currentBeat: number;
  onRangeSelect?: (range: BinauralRangeWithKey) => void;
  className?: string;
}

export const BinauralRangeSelector: React.FC<BinauralRangeSelectorProps> = React.memo(({
  currentBeat,
  onRangeSelect,
  className = '',
}) => {
  const binauralRanges = useMemo<Record<BinauralRangeKey, BinauralRange>>(
    () => ({
      delta: {
        min: 0.5,
        max: 4,
        name: 'Delta (Deep Sleep)',
        color: 'purple',
      },
      theta: {
        min: 4,
        max: 8,
        name: 'Theta (Meditation)',
        color: 'blue',
      },
      alpha: {
        min: 8,
        max: 14,
        name: 'Alpha (Relaxation)',
        color: 'green',
      },
      beta: {
        min: 14,
        max: 30,
        name: 'Beta (Focus)',
        color: 'yellow',
      },
      gamma: {
        min: 30,
        max: 100,
        name: 'Gamma (High Focus)',
        color: 'red',
      },
      custom: {
        min: 0,
        max: 100,
        name: 'Custom',
        color: 'gray',
      },
    }),
    []
  );

  const colorMap = useMemo(
    () => ({
      purple: {
        bg: 'bg-purple-500',
        border: 'border-purple-400 bg-purple-500/20 text-purple-300',
        active: 'bg-purple-500/30 border-purple-300',
      },
      blue: {
        bg: 'bg-blue-500',
        border: 'border-blue-400 bg-blue-500/20 text-blue-300',
        active: 'bg-blue-500/30 border-blue-300',
      },
      green: {
        bg: 'bg-green-500',
        border: 'border-green-400 bg-green-500/20 text-green-300',
        active: 'bg-green-500/30 border-green-300',
      },
      yellow: {
        bg: 'bg-yellow-500',
        border: 'border-yellow-400 bg-yellow-500/20 text-yellow-300',
        active: 'bg-yellow-500/30 border-yellow-300',
      },
      red: {
        bg: 'bg-red-500',
        border: 'border-red-400 bg-red-500/20 text-red-300',
        active: 'bg-red-500/30 border-red-300',
      },
      gray: {
        bg: 'bg-gray-500',
        border: 'border-gray-400 bg-gray-500/20 text-gray-300',
        active: 'bg-gray-500/30 border-gray-300',
      },
    }),
    []
  );

  const currentRange = useMemo<BinauralRangeWithKey>(() => {
    for (const [key, range] of Object.entries(binauralRanges)) {
      if (key !== 'custom' && currentBeat >= range.min && currentBeat <= range.max) {
        return { ...range, key: key as BinauralRangeKey };
      }
    }
    return { ...binauralRanges.custom, key: 'custom' };
  }, [currentBeat, binauralRanges]);

  const getColorClass = useCallback(
    (color: BinauralRange['color']): string => colorMap[color].bg,
    [colorMap]
  );

  const getBorderColorClass = useCallback(
    (color: BinauralRange['color']): string => colorMap[color].border,
    [colorMap]
  );

  const getActiveColorClass = useCallback(
    (color: BinauralRange['color']): string => colorMap[color].active,
    [colorMap]
  );

  const handleRangeClick = useCallback(
    (rangeKey: BinauralRangeKey) => {
      const range = binauralRanges[rangeKey];
      const rangeWithKey: BinauralRangeWithKey = { ...range, key: rangeKey };
      
      if (onRangeSelect) {
        onRangeSelect(rangeWithKey);
      }
    },
    [binauralRanges, onRangeSelect]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <h4 className="font-medium text-white mb-3">🌊 Brainwave Frequencies</h4>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Object.entries(binauralRanges).map(([key, range]) => {
          const rangeKey = key as BinauralRangeKey;
          const isActive = currentRange.key === rangeKey;
          
          return (
            <button
              key={rangeKey}
              type="button"
              onClick={() => handleRangeClick(rangeKey)}
              className={`
                p-3 rounded-lg border transition-all duration-200 
                focus:outline-none focus:ring-2 focus:ring-white/50
                hover:scale-105 active:scale-95
                ${isActive 
                  ? getActiveColorClass(range.color)
                  : getBorderColorClass(range.color)
                }
              `}
              {...(isActive && { 'aria-pressed': 'true' })}
              aria-label={`Select ${range.name} frequency range`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <div
                  className={`w-3 h-3 rounded-full ${getColorClass(range.color)}`}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">
                  {range.name.split(' ')[0]}
                </span>
              </div>
              <div className="text-xs opacity-80">
                {range.min}-{range.max} Hz
              </div>
              <div className="text-xs opacity-60">
                {range.name.includes('(') && range.name.split('(')[1]?.replace(')', '')}
              </div>
            </button>
          );
        })}
      </div>

      {/* Current Range Indicator */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${getColorClass(currentRange.color)}`}
            aria-hidden="true"
          />
          <span className="text-sm font-medium text-white">
            Current: {currentRange.name}
          </span>
        </div>
        <span className="text-xs text-white/60">
          {currentBeat.toFixed(1)} Hz
        </span>
      </div>
    </div>
  );
});

BinauralRangeSelector.displayName = 'BinauralRangeSelector';

export default BinauralRangeSelector;
