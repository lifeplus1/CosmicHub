import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAnalytics } from '../hooks/useAnalytics';

// Mock dynamic firebase imports
vi.mock('firebase/app', () => ({ getApp: vi.fn(() => ({ name: 'app' })) }));
const logEventMock = vi.fn();
const setUserIdMock = vi.fn();
const setUserPropertiesMock = vi.fn();
const setCurrentScreenMock = vi.fn();

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(() => ({ instance: true })),
  logEvent: (...args: any[]) => logEventMock(...args),
  setUserId: (...args: any[]) => setUserIdMock(...args),
  setUserProperties: (...args: any[]) => setUserPropertiesMock(...args),
  setCurrentScreen: (...args: any[]) => setCurrentScreenMock(...args),
}));

describe('useAnalytics', () => {
  beforeEach(() => {
    logEventMock.mockClear();
    setUserIdMock.mockClear();
    setUserPropertiesMock.mockClear();
    setCurrentScreenMock.mockClear();
  });

  it('initializes analytics lazily and exposes ready state', async () => {
    const { result } = renderHook(() => useAnalytics());
    expect(result.current.isReady).toBe(false);
    await waitFor(() => expect(result.current.isReady).toBe(true));
    expect(result.current.analytics).toBeTruthy();
  });

  it('proxies logEvent calls', async () => {
    const { result } = renderHook(() => useAnalytics());
    await waitFor(() => expect(result.current.isReady).toBe(true));
    act(() => result.current.logEvent('test_event', { foo: 'bar' }));
    await waitFor(() => expect(logEventMock).toHaveBeenCalled());
  });

  it('sets user id and properties', async () => {
    const { result } = renderHook(() => useAnalytics());
    await waitFor(() => expect(result.current.isReady).toBe(true));
    act(() => result.current.setUserId('user123'));
    await waitFor(() => expect(setUserIdMock).toHaveBeenCalled());
    act(() => result.current.setUserProperties({ plan: 'pro' }));
    await waitFor(() => expect(setUserPropertiesMock).toHaveBeenCalled());
  });

  it('sets current screen', async () => {
    const { result } = renderHook(() => useAnalytics());
    await waitFor(() => expect(result.current.isReady).toBe(true));
    act(() => result.current.setCurrentScreen('Home'));
    await waitFor(() => expect(setCurrentScreenMock).toHaveBeenCalled());
  });
});
