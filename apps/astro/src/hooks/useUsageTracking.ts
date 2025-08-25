import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@cosmichub/auth';
import { isNonEmptyString, safeJsonParse } from '@/utils/typeGuards';

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
    lastReset: new Date().toISOString().slice(0, 7), // YYYY-MM format
  });

  // Load usage from localStorage on mount
  useEffect(() => {
    if (!user) return;

    const key = `usage_${user.uid}`;
    const stored = localStorage.getItem(key);
    if (!isNonEmptyString(stored)) return;

    const parsedUsage = safeJsonParse<Partial<UsageData>>(stored, {});
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastReset = isNonEmptyString(parsedUsage.lastReset)
      ? parsedUsage.lastReset
      : currentMonth;

    // Build merged usage with sane defaults
    const merged: UsageData = {
      chartsThisMonth:
        typeof parsedUsage.chartsThisMonth === 'number'
          ? parsedUsage.chartsThisMonth
          : 0,
      savedCharts:
        typeof parsedUsage.savedCharts === 'number'
          ? parsedUsage.savedCharts
          : 0,
      lastReset,
    };

    if (merged.lastReset !== currentMonth) {
      const resetUsage: UsageData = {
        ...merged,
        chartsThisMonth: 0,
        lastReset: currentMonth,
      };
      setUsage(resetUsage);
      localStorage.setItem(key, JSON.stringify(resetUsage));
    } else {
      setUsage(merged);
    }
  }, [user]);

  // Save usage to localStorage whenever it changes
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`usage_${user.uid}`, JSON.stringify(usage));
  }, [usage, user]);

  const incrementChartCalculation = useCallback(() => {
    setUsage(prev => ({ ...prev, chartsThisMonth: prev.chartsThisMonth + 1 }));
  }, []);

  const incrementSavedChart = useCallback(() => {
    setUsage(prev => ({ ...prev, savedCharts: prev.savedCharts + 1 }));
  }, []);

  const decrementSavedChart = useCallback(() => {
    setUsage(prev => ({
      ...prev,
      savedCharts: Math.max(0, prev.savedCharts - 1),
    }));
  }, []);

  return {
    usage,
    incrementChartCalculation,
    incrementSavedChart,
    decrementSavedChart,
  };
};
