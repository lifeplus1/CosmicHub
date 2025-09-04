import React from 'react';

/**
 * Reusable frame for newly extracted domain pages.
 * Centralizes padding, max-width, header layout, and error block styling.
 */
export interface DomainPageFrameProps {
  title: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  error?: Error | null;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const DomainPageFrame: React.FC<DomainPageFrameProps> = ({
  title,
  onRefresh,
  isRefreshing,
  error,
  actions,
  children,
}) => {
  return (
    <div className='p-4 max-w-6xl mx-auto'>
      <header className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <h1 className='text-2xl font-semibold text-cosmic-silver'>{title}</h1>
        <div className='flex gap-2'>
          {onRefresh && (
            <button
              onClick={() => onRefresh()}
              disabled={isRefreshing}
              className='px-3 py-1 rounded bg-cosmic-blue/20 hover:bg-cosmic-blue/30 disabled:opacity-50 text-sm'
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
          {actions}
        </div>
      </header>
      {error && (
        <div className='mb-4 rounded border border-red-500/40 bg-red-900/30 p-3 text-sm text-red-300'>
          {error.message}
        </div>
      )}
      {children}
    </div>
  );
};

DomainPageFrame.displayName = 'DomainPageFrame';
export default DomainPageFrame;
