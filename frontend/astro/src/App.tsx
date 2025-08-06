import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';
// Removed unused ChangeEvent and FormEvent type imports
// Removed unused useNavigate import
// ...existing code...
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './shared/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import type { ChartData } from './types';

interface ExtendedChartData extends ChartData {
  latitude: number;
  longitude: number;
  timezone: string;
  julian_day: number;
  angles: Record<string, number>;
}

function MainApp(): JSX.Element {
  useAuth();
  // Removed unused birthData, setBirthData, loading, navigate, handleSaveChart, handleSubmit

  return (
    <>
      <Navbar />
      {/* Main content and routes go here */}
      <Footer />
    </>
  );
}

const App: React.FC = () => (
  <AuthProvider>
    <SubscriptionProvider>
      <ErrorBoundary>
        <MainApp />
      </ErrorBoundary>
    </SubscriptionProvider>
  </AuthProvider>
);

export default App;