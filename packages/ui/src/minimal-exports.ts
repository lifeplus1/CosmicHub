/**
 * Minimal UI exports for Docker build compatibility
 */
import React from 'react';

// Basic prop types
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  feature?: string;
  currentTier?: string;
  onUpgrade?: (tier: 'Basic' | 'Pro' | 'Enterprise') => void;
}

export interface PerformanceDashboardProps {
  data?: any;
}

// Simple stub components
export const Button: React.FC<ButtonProps> = ({ children, onClick, disabled, variant = 'primary', className = '' }) => {
  return React.createElement('button', { onClick, disabled, className: `btn btn-${variant} ${className}` }, children);
};

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return React.createElement('div', { className: `card ${className}` }, 
    title && React.createElement('h3', { className: 'card-title' }, title),
    React.createElement('div', { className: 'card-content' }, children)
  );
};

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, children, feature, currentTier, onUpgrade }) => {
  if (!isOpen) return null;
  return React.createElement('div', { className: 'modal', onClick: onClose }, 
    React.createElement('div', { className: 'modal-content' }, children || `Upgrade modal for ${feature}`)
  );
};

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ data }) => {
  return React.createElement('div', { className: 'performance-dashboard' }, 'Performance Dashboard');
};

// Remove duplicate type exports since they're already exported with components
