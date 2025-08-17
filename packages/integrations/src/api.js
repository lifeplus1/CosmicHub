export const API_ENDPOINTS = {
    astrology: '/api/astrology',
    healwave: '/api/healwave',
    numerology: '/api/numerology',
    humanDesign: '/api/human-design',
};
export async function apiRequest(endpoint, options) {
    try {
        const response = await fetch(endpoint, {
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            ...options,
        });
        const data = await response.json();
        if (!response.ok) {
            return { success: false, error: data.message || 'Request failed' };
        }
        return { success: true, data };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
//# sourceMappingURL=api.js.map