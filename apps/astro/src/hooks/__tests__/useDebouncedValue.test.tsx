import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from '../useDebouncedValue';
import { vi } from 'vitest';

vi.useFakeTimers();

describe('useDebouncedValue', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('debounces changes', () => {
    let value = 'a';
    const { result, rerender } = renderHook(() => useDebouncedValue(value, 300));
    expect(result.current).toBe('a');
    value = 'ab';
    rerender();
    // advance less than delay
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('a');
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('ab');
  });

  it('resets timer on rapid input', () => {
    let value = 'x';
    const { result, rerender } = renderHook(() => useDebouncedValue(value, 300));
    value = 'xy';
    rerender();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    value = 'xyz';
    rerender();
    act(() => {
      vi.advanceTimersByTime(250);
    });
    // Still old because total since last change < 300
    expect(result.current).toBe('x');
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBe('xyz');
  });
});
