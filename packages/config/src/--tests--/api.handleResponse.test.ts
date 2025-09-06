import { describe, it, expect, vi, afterEach } from 'vitest';
import { ApiClient } from '../api';

// Mock fetch globally
const originalFetch = global.fetch;

describe('ApiClient.handleResponse integration', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns success with data property', async () => {
    const mockResp = {
      ok: true,
      status: 200,
      json: async () => ({ data: { value: 42 }, message: 'ok' }),
    } as Response;
    global.fetch = vi.fn().mockResolvedValue(mockResp);
    const client = new ApiClient('https://api.test');
    const result = await client.get<{ value: number }>('/test');
    expect(result.success).toBe(true);
    expect(result.data.value).toBe(42);
  });

  it('returns success when no wrapping data field', async () => {
    const mockResp = {
      ok: true,
      status: 200,
      json: async () => ({ value: 7 }),
    } as Response;
    global.fetch = vi.fn().mockResolvedValue(mockResp);
    const client = new ApiClient('https://api.test');
    const result = await client.get<{ value: number }>('/plain');
    expect(result.success).toBe(true);
    expect((result.data as any).value).toBe(7);
  });

  it('throws structured error on non-ok response', async () => {
    const mockResp = {
      ok: false,
      status: 500,
      json: async () => ({ error: 'boom' }),
    } as Response;
    global.fetch = vi.fn().mockResolvedValue(mockResp);
    const client = new ApiClient('https://api.test');
    await expect(client.get('/err')).rejects.toBeInstanceOf(Error);
  });
});
