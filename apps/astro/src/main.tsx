import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import './index.css';
import App from './App';
import './pwa';
import './pwa-performance';
import { initializeNotifications } from './services/notificationManager';

// Enhanced browser console logging
console.log('🚀 CosmicHub Frontend Starting...');
console.log('📍 Environment:', import.meta.env.MODE);
console.log('🌐 Base URL:', import.meta.env.BASE_URL);
console.log('⚙️ API URL:', import.meta.env.VITE_API_URL || 'http://localhost:8001');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found');
  throw new Error('Root element not found');
}

console.log('✅ Root element found, mounting React app...');

const root = createRoot(rootElement);
root.render(
  // <StrictMode> // Temporarily disabled to prevent infinite reloads
    <App />
  // </StrictMode>
);

console.log('🎉 React app mounted successfully!');

// Initialize push notifications and background sync
initializeNotifications().then((success) => {
  if (success) {
    console.log('🔔 Push notifications initialized');
  } else {
    console.log('📵 Push notifications not available');
  }
}).catch((error) => {
  console.warn('⚠️ Failed to initialize notifications:', error);
});