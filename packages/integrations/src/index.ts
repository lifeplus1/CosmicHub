export interface AstrologyChart {
  id: string;
  userId: string;
  birthData: {
    date: string;
    time: string;
    location: {
      lat: number;
      lng: number;
      name: string;
    };
  };
  planets: Planet[];
  houses: House[];
  aspects: Aspect[];
}

export interface Planet {
  name: string;
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
}

export interface House {
  number: number;
  sign: string;
  degree: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
  applying: boolean;
}

export interface HealwaveSession {
  id: string;
  userId: string;
  frequency: number;
  duration: number;
  timestamp: string;
  personalizedFor?: AstrologyChart;
}

export * from './api';
export const useCrossAppStore = () => {
  return {
    addNotification: (notification: { id: string; message: string; type: string; timestamp: number }) => {
      console.log("Cross-app notification:", notification);
    },
    notifications: [],
    clearNotifications: () => {},
  };
};
