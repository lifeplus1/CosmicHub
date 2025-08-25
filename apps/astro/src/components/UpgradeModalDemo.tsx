import React from 'react';
import { useSubscription } from '@cosmichub/auth';

/**
 * Demo component to test the upgrade modal functionality
 * This demonstrates how to use the subscription system to gate premium features
 */
export const UpgradeModalDemo: React.FC = () => {
  const subscriptionData = useSubscription();
  const hasFeature =
    typeof subscriptionData?.hasFeature === 'function'
      ? subscriptionData.hasFeature
      : () => false;
  const upgradeRequired =
    typeof subscriptionData?.upgradeRequired === 'function'
      ? subscriptionData.upgradeRequired
      : () => {};
  const userTier =
    subscriptionData?.tier ?? subscriptionData?.userTier ?? 'Free';

  const testGeneKeysFeature = () => {
    if (hasFeature('Pro') !== true) {
      upgradeRequired('Gene Keys Analysis');
      return;
    }
    // Feature logic would go here
    alert(
      'Gene Keys Analysis is available! (This would open the actual feature)'
    );
  };

  const testSynastryFeature = () => {
    if (hasFeature('Pro') !== true) {
      upgradeRequired('Synastry Compatibility Analysis');
      return;
    }
    alert('Synastry Analysis is available!');
  };

  const testPdfExport = () => {
    if (hasFeature('Pro') !== true) {
      upgradeRequired('PDF Chart Export');
      return;
    }
    alert('PDF Export is available!');
  };

  const testEnterpriseFeature = () => {
    if (hasFeature('Enterprise') !== true) {
      upgradeRequired('API Access & White-label Solutions');
      return;
    }
    alert('Enterprise features are available!');
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <div className='bg-white rounded-lg shadow-lg p-8'>
        <h2 className='text-3xl font-bold text-cosmic-dark mb-6 text-center'>
          Upgrade Modal Demo
        </h2>

        <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
          <p className='text-lg'>
            <span className='font-semibold'>Current Tier:</span>
            <span
              className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${
                userTier === 'Free'
                  ? 'bg-gray-200 text-gray-800'
                  : userTier === 'Basic'
                    ? 'bg-blue-200 text-blue-800'
                    : userTier === 'Pro'
                      ? 'bg-purple-200 text-purple-800'
                      : 'bg-gold-200 text-gold-800'
              }`}
            >
              {userTier}
            </span>
          </p>
          <p className='text-gray-600 mt-2'>
            Click the buttons below to test different upgrade scenarios. If you
            don&apos;t have access, you&apos;ll see the upgrade modal.
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-4'>
          <div className='space-y-4'>
            <h3 className='text-xl font-semibold text-cosmic-dark'>
              Pro Features
            </h3>

            <button
              onClick={testGeneKeysFeature}
              className='w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors'
            >
              🧬 Try Gene Keys Analysis
            </button>

            <button
              onClick={testSynastryFeature}
              className='w-full bg-pink-600 hover:bg-pink-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors'
            >
              💕 Try Synastry Analysis
            </button>

            <button
              onClick={testPdfExport}
              className='w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors'
            >
              📄 Try PDF Export
            </button>
          </div>

          <div className='space-y-4'>
            <h3 className='text-xl font-semibold text-cosmic-dark'>
              Enterprise Features
            </h3>

            <button
              onClick={testEnterpriseFeature}
              className='w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors'
            >
              🚀 Try Enterprise Features
            </button>

            <div className='p-4 bg-yellow-50 rounded-lg border border-yellow-200'>
              <h4 className='font-semibold text-yellow-800 mb-2'>
                How it works:
              </h4>
              <ul className='text-sm text-yellow-700 space-y-1'>
                <li>
                  • Feature check using <code>hasFeature()</code>
                </li>
                <li>• Automatic upgrade modal trigger</li>
                <li>• Contextual pricing recommendations</li>
                <li>• Graceful upgrade flow</li>
              </ul>
            </div>
          </div>
        </div>

        <div className='mt-8 p-4 bg-cosmic-purple bg-opacity-10 rounded-lg border border-cosmic-purple border-opacity-30'>
          <h4 className='font-semibold text-cosmic-purple mb-2'>
            🔧 Developer Notes:
          </h4>
          <ul className='text-sm text-gray-700 space-y-1'>
            <li>• The upgrade modal will show tier-specific recommendations</li>
            <li>
              • Currently redirects to pricing page with pre-selected tier
            </li>
            <li>• Ready for Stripe integration (TODO items marked)</li>
            <li>• Event-based system prevents circular dependencies</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModalDemo;
