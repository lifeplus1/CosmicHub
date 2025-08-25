// Re-export from the shared auth package
export * from '@cosmichub/auth';
import { logger } from '@cosmichub/config';

// Create component-specific logger
const authLogger = logger.child({ module: 'HealWaveAuth' });

// --- Global fetch wrapper to propagate X-Request-ID & capture in errors ---
const originalFetch = window.fetch.bind(window);
window.fetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const requestId = crypto.randomUUID();
  const inputStr =
    input instanceof URL
      ? input.toString()
      : typeof input === 'string'
        ? input
        : '[object Request]';
  const newInit: RequestInit = {
    ...(init ?? {}),
    headers: {
      ...(init?.headers ?? {}),
      'X-Request-ID': requestId,
    },
  };
  const resp = await originalFetch(input, newInit);
  // Attach ID to any global error reporter (placeholder)
  if (resp.ok === false) {
    authLogger.warn('Request failed', {
      requestId,
      status: resp.status,
      url: inputStr,
    });
  }
  return resp;
};
