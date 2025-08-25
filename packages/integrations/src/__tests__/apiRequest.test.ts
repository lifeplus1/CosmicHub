import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiRequest } from '../api';

describe('integrations apiRequest', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns success on ok response', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ value: 5 }),
      });
    const res = await apiRequest<{ value: number }>('/test');
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.value).toBe(5);
  });

  it('returns failure on non-ok response', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: 'bad' }),
      });
    const res = await apiRequest('/err');
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toContain('bad');
  });

  it('returns failure on fetch throw', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network'));
    const res = await apiRequest('/boom');
    expect(res.success).toBe(false);
  });
});
