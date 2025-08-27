import type React from 'react';

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

}
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
