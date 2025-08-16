// Re-export from the shared auth package
export * from '@cosmichub/auth';
// --- Global fetch wrapper to propagate X-Request-ID & capture in errors ---
const originalFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
	const requestId = crypto.randomUUID();
	const newInit: RequestInit = {
		...(init || {}),
		headers: {
			...(init?.headers || {}),
			'X-Request-ID': requestId,
		},
	};
	const resp = await originalFetch(input, newInit);
	// Attach ID to any global error reporter (placeholder)
	if (!resp.ok) {
		// eslint-disable-next-line no-console
		console.warn('Request failed', { requestId, status: resp.status, url: String(input) });
	}
	return resp;
};
