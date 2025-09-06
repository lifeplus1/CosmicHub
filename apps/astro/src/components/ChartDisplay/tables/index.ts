// Unified aspect table component (RECOMMENDED - replaces all aspect table variants)
export { UnifiedAspectTable } from './UnifiedAspectTable';
export type { 
  BaseAspectData, 
  EnhancedAspectData, 
  UnifiedAspectTableProps 
} from './UnifiedAspectTable';

// Migration helpers for upgrading from legacy components
export {
  LegacyAspectTableWrapper,
  LegacyEnhancedAspectTableWrapper,
  LegacyVirtualizedAspectTableWrapper,
  convertLegacyAspectRow,
  convertEnhancedAspect,
  convertVirtualizedAspectRow
} from './MigrationHelpers';

// Other table components
export { default as PlanetTable } from './PlanetTable';
export { default as HouseTable } from './HouseTable';
export { default as AngleTable } from './AngleTable';
export { default as AsteroidTable } from './AsteroidTable';
export { default as CelestialBodiesTable } from './CelestialBodiesTable';

// Legacy aspect tables (DEPRECATED - use UnifiedAspectTable instead)
export { default as AspectTable } from './AspectTable';
export { default as EnhancedAspectTable } from './EnhancedAspectTable';
export { VirtualizedAspectTable } from './VirtualizedAspectTable';

export * from './tableUtils';
export * from './CelestialBodiesTable';
export type { PlanetRow } from './PlanetTable';
export type { AspectRow } from './AspectTable';
export type { HouseRow } from './HouseTable';
export type { AngleRow } from './AngleTable';
export type { AsteroidRow } from './AsteroidTable';
export type { AspectType, EnhancedAspect } from './EnhancedAspectTable';
export type { VirtualizedAspectTableProps, VirtualizedAspectRow } from './VirtualizedAspectTable';
