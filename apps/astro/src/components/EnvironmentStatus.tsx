import React from 'react';

interface EnvironmentStatusProps {
  className?: string;
}

export const EnvironmentStatus: React.FC<EnvironmentStatusProps> = ({ className = '' }) => {
  // Helper uses typeof import.meta.env to avoid referencing possibly undefined global type name
  function getEnv<K extends string>(key: K): string | undefined {
    const envObj = import.meta.env as Record<string, unknown>;
    const raw = envObj[key];
    return typeof raw === 'string' ? raw : undefined;
  }

  // Explicitly type config to prevent unsafe any propagation
  const firebaseConfig: {
    apiKey: string | undefined;
    authDomain: string | undefined;
    projectId: string | undefined;
    storageBucket: string | undefined;
    messagingSenderId: string | undefined;
    appId: string | undefined;
  } = {
    apiKey: getEnv('VITE_FIREBASE_API_KEY'),
    authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnv('VITE_FIREBASE_APP_ID'),
  };

  const isFirebaseConfigured = Object.values(firebaseConfig).every(value => {
    return typeof value === 'string' && value.length > 0 && value.includes('placeholder') === false;
  });

  const apiUrl = getEnv('VITE_API_URL');
  const isDevelopment: boolean = Boolean(import.meta.env.DEV);

  return (
    <div className={`rounded-xl border p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-cosmic-purple/20 rounded-lg flex items-center justify-center mr-3">
          <span className="text-lg">⚙️</span>
        </div>
        <h3 className="text-lg font-semibold text-cosmic-gold font-playfair">Environment Status</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-cosmic-dark/30 rounded-lg">
          <span className="text-sm text-cosmic-silver/80 font-medium">Mode:</span>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${
            isDevelopment 
              ? 'bg-yellow-600/20 text-yellow-300 border border-yellow-600/30' 
              : 'bg-green-600/20 text-green-300 border border-green-600/30'
          }`}>
            {isDevelopment ? '🔧 Development' : '🚀 Production'}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-cosmic-dark/30 rounded-lg">
          <span className="text-sm text-cosmic-silver/80 font-medium">API URL:</span>
          <span className="text-sm text-cosmic-silver font-mono text-right">
            {(typeof apiUrl === 'string' && apiUrl.length > 0) ? apiUrl : 'Not configured'}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-cosmic-dark/30 rounded-lg">
          <span className="text-sm text-cosmic-silver/80 font-medium">Firebase Auth:</span>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${
            isFirebaseConfigured 
              ? 'bg-green-600/20 text-green-300 border border-green-600/30' 
              : 'bg-orange-600/20 text-orange-300 border border-orange-600/30'
          }`}>
            {isFirebaseConfigured ? '✅ Configured' : '🔄 Demo Mode'}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-cosmic-dark/30 rounded-lg">
          <span className="text-sm text-cosmic-silver/80 font-medium">Project ID:</span>
          <span className="text-sm text-cosmic-silver font-mono text-right">
            {(typeof firebaseConfig.projectId === 'string' && firebaseConfig.projectId.length > 0) ? firebaseConfig.projectId : 'None'}
          </span>
        </div>
      </div>

  {(isFirebaseConfigured === false) && (
        <div className="mt-4 p-4 bg-gradient-to-r from-orange-600/10 to-yellow-600/10 border border-orange-600/20 rounded-lg">
          <div className="flex items-start">
            <span className="text-orange-300 mr-2 mt-0.5">ℹ️</span>
            <div>
              <p className="text-sm font-medium text-orange-200 mb-1">Demo Configuration Active</p>
              <p className="text-xs text-orange-200/80 leading-relaxed">
                Using placeholder Firebase credentials. Set real Firebase environment variables for full authentication functionality.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentStatus;
