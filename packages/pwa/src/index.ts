// Core SW utilities
export * from './core';
export * from './capabilities';
export * from './mobile';
export * from './ui';
export * from './engagement';

// Re-export main classes for convenience
// Deprecated legacy mobile-enhancements module removed in favor of focused helpers:
//  - detectRuntimeCapabilities (capabilities)
//  - initMobileUX (mobile)
//  - showInstallBanner / showUpdateBanner (ui)
// Gesture / advanced mobile feature helpers can be reintroduced as a separate package if needed.
