import React, { useState, useCallback } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface ErrorTestComponentProps {
  title?: string;
}

const HealWaveErrorTestComponent: React.FC<ErrorTestComponentProps> = React.memo(({
  title = 'HealWave Error Boundary Test',
}) => {
  const [shouldThrowError, setShouldThrowError] = useState(false);

  const handleDisruptFrequency = useCallback(() => {
    setShouldThrowError(true);
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleDisruptFrequency();
    }
  }, [handleDisruptFrequency]);

  if (shouldThrowError) {
    // This will trigger the error boundary
    throw new Error(
      'HealWave frequency disruption detected - testing error boundary'
    );
  }

  return (
    <div 
      className='p-6 max-w-md mx-auto bg-black/50 backdrop-blur-md rounded-lg shadow-2xl border border-white/10'
      role='region'
      aria-labelledby='error-test-title'
    >
      <h3 id='error-test-title' className='text-xl font-semibold text-cyan-400 mb-4'>{title}</h3>

      <div className='space-y-4'>
        <p className='text-gray-300'>
          Test the healing frequency error boundary by disrupting the harmonic
          flow.
        </p>

        <button
          onClick={handleDisruptFrequency}
          onKeyDown={handleKeyDown}
          className='w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
          aria-label='Trigger frequency disruption to test error boundary'
          aria-describedby='disruption-protocol'
        >
          ⚡ Disrupt Frequency
        </button>

        <div 
          id='disruption-protocol'
          className='mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded border border-white/10'
          role='group'
          aria-labelledby='protocol-title'
        >
          <h4 id='protocol-title' className='text-sm font-medium text-white mb-2'>
            Disruption Protocol:
          </h4>
          <ol className='text-xs text-gray-300 space-y-1' role='list'>
            <li role='listitem'>1. Frequency disruption triggered</li>
            <li role='listitem'>2. HealWave error boundary activates</li>
            <li role='listitem'>3. Harmony restoration interface displayed</li>
            <li role='listitem'>4. Recovery frequencies available</li>
          </ol>
        </div>
      </div>
    </div>
  );
});

HealWaveErrorTestComponent.displayName = 'HealWaveErrorTestComponent';

// Export with ErrorBoundary wrapper
const HealWaveErrorTestComponentWithErrorBoundary: React.FC<ErrorTestComponentProps> = (props) => (
  <ErrorBoundary
    fallback={
      <div className='p-6 max-w-md mx-auto bg-red-900/50 backdrop-blur-md rounded-lg shadow-2xl border border-red-500/30'>
        <h3 className='text-xl font-semibold text-red-400 mb-4'>⚠️ Component Error</h3>
        <p className='text-red-300 mb-4'>
          The error test component encountered an unexpected error. This is not part of the intended test.
        </p>
        <button
          onClick={() => window.location.reload()}
          className='w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
        >
          🔄 Refresh Page
        </button>
      </div>
    }
  >
    <HealWaveErrorTestComponent {...props} />
  </ErrorBoundary>
);

export default HealWaveErrorTestComponentWithErrorBoundary;
