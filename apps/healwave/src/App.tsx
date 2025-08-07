import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@cosmichub/auth';
import { useCrossAppStore, CrossAppBridge } from '@cosmichub/integrations';
import { getAppConfig, isFeatureEnabled, PLANETARY_FREQUENCIES } from '@cosmichub/config';
import { Button } from '@cosmichub/ui';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FrequencyGenerator from './pages/FrequencyGenerator';
import Presets from './pages/Presets';
import Profile from './pages/Profile';

function MainApp(): JSX.Element {
  const { astroData, addNotification } = useCrossAppStore();
  const config = getAppConfig('healwave');

  // Handle astrology data integration
  React.useEffect(() => {
    if (astroData && isFeatureEnabled('astroIntegration', 'healwave')) {
      addNotification({
        id: 'astro-integration',
        message: 'Astrology data received - frequencies updated',
        type: 'success',
        timestamp: Date.now()
      });
    }
  }, [astroData, addNotification]);

  const handleOpenAstroApp = () => {
    CrossAppBridge.sendMessage('astro', {
      type: 'OPEN_CHART_CALCULATOR',
      payload: { returnTo: 'healwave' }
    });
  };

  return (
    <Router>
      <div className="min-h-screen bg-cosmic-dark text-cosmic-silver">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {/* Cross-app integration banner */}
          {isFeatureEnabled('astroIntegration', 'healwave') && (
            <div className="mb-6 p-4 bg-cosmic-purple/20 rounded-lg border border-cosmic-purple/30">
              <h3 className="text-lg font-semibold text-cosmic-gold mb-2">
                Astrological Frequency Healing
              </h3>
              <p className="text-sm text-cosmic-silver/80 mb-3">
                Generate healing frequencies based on your birth chart data.
              </p>
              <Button
                onClick={handleOpenAstroApp}
                className="bg-cosmic-gold text-cosmic-dark hover:bg-cosmic-gold/90"
              >
                Calculate Birth Chart
              </Button>
            </div>
          )}

          <Routes>
            <Route path="/" element={<FrequencyGenerator />} />
            <Route path="/presets" element={<Presets />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <Footer />
        
        {/* Debug info in development */}
        {config.environment === 'development' && (
          <div className="fixed bottom-4 right-4 bg-cosmic-purple p-2 rounded text-xs">
            App: {config.app} | Env: {config.environment}
            {astroData && <div>Astro Data: Connected</div>}
          </div>
        )}
      </div>
    </Router>
  );
}

const App: React.FC = () => (
  <AuthProvider appName="healwave">
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  </AuthProvider>
);

export default App;
