import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UsageData {
  chartsThisMonth: number;
  savedCharts: number;
  lastReset: string;
}

export const useUsageTracking = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageData>({
    chartsThisMonth: 0,
    savedCharts: 0,
    lastReset: new Date().toISOString().slice(0, 7) // YYYY-MM format
  });

  // Load usage from localStorage on mount
  useEffect(() => {
    if (!user) return;

    const stored = localStorage.getItem(`usage_${user.uid}`);
    if (stored) {
      const parsedUsage = JSON.parse(stored);
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Reset monthly counter if it's a new month
      if (parsedUsage.lastReset !== currentMonth) {
        const resetUsage = {
          ...parsedUsage,
          chartsThisMonth: 0,
          lastReset: currentMonth
        };
        setUsage(resetUsage);
        localStorage.setItem(`usage_${user.uid}`, JSON.stringify(resetUsage));
      } else {
        setUsage(parsedUsage);
      }
    }
  }, [user]);

  // Save usage to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`usage_${user.uid}`, JSON.stringify(usage));
    }
  }, [usage, user]);

  const incrementChartCalculation = () => {
    setUsage(prev => ({
      ...prev,
      chartsThisMonth: prev.chartsThisMonth + 1
    }));
  };

  const incrementSavedChart = () => {
    setUsage(prev => ({
      ...prev,
      savedCharts: prev.savedCharts + 1
    }));
  };

  const decrementSavedChart = () => {
    setUsage(prev => ({
      ...prev,
      savedCharts: Math.max(0, prev.savedCharts - 1)
    }));
  };

  return {
    usage,
    incrementChartCalculation,
    incrementSavedChart,
    decrementSavedChart
  };
};
