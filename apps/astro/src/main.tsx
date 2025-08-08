import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found');
  throw new Error('Root element not found');
}
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);