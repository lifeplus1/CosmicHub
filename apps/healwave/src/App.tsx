import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@cosmichub/auth';
import { useCrossAppStore } from '@cosmichub/integrations';
import { getAppConfig, isFeatureEnabled } from '@cosmichub/config';
import { Button } from '@cosmichub/ui';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FrequencyGenerator from './pages/FrequencyGenerator';
import Presets from './pages/Presets';
import Profile from './pages/Profile';

function MainApp(): JSX.Element {
  const { addNotification } = useCrossAppStore();
  const config = getAppConfig('healwave');

  React.useEffect(() => {
    if (isFeatureEnabled('crossAppIntegration')) {
      addNotification({
        id: 'healwave-init',
        message: 'Healwave app initialized with cross-app integration',
        type: 'info',
        timestamp: Date.now()
      });
    }
  }, [addNotification]);

  const handleOpenAstroApp = () => {
    window.open('/astro', '_blank');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Healwave Frequency Generator</h1>
            <p className="text-xl text-blue-200">
              Therapeutic sound frequencies for healing and wellness
            </p>
            <div className="mt-4">
              <Button
                onClick={handleOpenAstroApp}
                className="bg-cosmic-gold text-cosmic-dark hover:bg-cosmic-gold/90"
              >
                Open Astrology App
              </Button>
            </div>
          </div>

          <Routes>
            <Route path="/" element={<FrequencyGenerator />} />
            <Route path="/presets" element={<Presets />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <Footer />
        
        {config.environment === 'development' && (
          <div className="fixed bottom-4 right-4 bg-purple-600 p-2 rounded text-xs">
            App: {config.app} | Env: {config.environment} | Version: {config.version}
          </div>
        )}
      </div>
    </Router>
  );
}

const App: React.FC = () => (
  <AuthProvider>
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  </AuthProvider>
);

export default App;
