import React, { useState } from 'react';

interface ErrorTestComponentProps {
  title?: string;
}

const HealWaveErrorTestComponent: React.FC<ErrorTestComponentProps> = ({
  title = 'HealWave Error Boundary Test',
}) => {
  const [shouldThrowError, setShouldThrowError] = useState(false);

  if (shouldThrowError) {
    // This will trigger the error boundary
    throw new Error(
      'HealWave frequency disruption detected - testing error boundary'
    );
  }

  return (
    <div className='p-6 max-w-md mx-auto bg-black/50 backdrop-blur-md rounded-lg shadow-2xl border border-white/10'>
      <h3 className='text-xl font-semibold text-cyan-400 mb-4'>{title}</h3>

      <div className='space-y-4'>
        <p className='text-gray-300'>
          Test the healing frequency error boundary by disrupting the harmonic
          flow.
        </p>

        <button
          onClick={() => setShouldThrowError(true)}
          className='w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
        >
          ⚡ Disrupt Frequency
        </button>

        <div className='mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded border border-white/10'>
          <h4 className='text-sm font-medium text-white mb-2'>
            Disruption Protocol:
          </h4>
          <ol className='text-xs text-gray-300 space-y-1'>
            <li>1. Frequency disruption triggered</li>
            <li>2. HealWave error boundary activates</li>
            <li>3. Harmony restoration interface displayed</li>
            <li>4. Recovery frequencies available</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default HealWaveErrorTestComponent;
