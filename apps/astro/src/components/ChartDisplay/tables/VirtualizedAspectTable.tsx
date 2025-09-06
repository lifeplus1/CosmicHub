import React, { memo, useMemo, useCallback } from 'react';
import { VirtualizedList } from '../VirtualizedList';

/**
 * Data structure for a single aspect row in the virtualized table
 */
export interface VirtualizedAspectRow {
  /** Unique identifier for the aspect */
  id: string;
  /** First planet in the aspect */
  planet1: string;
  /** Second planet in the aspect */
  planet2: string;
  /** Type of aspect (e.g., "Opposition", "Trine") */
  aspect: string;
  /** Orb value in degrees */
  orb: number;
  /** Strength rating (0-10) */
  strength: number;
  /** Aspect category: major, minor, or other */
  type?: 'major' | 'minor' | 'other';
}

/**
 * Props interface for VirtualizedAspectTable component
 */
export interface VirtualizedAspectTableProps {
  /** Array of aspect rows to display */
  aspects: VirtualizedAspectRow[];
  /** Height of each row in pixels */
  itemHeight?: number;
  /** Total height of the virtualized container */
  height?: number;
  /** Maximum number of items to show before virtualization kicks in */
  virtualizationThreshold?: number;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Message to display when no data is available */
  emptyMessage?: string;
  /** Optional CSS class name */
  className?: string;
  /** Optional ARIA label for accessibility */
  'aria-label'?: string;
}

/**
 * Internal component for rendering individual aspect rows
 * Memoized for performance optimization
 */
const AspectRow = memo<{
  item: VirtualizedAspectRow;
  index: number;
}>(({ item, index }) => {
  return (
  <div
    className={`
      p-3 border-b border-cosmic-purple/20 flex items-center justify-between
      ${index % 2 === 0 ? 'bg-cosmic-dark/20' : 'bg-cosmic-dark/10'}
      hover:bg-cosmic-purple/10 transition-colors duration-150
      focus-within:ring-2 focus-within:ring-cosmic-purple/50 focus-within:outline-none
    `}
  >
    {/* Planet names and aspect type */}
    <div 
      className="flex items-center gap-3 min-w-0 flex-1"
    >
      <span className="text-sm font-medium text-cosmic-silver truncate">
        {item.planet1}
      </span>
      <span 
        className="text-cosmic-gold font-mono text-xs px-2 py-1 bg-cosmic-purple/20 rounded"
        title={`Aspect: ${item.aspect}`}
      >
        {item.aspect}
      </span>
      <span className="text-sm font-medium text-cosmic-silver truncate">
        {item.planet2}
      </span>
    </div>

    {/* Orb and strength information */}
    <div 
      className="flex items-center gap-3 ml-3"
    >
      <div className="text-xs text-cosmic-silver/70 min-w-0">
        <div aria-label={`Orb: ${item.orb.toFixed(2)} degrees`}>
          Orb: {item.orb.toFixed(2)}°
        </div>
        <div aria-label={`Strength: ${item.strength.toFixed(1)} out of 10`}>
          Strength: {item.strength.toFixed(1)}
        </div>
      </div>
      
      {/* Visual strength indicator */}
      <div 
        className="w-8 h-2 bg-cosmic-dark/50 rounded-full overflow-hidden"
        title={`Aspect strength: ${item.strength} out of 10`}
        aria-label={`Aspect strength: ${item.strength} out of 10`}
      >
        <div 
          className={`
            h-full rounded-full transition-all duration-300
            ${item.strength >= 8 ? 'bg-cosmic-gold' : 
              item.strength >= 5 ? 'bg-cosmic-purple' : 
              'bg-cosmic-silver/50'}
          `}
        />
      </div>
    </div>

    {/* Aspect type badge */}
    {item.type && (
      <div 
        className={`
          ml-2 px-2 py-1 text-xs rounded-full font-medium
          ${item.type === 'major' ? 'bg-cosmic-gold/20 text-cosmic-gold' :
            item.type === 'minor' ? 'bg-cosmic-purple/20 text-cosmic-purple' :
            'bg-cosmic-silver/20 text-cosmic-silver'}
        `}
        aria-label={`${item.type} aspect type`}
      >
        {item.type}
      </div>
    )}
  </div>
  );
});

AspectRow.displayName = 'AspectRow';

/**
 * Virtualized table component for displaying large aspect datasets efficiently.
 * 
 * Features:
 * - Virtualization for performance with large datasets (>100 items)
 * - Accessible ARIA roles and labels
 * - Responsive design with cosmic theme
 * - Loading and empty states
 * - Proper TypeScript typing
 * 
 * @example
 * ```tsx
 * <VirtualizedAspectTable
 *   aspects={aspectData}
 *   height={400}
 *   virtualizationThreshold={100}
 *   aria-label="Chart aspects"
 * />
 * ```
 */
export const VirtualizedAspectTable: React.FC<VirtualizedAspectTableProps> = memo(({
  aspects,
  itemHeight = 60,
  height = 400,
  virtualizationThreshold = 100,
  isLoading = false,
  emptyMessage = "No aspects found",
  className = "",
  'aria-label': ariaLabel = "Aspect relationships table"
}) => {
  // Memoized row renderer function for virtualization
  const renderAspectRow = useCallback((item: VirtualizedAspectRow, index: number): React.ReactNode => (
    <AspectRow
      key={item.id}
      item={item}
      index={index}
    />
  ), []);

  // Memoized loading state component
  const LoadingState = useMemo(() => (
    <div 
      className="space-y-2 animate-pulse"
      role="status"
      aria-label="Loading aspects"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <div 
          key={i} 
          className="h-14 bg-cosmic-dark/30 rounded"
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">Loading aspect data...</span>
    </div>
  ), []);

  // Memoized empty state component
  const EmptyState = useMemo(() => (
    <div 
      className="text-center py-8 text-cosmic-silver/70"
      role="status"
      aria-label="No aspects available"
    >
      <div 
        className="text-2xl mb-2" 
        role="img" 
        aria-label="Galaxy emoji"
      >
        🌌
      </div>
      <div>{emptyMessage}</div>
    </div>
  ), [emptyMessage]);

  // Memoized table header component
  const TableHeader = useMemo(() => (
    <div 
      className="bg-cosmic-purple/20 p-3 border-b border-cosmic-purple/30"
    >
      <div 
        className="flex items-center justify-between text-xs font-semibold text-cosmic-silver uppercase tracking-wide"
      >
        <div>Aspect Relationships</div>
        <div>
          {aspects.length} {aspects.length === 1 ? 'aspect' : 'aspects'}
        </div>
      </div>
    </div>
  ), [aspects.length]);

  // Early returns for loading and empty states
  if (isLoading) {
    return LoadingState;
  }

  if (aspects.length === 0) {
    return EmptyState;
  }

  // Determine if virtualization should be used
  const shouldVirtualize = aspects.length > virtualizationThreshold;

  // Container classes
  const containerClasses = `
    border border-cosmic-purple/30 rounded-lg overflow-hidden
    ${className}
  `.trim();

  if (shouldVirtualize) {
    return (
      <div 
        className={containerClasses}
        aria-label={ariaLabel}
      >
        {TableHeader}
        
        <VirtualizedList
          items={aspects}
          itemHeight={itemHeight}
          height={height}
          width="100%"
          render={renderAspectRow}
          className="cosmic-scrollbar"
        />
      </div>
    );
  }

  // Regular table for smaller datasets
  return (
    <div 
      className={containerClasses}
      aria-label={ariaLabel}
    >
      {TableHeader}
      
      <div 
        className="max-h-96 overflow-y-auto cosmic-scrollbar"
        aria-label="Aspect data"
      >
        {aspects.map((aspect, index) => renderAspectRow(aspect, index))}
      </div>
    </div>
  );
});

VirtualizedAspectTable.displayName = 'VirtualizedAspectTable';
