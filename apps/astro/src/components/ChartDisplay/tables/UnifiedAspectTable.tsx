import React, { memo, useMemo, useCallback } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@cosmichub/ui';
import { VirtualizedList } from '../VirtualizedList';
import { getPlanetSymbol, getAspectSymbol } from './tableUtils';
import { AstroSymbol } from '../AstroSymbol';

// Unified aspect data types
export interface BaseAspectData {
  id: string;
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
}

export interface EnhancedAspectData extends BaseAspectData {
  aspectType: string;
  isMajor: boolean;
  strength: 'exact' | 'strong' | 'moderate' | 'weak';
  applying: boolean;
  angularDifference: number;
  interpretation?: string;
}

export interface UnifiedAspectTableProps {
  /** Aspect data - supports both basic and enhanced formats */
  aspects: (BaseAspectData | EnhancedAspectData)[];
  /** Display mode */
  mode?: 'basic' | 'enhanced' | 'professional';
  /** Performance settings */
  performance?: {
    /** Use virtualization for large datasets */
    virtualize?: boolean;
    /** Threshold for virtualization (default: 100) */
    virtualizationThreshold?: number;
    /** Virtual item height (default: 60px) */
    itemHeight?: number;
    /** Virtual container height (default: 400px) */
    containerHeight?: number;
  };
  /** Enhanced mode settings */
  enhanced?: {
    /** Show minor aspects */
    includeMinorAspects?: boolean;
    /** Maximum orb for major aspects */
    maxMajorOrb?: number;
    /** Maximum orb for minor aspects */
    maxMinorOrb?: number;
    /** Show strength indicators */
    showStrength?: boolean;
    /** Show statistics */
    showStatistics?: boolean;
  };
  /** Loading and empty states */
  isLoading?: boolean;
  emptyMessage?: string;
  /** Accessibility */
  ariaLabel?: string;
}

/**
 * Unified Aspect Table - Intelligent component that adapts based on data and requirements
 * 
 * Features:
 * - Smart mode detection based on data complexity
 * - Automatic virtualization for large datasets (>100 items)
 * - Enhanced features for professional astrology analysis
 * - Full accessibility support
 * - Optimized performance with memoization
 */
export const UnifiedAspectTable: React.FC<UnifiedAspectTableProps> = memo(({
  aspects,
  mode = 'enhanced',
  performance = {},
  enhanced = {},
  isLoading = false,
  emptyMessage = "No aspects found",
  ariaLabel = "Planetary aspects table"
}) => {
  const {
    virtualize = true,
    virtualizationThreshold = 100,
    itemHeight = 60,
    containerHeight = 400
  } = performance;

  const {
    includeMinorAspects = true,
    maxMajorOrb = 8,
    maxMinorOrb = 3,
    showStrength = true,
    showStatistics = false
  } = enhanced;

  // Smart mode detection based on data complexity
  const detectedMode = useMemo(() => {
    if (mode !== 'enhanced') return mode;
    
    const hasEnhancedData = aspects.some(aspect => 
      'aspectType' in aspect && 'strength' in aspect
    );
    return hasEnhancedData ? 'professional' : 'basic';
  }, [aspects, mode]);

  // Filter and process aspects based on settings
  const processedAspects = useMemo(() => {
    if (detectedMode === 'basic') return aspects;
    
    return aspects.filter(aspect => {
      if (!('isMajor' in aspect)) return true;
      
      const enhancedAspect = aspect;
      if (!includeMinorAspects && !enhancedAspect.isMajor) return false;
      
      const maxOrb = enhancedAspect.isMajor ? maxMajorOrb : maxMinorOrb;
      return Math.abs(enhancedAspect.orb) <= maxOrb;
    });
  }, [aspects, detectedMode, includeMinorAspects, maxMajorOrb, maxMinorOrb]);

  // Sort aspects by strength and orb
  const sortedAspects = useMemo(() => {
    if (detectedMode === 'basic') {
      return [...processedAspects].sort((a, b) => Math.abs(a.orb) - Math.abs(b.orb));
    }

    return [...processedAspects].sort((a, b) => {
      const aEnhanced = a as EnhancedAspectData;
      const bEnhanced = b as EnhancedAspectData;
      
      if ('strength' in aEnhanced && 'strength' in bEnhanced) {
        const strengthOrder = { exact: 0, strong: 1, moderate: 2, weak: 3 };
        const strengthDiff = strengthOrder[aEnhanced.strength] - strengthOrder[bEnhanced.strength];
        if (strengthDiff !== 0) return strengthDiff;
      }
      
      return Math.abs(a.orb) - Math.abs(b.orb);
    });
  }, [processedAspects, detectedMode]);

  // Get aspect styling based on type and strength
  const getAspectStyling = useCallback((aspect: BaseAspectData | EnhancedAspectData) => {
    if (!('strength' in aspect)) {
      return {
        textColor: 'text-cosmic-silver',
        bgColor: 'bg-cosmic-dark/10',
        strengthIndicator: null
      };
    }

    const enhanced = aspect;
    const isHard = ['square', 'opposition', 'semisquare', 'sesquiquadrate', 'quincunx'].includes(enhanced.aspectType);
    
    let textColor = 'text-cosmic-silver';
    let bgColor = 'bg-cosmic-dark/10';
    
    if (enhanced.strength === 'exact') {
      textColor = 'text-cosmic-gold font-bold';
      bgColor = 'bg-cosmic-gold/10';
    } else if (isHard) {
      textColor = enhanced.isMajor ? 'text-red-400' : 'text-orange-400';
      bgColor = enhanced.isMajor ? 'bg-red-500/10' : 'bg-orange-500/10';
    } else {
      textColor = enhanced.isMajor ? 'text-blue-400' : 'text-green-400';
      bgColor = enhanced.isMajor ? 'bg-blue-500/10' : 'bg-green-500/10';
    }

    return { textColor, bgColor, strengthIndicator: enhanced.strength };
  }, []);

  // Memoized row renderer for both regular and virtualized rendering
  const renderAspectRow = useCallback((aspect: BaseAspectData | EnhancedAspectData, index: number) => {
    const styling = getAspectStyling(aspect);
    const isEnhanced = 'strength' in aspect;
    
    if (virtualize && sortedAspects.length > virtualizationThreshold) {
      // Virtualized row format
      return (
        <div 
          key={aspect.id}
          className={`
            p-3 border-b border-cosmic-purple/20 flex items-center justify-between
            ${index % 2 === 0 ? 'bg-cosmic-dark/20' : 'bg-cosmic-dark/10'}
            hover:bg-cosmic-purple/10 transition-colors duration-150
            ${styling.bgColor}
          `}
        >
          {/* Planet names and aspect */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <AstroSymbol
                symbol={getPlanetSymbol(aspect.planet1)}
                size='sm'
                title={aspect.planet1}
                className='text-cosmic-gold'
              />
              <span className="text-sm font-medium text-cosmic-silver truncate">
                {aspect.planet1}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <AstroSymbol
                symbol={getAspectSymbol(aspect.aspect)}
                size='sm'
                title={aspect.aspect}
                className='text-cosmic-purple'
              />
              <span className="text-cosmic-gold font-mono text-xs px-2 py-1 bg-cosmic-purple/20 rounded">
                {aspect.aspect}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <AstroSymbol
                symbol={getPlanetSymbol(aspect.planet2)}
                size='sm'
                title={aspect.planet2}
                className='text-cosmic-gold'
              />
              <span className="text-sm font-medium text-cosmic-silver truncate">
                {aspect.planet2}
              </span>
            </div>
          </div>

          {/* Orb and strength info */}
          <div className="flex items-center gap-3 ml-3">
            <div className="text-xs text-cosmic-silver/70 text-right">
              <div>Orb: {aspect.orb.toFixed(2)}°</div>
              {isEnhanced && (
                <div className={styling.textColor}>
                  {(aspect).strength}
                </div>
              )}
            </div>
            
            {isEnhanced && showStrength && (
              <div className="w-8 h-2 bg-cosmic-dark/50 rounded-full overflow-hidden">
                <div 
                  className={`
                    h-full rounded-full transition-all duration-300
                    ${(aspect).strength === 'exact' ? 'bg-cosmic-gold w-full' : 
                      (aspect).strength === 'strong' ? 'bg-cosmic-purple w-3/4' : 
                      (aspect).strength === 'moderate' ? 'bg-cosmic-silver w-1/2' :
                      'bg-cosmic-silver/50 w-1/4'}
                  `}
                  title={`Strength: ${(aspect).strength}`}
                />
              </div>
            )}
          </div>
        </div>
      );
    } else {
      // Regular table row format
      return (
        <TableRow 
          key={aspect.id} 
          className={`${styling.bgColor} hover:bg-cosmic-purple/10 transition-colors`}
        >
          <TableCell>
            <div className="flex items-center gap-2">
              <AstroSymbol
                symbol={getPlanetSymbol(aspect.planet1)}
                size='md'
                title={aspect.planet1}
                className='text-cosmic-gold'
              />
              <span className={styling.textColor}>{aspect.planet1}</span>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <AstroSymbol
                symbol={getAspectSymbol(aspect.aspect)}
                size='md'
                title={aspect.aspect}
                className='text-cosmic-purple'
              />
              <span className="text-cosmic-gold font-medium">{aspect.aspect}</span>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <AstroSymbol
                symbol={getPlanetSymbol(aspect.planet2)}
                size='md'
                title={aspect.planet2}
                className='text-cosmic-gold'
              />
              <span className={styling.textColor}>{aspect.planet2}</span>
            </div>
          </TableCell>
          <TableCell className={styling.textColor}>
            {aspect.orb.toFixed(2)}°
          </TableCell>
          {detectedMode === 'professional' && (
            <>
              <TableCell>
                <span className={styling.textColor}>
                  {isEnhanced ? (aspect).strength : 'N/A'}
                </span>
              </TableCell>
              <TableCell>
                <span className={`
                  px-2 py-1 text-xs rounded-full font-medium
                  ${isEnhanced && (aspect).isMajor 
                    ? 'bg-cosmic-gold/20 text-cosmic-gold' 
                    : 'bg-cosmic-purple/20 text-cosmic-purple'}
                `}>
                  {isEnhanced ? ((aspect).isMajor ? 'Major' : 'Minor') : 'Basic'}
                </span>
              </TableCell>
            </>
          )}
        </TableRow>
      );
    }
  }, [getAspectStyling, virtualize, sortedAspects.length, virtualizationThreshold, showStrength, detectedMode]);

  // Statistics for professional mode
  const statistics = useMemo(() => {
    if (detectedMode !== 'professional' || !showStatistics) return null;
    
    const enhancedAspects = sortedAspects.filter(a => 'isMajor' in a);
    const majorCount = enhancedAspects.filter(a => a.isMajor).length;
    const minorCount = enhancedAspects.filter(a => !a.isMajor).length;
    const exactCount = enhancedAspects.filter(a => a.strength === 'exact').length;
    const strongCount = enhancedAspects.filter(a => a.strength === 'strong').length;
    
    return { majorCount, minorCount, exactCount, strongCount, total: sortedAspects.length };
  }, [sortedAspects, detectedMode, showStatistics]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse" aria-label="Loading aspects">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 bg-cosmic-dark/30 rounded" />
        ))}
      </div>
    );
  }

  // Empty state
  if (sortedAspects.length === 0) {
    return (
      <div className="text-center py-8 text-cosmic-silver/70">
        <div className="text-2xl mb-2">🌌</div>
        <div>{emptyMessage}</div>
        {detectedMode === 'professional' && (
          <div className="text-sm mt-2 text-cosmic-silver/50">
            Try adjusting orb settings or including minor aspects
          </div>
        )}
      </div>
    );
  }

  // Use virtualization for large datasets
  if (virtualize && sortedAspects.length > virtualizationThreshold) {
    return (
      <div className="unified-aspect-table">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-cosmic-silver">
            ⚡ Aspects ({sortedAspects.length})
          </h3>
          <div className="text-sm text-cosmic-silver/70">
            {detectedMode} mode • virtualized
          </div>
        </div>

        {/* Virtualized content */}
        <div className="border border-cosmic-purple/30 rounded-lg overflow-hidden">
          <div className="bg-cosmic-purple/20 p-3 border-b border-cosmic-purple/30">
            <div className="flex items-center justify-between text-xs font-semibold text-cosmic-silver uppercase tracking-wide">
              <div>Aspect Relationships</div>
              <div>{sortedAspects.length} total</div>
            </div>
          </div>
          
          <VirtualizedList
            items={sortedAspects}
            itemHeight={itemHeight}
            height={containerHeight}
            width="100%"
            render={renderAspectRow}
            className="cosmic-scrollbar"
          />
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-cosmic-gold/10 border border-cosmic-gold/20 p-3 rounded-lg">
              <div className="text-cosmic-gold font-semibold">{statistics.exactCount}</div>
              <div className="text-cosmic-silver/70">Exact</div>
            </div>
            <div className="bg-cosmic-purple/10 border border-cosmic-purple/20 p-3 rounded-lg">
              <div className="text-cosmic-purple font-semibold">{statistics.strongCount}</div>
              <div className="text-cosmic-silver/70">Strong</div>
            </div>
            <div className="bg-cosmic-blue/10 border border-cosmic-blue/20 p-3 rounded-lg">
              <div className="text-cosmic-blue font-semibold">{statistics.majorCount}</div>
              <div className="text-cosmic-silver/70">Major</div>
            </div>
            <div className="bg-cosmic-silver/10 border border-cosmic-silver/20 p-3 rounded-lg">
              <div className="text-cosmic-silver font-semibold">{statistics.minorCount}</div>
              <div className="text-cosmic-silver/70">Minor</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Regular table for smaller datasets
  return (
    <div className="unified-aspect-table">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-cosmic-silver">
          ⚡ Aspects ({sortedAspects.length})
        </h3>
        <div className="text-sm text-cosmic-silver/70">
          {detectedMode} mode
        </div>
      </div>

      {/* Table */}
      <div className="border border-cosmic-purple/30 rounded-lg overflow-hidden">
        <Table aria-label={ariaLabel}>
          <TableHeader>
            <TableRow className="bg-cosmic-purple/20 border-b border-cosmic-purple/30">
              <TableHead className="text-cosmic-silver font-semibold">Planet 1</TableHead>
              <TableHead className="text-cosmic-silver font-semibold">Aspect</TableHead>
              <TableHead className="text-cosmic-silver font-semibold">Planet 2</TableHead>
              <TableHead className="text-cosmic-silver font-semibold">Orb</TableHead>
              {detectedMode === 'professional' && (
                <>
                  <TableHead className="text-cosmic-silver font-semibold">Strength</TableHead>
                  <TableHead className="text-cosmic-silver font-semibold">Type</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAspects.map((aspect, index) => renderAspectRow(aspect, index))}
          </TableBody>
        </Table>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-cosmic-gold/10 border border-cosmic-gold/20 p-3 rounded-lg">
            <div className="text-cosmic-gold font-semibold">{statistics.exactCount}</div>
            <div className="text-cosmic-silver/70">Exact</div>
          </div>
          <div className="bg-cosmic-purple/10 border border-cosmic-purple/20 p-3 rounded-lg">
            <div className="text-cosmic-purple font-semibold">{statistics.strongCount}</div>
            <div className="text-cosmic-silver/70">Strong</div>
          </div>
          <div className="bg-cosmic-blue/10 border border-cosmic-blue/20 p-3 rounded-lg">
            <div className="text-cosmic-blue font-semibold">{statistics.majorCount}</div>
            <div className="text-cosmic-silver/70">Major</div>
          </div>
          <div className="bg-cosmic-silver/10 border border-cosmic-silver/20 p-3 rounded-lg">
            <div className="text-cosmic-silver font-semibold">{statistics.minorCount}</div>
            <div className="text-cosmic-silver/70">Minor</div>
          </div>
        </div>
      )}
    </div>
  );
});

UnifiedAspectTable.displayName = 'UnifiedAspectTable';
