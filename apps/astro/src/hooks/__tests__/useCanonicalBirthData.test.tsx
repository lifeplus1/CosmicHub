import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  BirthDataProvider,
  useBirthData,
} from '../../contexts/BirthDataContext';
import { useCanonicalBirthData } from '../useCanonicalBirthData';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BirthDataProvider>{children}</BirthDataProvider>
);

describe('useCanonicalBirthData', () => {
  it('returns null when no birth data set', () => {
    const { result } = renderHook(
      () => {
        const bd = useBirthData();
        const canonical = useCanonicalBirthData();
        return { bd, canonical };
      },
      { wrapper }
    );

    // Clear any existing birth data that might be in the context
    act(() => {
      if (result.current.bd.setBirthData) {
        result.current.bd.setBirthData(null as any);
      }
    });

    expect(result.current.canonical).toBeNull();
  });

  it('returns canonical data when extended birth data provided', () => {
    const { result: combined } = renderHook(
      () => {
        const bd = useBirthData();
        const canonical = useCanonicalBirthData();
        return { bd, canonical };
      },
      { wrapper }
    );
    act(() => {
      combined.current.bd.setBirthData({
        year: 2000,
        month: 1,
        day: 2,
        hour: 3,
        minute: 4,
        lat: 10,
        lon: 20,
        city: 'Test City',
        timezone: 'UTC',
      } as any);
    });
    // After state update canonical should reflect values
    expect(combined.current.canonical).not.toBeNull();
    expect(combined.current.canonical?.birth_date).toBe('2000-01-02');
    expect(combined.current.canonical?.birth_time).toBe('03:04');
  });
});
