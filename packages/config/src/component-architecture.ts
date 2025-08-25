// Backward-compatible re-export preserving prior '@cosmichub/config/component-architecture' subpath
export * from './component-library'; // Re-export component-library under the legacy/beta subpath name `component-architecture`.
// Having a concrete source file ensures declaration generation is stable.
export * from './component-library';
