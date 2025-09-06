/**
 * Lazy Route Components for Healwave App
 * Implements route-based code splitting for frequency healing features
 */
import { lazy } from 'react';

// Main page routes with lazy loading - only existing pages
export const LazyPresets = lazy(() => import('../pages/Presets'));
export const LazyProfile = lazy(() => import('../pages/Profile'));
