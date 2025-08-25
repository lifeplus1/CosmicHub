/**
 * Lazy-loaded ephemeris chart component for transit analysis.
 *
 * This component is code-split to reduce the initial bundle size
 * and only loads when ephemeris data is actually needed.
 */

import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Lazy load the heavy ephemeris chart component
const LazyEphemerisChart = lazy(() =>
  import('./EphemerisChart').then(module => ({
    default: module.EphemerisChart,
  }))
);

interface EphemerisChartWrapperProps {
  date: Date;
  onError?: (error: Error) => void;
}

const EphemerisLoadingFallback: React.FC = () => (
  <div className='flex items-center justify-center p-8'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
    <span className='ml-2 text-gray-600'>Loading ephemeris data...</span>
  </div>
);

const EphemerisErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => (
  <div className='border border-red-200 bg-red-50 p-4 rounded-lg'>
    <h3 className='text-red-800 font-medium'>Failed to load ephemeris data</h3>
    <p className='text-red-600 text-sm mt-1'>{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className='mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700'
    >
      Try again
    </button>
  </div>
);

export const EphemerisChartWrapper: React.FC<EphemerisChartWrapperProps> = ({
  date,
  onError,
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={EphemerisErrorFallback}
      onError={onError}
      resetKeys={[date]}
    >
      <Suspense fallback={<EphemerisLoadingFallback />}>
        <LazyEphemerisChart date={date} />
      </Suspense>
    </ErrorBoundary>
  );
};
