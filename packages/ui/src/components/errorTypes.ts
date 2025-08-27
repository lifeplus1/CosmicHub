import type React from 'react';

export type BoundaryLevel = 'app' | 'page' | 'section' | 'component';
export type LogLevel = 'critical' | 'high' | 'medium' | 'low';

export interface ErrorMetrics extends Record<string, unknown> {
  errorId: string;
  boundaryName: string | undefined;
  boundaryLevel: BoundaryLevel;
  severity: LogLevel;
  retryCount: number;
}

export interface ErrorInfo extends ErrorMetrics {
  message: string;
  stack: string | undefined;
  componentStack: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId: string | undefined;
  sessionId: string | undefined;
}

export interface AnalyticsService {
  track: (eventName: string, data: Record<string, unknown>) => void;
}

export interface ErrorReportingService {
  captureException: (error: ErrorInfo) => void;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?:
    | React.ReactNode
    | ((
        error: Error,
        errorInfo: ErrorInfo,
        retry: () => void
      ) => React.ReactNode)
    | undefined;
  onError?: ((error: Error, errorInfo: ErrorInfo) => void) | undefined;
  resetKeys?: Array<string | number> | undefined;
  resetOnPropsChange?: boolean | undefined;
  isolate?: boolean | undefined;
  level?: BoundaryLevel | undefined;
  name?: string | undefined;
}
