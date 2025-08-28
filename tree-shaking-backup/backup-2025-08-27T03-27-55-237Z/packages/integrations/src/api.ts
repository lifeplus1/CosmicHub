import {
  buildSuccess,
  buildFailure,
  type StandardApiResponse,
} from './utils/apiShared';

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    });
    let raw: unknown;
    try {
      raw = await response.json();
    } catch {
      raw = undefined;
    }
    const obj =
      typeof raw === 'object' && raw !== null
        ? (raw as Record<string, unknown>)
        : {};
    if (!response.ok) {
      const msg =
        typeof obj.message === 'string' ? obj.message : 'Request failed';
      return buildFailure(msg, String(response.status), obj);
    }
    return buildSuccess(raw as T);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return buildFailure(msg);
  }
}
