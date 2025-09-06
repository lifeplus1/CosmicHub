import React from 'react';
import { UnifiedAspectTable, BaseAspectData, EnhancedAspectData } from './UnifiedAspectTable';
import type { AspectRow } from './AspectTable';
import type { EnhancedAspect } from './EnhancedAspectTable';
import type { VirtualizedAspectRow } from './VirtualizedAspectTable';

/**
 * Migration helpers to easily upgrade from legacy aspect tables to UnifiedAspectTable
 */

// Helper to convert legacy AspectRow to BaseAspectData
export const convertLegacyAspectRow = (aspect: AspectRow): BaseAspectData => ({
  id: `${aspect.planet1}-${aspect.type}-${aspect.planet2}`,
  planet1: aspect.planet1,
  planet2: aspect.planet2,
  aspect: aspect.type,
  orb: parseFloat(aspect.orb)
});

// Helper to convert EnhancedAspect to EnhancedAspectData
export const convertEnhancedAspect = (aspect: EnhancedAspect): EnhancedAspectData => ({
  id: `${aspect.planet1}-${aspect.aspect}-${aspect.planet2}`,
  planet1: aspect.planet1,
  planet2: aspect.planet2,
  aspect: aspect.aspect,
  orb: aspect.orb,
  aspectType: aspect.aspectType,
  isMajor: aspect.isMajor,
  strength: aspect.strength,
  applying: aspect.applying,
  angularDifference: aspect.angularDifference,
  interpretation: aspect.interpretation
});

// Helper to convert VirtualizedAspectRow to BaseAspectData
export const convertVirtualizedAspectRow = (aspect: VirtualizedAspectRow): BaseAspectData => ({
  id: aspect.id,
  planet1: aspect.planet1,
  planet2: aspect.planet2,
  aspect: aspect.aspect,
  orb: aspect.orb
});

/**
 * Drop-in replacement for legacy AspectTable
 * @deprecated Use UnifiedAspectTable directly for new components
 */
export const LegacyAspectTableWrapper: React.FC<{ aspects: AspectRow[] }> = ({ aspects }) => {
  const convertedAspects = aspects.map(convertLegacyAspectRow);
  return (
    <div className="legacy-aspect-table-wrapper">
      <div className="mb-2 text-xs text-amber-500 bg-amber-100/10 border border-amber-500/20 p-2 rounded">
        ⚠️ This component uses legacy AspectTable. Consider migrating to UnifiedAspectTable for better performance and features.
      </div>
      <UnifiedAspectTable 
        aspects={convertedAspects} 
        mode="basic"
        performance={{ virtualize: false }}
      />
    </div>
  );
};

/**
 * Drop-in replacement for legacy EnhancedAspectTable
 * @deprecated Use UnifiedAspectTable directly for new components
 */
export const LegacyEnhancedAspectTableWrapper: React.FC<{ 
  aspects: EnhancedAspect[];
  includeMinorAspects?: boolean;
  showStatistics?: boolean;
}> = ({ aspects, includeMinorAspects = true, showStatistics = false }) => {
  const convertedAspects = aspects.map(convertEnhancedAspect);
  return (
    <div className="legacy-enhanced-aspect-table-wrapper">
      <div className="mb-2 text-xs text-amber-500 bg-amber-100/10 border border-amber-500/20 p-2 rounded">
        ⚠️ This component uses legacy EnhancedAspectTable. Consider migrating to UnifiedAspectTable for better performance and features.
      </div>
      <UnifiedAspectTable 
        aspects={convertedAspects} 
        mode="professional"
        enhanced={{ 
          includeMinorAspects, 
          showStatistics,
          showStrength: true 
        }}
      />
    </div>
  );
};

/**
 * Drop-in replacement for legacy VirtualizedAspectTable
 * @deprecated Use UnifiedAspectTable directly for new components
 */
export const LegacyVirtualizedAspectTableWrapper: React.FC<{ 
  aspects: VirtualizedAspectRow[];
  height?: number;
  itemHeight?: number;
}> = ({ aspects, height = 400, itemHeight = 60 }) => {
  const convertedAspects = aspects.map(convertVirtualizedAspectRow);
  return (
    <div className="legacy-virtualized-aspect-table-wrapper">
      <div className="mb-2 text-xs text-amber-500 bg-amber-100/10 border border-amber-500/20 p-2 rounded">
        ⚠️ This component uses legacy VirtualizedAspectTable. Consider migrating to UnifiedAspectTable for better performance and features.
      </div>
      <UnifiedAspectTable 
        aspects={convertedAspects} 
        mode="basic"
        performance={{ 
          virtualize: true,
          containerHeight: height,
          itemHeight 
        }}
      />
    </div>
  );
};
