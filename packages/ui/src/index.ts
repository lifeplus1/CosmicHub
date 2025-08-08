/**
 * UI Component Exports - Optimized with Lazy Loading
 * All components adhere to WCAG 2.1 accessibility standards and use Radix UI primitives
 * Performance: Core components are directly exported, feature components are lazy-loaded
 */

// Core components (always loaded for performance)
export { Button } from './components/Button';
export { Card } from './components/Card';
export { Loading } from './components/Loading';
export { Input } from './components/Input';
export { Badge } from './components/Badge';
export { Alert } from './components/Alert';
export { Spinner } from './components/Spinner';

// Lazy-loaded feature components for code splitting
export const Modal = React.lazy(() => import('./components/Modal').then(module => ({ default: module.Modal })));
export const Tooltip = React.lazy(() => import('./components/Tooltip').then(module => ({ default: module.Tooltip })));
export const Dropdown = React.lazy(() => import('./components/Dropdown').then(module => ({ default: module.Dropdown })));
export const UpgradeModal = React.lazy(() => import('./components/UpgradeModal').then(module => ({ default: module.UpgradeModal })));
export const PerformanceDashboard = React.lazy(() => import('./components/PerformanceDashboard').then(module => ({ default: module.PerformanceDashboard })));

// Re-export React for lazy loading support
import React from 'react';

export type { ButtonProps } from './components/Button';
export type { CardProps } from './components/Card';
export type { ModalProps } from './components/Modal';
export type { LoadingProps } from './components/Loading';
export type { InputProps } from './components/Input';
export type { BadgeProps } from './components/Badge';
export type { AlertProps } from './components/Alert';
export type { SpinnerProps } from './components/Spinner';
export type { TooltipProps } from './components/Tooltip';
export type { DropdownProps, DropdownOption } from './components/Dropdown';
export type { UpgradeModalProps } from './components/UpgradeModal';
export type { PerformanceDashboardProps } from './components/PerformanceDashboard';