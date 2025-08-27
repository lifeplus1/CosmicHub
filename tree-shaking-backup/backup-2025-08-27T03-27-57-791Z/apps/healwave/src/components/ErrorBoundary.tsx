import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { isDevelopment, devConsole } from '../config/environment';

/**
 * HealWave-specific error boundary with custom theming
 * Falls back to shared ErrorBoundary from @cosmichub/ui for most functionality
 */
interface HealWaveErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default HealWaveErrorBoundary;
