import { createRoot } from 'react-dom/client';
// import { StrictMode } from 'react'; // Temporarily disabled
import './index.css';
import App from './App';
// import './pwa'; // Temporarily disabled due to PWA package issues
import './pwa-performance';
import { initializeNotifications } from './services/notificationManager';
import { initCosmicHubAnalytics, trackPageView } from './services/analytics';
import { devConsole } from './config/environment';

// Enhanced environment-aware logging (silenced in production if devConsole.log noop)
devConsole.log?.('🚀 CosmicHub Frontend Starting...');
devConsole.log?.('📍 Environment:', import.meta.env.MODE);
devConsole.log?.('🌐 Base URL:', import.meta.env.BASE_URL);
devConsole.log?.(
  '⚙️ API URL:',
  import.meta.env['VITE_API_URL'] ?? 'http://localhost:8001'
);

const rootElement = document.getElementById('root');
if (!rootElement) {
  devConsole.error('❌ Root element not found');
  throw new Error('Root element not found');
}

devConsole.log?.('✅ Root element found, mounting React app...');

const root = createRoot(rootElement);
root.render(
  // <StrictMode> // Temporarily disabled to prevent infinite reloads
  <App />
  // </StrictMode>
);

devConsole.log?.('🎉 React app mounted successfully!');

// Initialize analytics
const analytics = initCosmicHubAnalytics();
if (analytics) {
  devConsole.log?.('📊 CosmicHub Analytics initialized');

  // Track initial page view
  trackPageView('app_start', {
    environment: import.meta.env.MODE,
    timestamp: Date.now(),
  });
} else {
  devConsole.log?.('📊 Analytics disabled (no providers configured or feature flag disabled)');
}

// Initialize push notifications and background sync
initializeNotifications()
  .then(success => {
    if (success) {
      devConsole.log?.('🔔 Push notifications initialized');
    } else {
      devConsole.warn?.('📵 Push notifications not available');
    }
  })
  .catch(error => {
    devConsole.warn?.('⚠️ Failed to initialize notifications:', error);
  });
