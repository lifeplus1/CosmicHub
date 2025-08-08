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
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export interface PerformanceDashboardProps {
  data?: any;
}

// Simple stub components
export const Button: React.FC<ButtonProps> = ({ children, onClick, disabled, variant = 'primary' }) => {
  return React.createElement('button', { onClick, disabled, className: `btn btn-${variant}` }, children);
};

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return React.createElement('div', { className: `card ${className}` }, children);
};

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return React.createElement('div', { className: 'modal', onClick: onClose }, 
    React.createElement('div', { className: 'modal-content' }, children)
  );
};

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ data }) => {
  return React.createElement('div', { className: 'performance-dashboard' }, 'Performance Dashboard');
};

// Remove duplicate type exports since they're already exported with components
