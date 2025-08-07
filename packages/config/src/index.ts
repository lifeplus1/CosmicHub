export interface AppConfig {
  apiUrl: string;
  isDevelopment: boolean;
  features: {
    healwave: boolean;
    astrology: boolean;
    numerology: boolean;
    humanDesign: boolean;
  };
}

export const config: AppConfig = {
  apiUrl: process.env.VITE_API_URL || 'http://localhost:8000',
  isDevelopment: process.env.NODE_ENV === 'development',
  features: {
    healwave: true,
    astrology: true,
    numerology: true,
    humanDesign: true,
  },
};

export * from './types';

export const getAppConfig = (appName: string) => {
  return {
    app: appName,
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  };
};

export const isFeatureEnabled = (feature: string, app?: string) => {
  const features: Record<string, boolean> = {
    healwave: true,
    crossAppIntegration: true,
    numerology: true,
    humanDesign: true,
  };
  return features[feature] || false;
};
