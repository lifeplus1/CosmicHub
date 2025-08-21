import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '../api';
import axios from 'axios';

vi.mock('axios');

const mockedAxios = axios as unknown as { post: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn>; patch: ReturnType<typeof vi.fn> };

// Basic token mock
vi.mock('../../config/environment', () => ({ devConsole: { log: vi.fn(), error: vi.fn(), warn: vi.fn() } }));
vi.mock('@cosmichub/config/firebase', () => ({ auth: { currentUser: { getIdToken: vi.fn().mockResolvedValue('test-token') } } }));

// Helper to build axios response
const buildResponse = <T,>(data: T, status = 200) => ({ data, status, statusText: 'OK' });

describe('API migration to ApiResult', () => {
  beforeEach(() => {
    mockedAxios.post = vi.fn();
    mockedAxios.get = vi.fn();
    mockedAxios.delete = vi.fn();
    mockedAxios.patch = vi.fn();
  });

  it('fetchSavedCharts returns success on 200', async () => {
    mockedAxios.get.mockResolvedValue(buildResponse({ charts: [{ id: '1' }] }));
    const result = await api.fetchSavedCharts();
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.length).toBe(1);
  });

  it('fetchSavedCharts returns failure on 401', async () => {
    mockedAxios.get.mockRejectedValue({ response: { status: 401 } });
    const result = await api.fetchSavedCharts();
    expect(result.success).toBe(false);
    if (!result.success) expect(result.code).toBe('401');
  });

  it('calculateHumanDesign returns success', async () => {
    mockedAxios.post.mockResolvedValue(buildResponse({ human_design: { type: 'Generator' } }));
    const result = await api.calculateHumanDesign({ year: 2000, month: 1, day: 1, hour: 0, minute: 0 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.human_design.type).toBe('Generator');
  });

  it('calculateHumanDesign returns failure on 400', async () => {
    mockedAxios.post.mockRejectedValue({ response: { status: 400 } });
    const result = await api.calculateHumanDesign({ year: 2000, month: 1, day: 1, hour: 0, minute: 0 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.code).toBe('400');
  });

  it('fetchAIInterpretations returns success', async () => {
    mockedAxios.post.mockResolvedValue(buildResponse({ data: [] }));
  const result = await api.fetchAIInterpretations('chart-1' as unknown as api.ChartId, 'user-1' as unknown as api.UserId);
    expect(result.success).toBe(true);
    if (result.success) expect(Array.isArray(result.data.data)).toBe(true);
  });

  it('fetchAIInterpretations returns failure on 401', async () => {
    mockedAxios.post.mockRejectedValue({ response: { status: 401 } });
  const result = await api.fetchAIInterpretations('chart-1' as unknown as api.ChartId, 'user-1' as unknown as api.UserId);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.code).toBe('401');
  });
});
