import React, { useCallback } from 'react';

/**
 * Reusable frame for newly extracted domain pages.
 * Centralizes padding, max-width, header layout, and error block styling.
 * Following unified type validation strategy with descriptive interfaces.
 */
export interface DomainPageFrameProps {
  /** Page title displayed in the header */
  title: string;
  /** Optional refresh handler for page content */
  onRefresh?: () => void;
  /** Loading state indicator for refresh operation */
  isRefreshing?: boolean;
  /** Error state to display error messages */
  error?: Error | null;
  /** Additional action buttons for the header */
  actions?: React.ReactNode;
  /** Main page content */
  children: React.ReactNode;
  /** Optional CSS class name for custom styling */
  className?: string;
  /** Test identifier for component testing */
  'data-testid'?: string;
  /** ARIA label for accessibility */
  'aria-label'?: string;
}

export const DomainPageFrame: React.FC<DomainPageFrameProps> = React.memo(({
  title,
  onRefresh,
  isRefreshing = false,
  error = null,
  actions,
  children,
  className,
  'data-testid': testId,
  'aria-label': ariaLabel,
}) => {
  const handleRefresh = useCallback(() => {
    if (onRefresh && !isRefreshing) {
      onRefresh();
    }
  }, [onRefresh, isRefreshing]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRefresh();
    }
  }, [handleRefresh]);

  return (
    <div 
      className={`p-4 max-w-6xl mx-auto ${className ?? ''}`}
      data-testid={testId}
      aria-label={ariaLabel ?? `${title} page`}
    >
      <header 
        className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'
        role="banner"
      >
        <h1 
          className='text-2xl font-semibold text-cosmic-silver'
          id={`${testId ? `${testId}-` : ''}page-title`}
        >
          {title}
        </h1>
        <div className='flex gap-2' role="toolbar" aria-label="Page actions">
          {onRefresh && (
            <button
              onClick={handleRefresh}
              onKeyDown={handleKeyDown}
              disabled={isRefreshing}
              className='px-3 py-1 rounded bg-cosmic-blue/20 hover:bg-cosmic-blue/30 disabled:opacity-50 text-sm focus:outline-none focus:ring-2 focus:ring-cosmic-blue focus:ring-offset-2 focus:ring-offset-cosmic-dark transition-colors duration-200'
              aria-label={isRefreshing ? 'Refreshing page content' : `Refresh ${title} page`}
              type="button"
            >
              {isRefreshing ? (
                <>
                  <span aria-hidden="true">⟳</span> Refreshing...
                </>
              ) : (
                <>
                  <span aria-hidden="true">↻</span> Refresh
                </>
              )}
            </button>
          )}
          {actions}
        </div>
      </header>
      {error && (
        <div 
          className='mb-4 rounded border border-red-500/40 bg-red-900/30 p-3 text-sm text-red-300'
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="sr-only">Error: </span>
          <strong className="font-medium">Error:</strong> {error.message}
        </div>
      )}
      <main 
        role="main"
        aria-labelledby={`${testId ? `${testId}-` : ''}page-title`}
        className="min-h-0 flex-1"
      >
        {children}
      </main>
    </div>
  );
});

DomainPageFrame.displayName = 'DomainPageFrame';
export default DomainPageFrame;
