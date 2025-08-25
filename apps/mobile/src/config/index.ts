// Mobile app configuration

export const mobileConfig = {
  // API endpoints - your existing backend will work
  api: {
    baseUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://api.cosmichub.app',
    timeout: 30000,
  },
  
  // Audio settings for HealWave
  audio: {
    defaultVolume: 0.5,
    maxSessionDuration: 3600, // 1 hour
    frequencyRanges: {
      delta: [0.5, 4],    // Deep sleep
      theta: [4, 8],      // Meditation
      alpha: [8, 13],     // Relaxation/creativity
      beta: [13, 30],     // Focus/concentration
      gamma: [30, 100],   // Heightened awareness
    },
  },
  
  // Chart rendering settings
  chart: {
    defaultSize: 300,
    maxSize: 400,
    minSize: 200,
    colors: {
      background: '#000014',
      primary: '#4a90e2',
      secondary: '#5856d6',
      accent: '#32d74b',
      text: '#ffffff',
      textSecondary: '#cccccc',
    },
  },
  
  // Feature flags
  features: {
    offlineMode: true,
    pushNotifications: true,
    biometricAuth: true,
    darkModeOnly: true, // Mobile app uses dark theme
  },
  
  // Analytics (respecting privacy)
  analytics: {
    enabled: true,
    crashReporting: true,
    performanceMonitoring: true,
  },
};

// Re-export shared config for consistency
export { config } from '@cosmichub/config';
