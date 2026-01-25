// Use environment variable for API URL (compatible with Expo/React Native)
// Falls back to localhost for web development
export const apiBaseUrl =
    typeof process !== 'undefined'
        ? (process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000")
        : "http://127.0.0.1:8000";

type RequestOptions = RequestInit & {
    headers?: Record<string, string>;
};

// Track if we're currently refreshing to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

/**
 * Refresh the access token using the refresh token.
 * Returns the new access token or throws an error.
 */
async function refreshAccessToken(): Promise<string> {
    // If already refreshing, return the existing promise
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = (async () => {
        try {
            const refreshToken = typeof window !== 'undefined'
                ? localStorage.getItem('refresh_token')
                : null;

            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            console.log('[API] Refreshing access token...');

            const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const data = await response.json();

            // Save new tokens
            if (typeof window !== 'undefined') {
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);
            }

            console.log('[API] Access token refreshed successfully');
            return data.access_token;
        } catch (error) {
            console.error('[API] Token refresh failed:', error);
            // Clear tokens and reload on refresh failure
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.reload();
            }
            throw error;
        } finally {
            isRefreshing = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${apiBaseUrl}${endpoint}`;
    console.log(`[API Request] Fetching: ${url}`, {
        endpoint,
        baseUrl: apiBaseUrl,
        options,
        fullConfig: { ...options, headers: { ...options.headers } }
    });

    const headers: Record<string, string> = {
        ...options.headers,
    };

    // Inject Authorization header if token exists
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Set Content-Type to application/json by default, unless body is FormData or URLSearchParams
    if (options.body instanceof FormData) {
        delete headers['Content-Type']; // Let browser set multipart/form-data boundary
    } else if (!(options.body instanceof URLSearchParams) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);

        if (response.status === 401) {
            console.warn(`401 Unauthorized from ${url}`);

            // Check if we have a refresh token and the request wasn't to the refresh endpoint
            const hasRefreshToken = typeof window !== 'undefined'
                && localStorage.getItem('refresh_token');
            const isRefreshEndpoint = endpoint === '/auth/refresh';

            if (hasRefreshToken && !isRefreshEndpoint) {
                try {
                    // Attempt to refresh the token
                    await refreshAccessToken();

                    // Retry the original request with the new token
                    console.log(`[API] Retrying original request to ${url}`);
                    return apiFetch<T>(endpoint, options);
                } catch (refreshError) {
                    // Refresh failed, error handling is done in refreshAccessToken
                    throw new Error('Session expired');
                }
            } else {
                // No refresh token or refresh endpoint failed - logout
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.reload();
                }
                throw new Error('Unauthorized');
            }
        }

        if (!response.ok) {
            // Try to parse error message
            let errorMessage = `HTTP Error ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.detail) {
                    errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
                }
            } catch (e) {
                // Ignore json parse error
            }
            throw new Error(errorMessage);
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    } catch (error) {
        // Use warn instead of error for expected cases like 404s and validation errors (400)
        const message = error instanceof Error ? error.message : 'Unknown error';
        const isExpectedError =
            message.toLowerCase().includes('not found') ||
            message.toLowerCase().includes('no ready recordings') ||
            message.includes('404') ||
            message.includes('HTTP Error 400') ||
            message.includes('username already registered'); // Specific known error

        if (isExpectedError) {
            console.warn(`[API] ${url}: ${message}`);
        } else {
            console.error(`[API Error] Failed to fetch ${url}`, {
                error: error,
                errorType: error?.constructor?.name,
                message: message,
                errorString: String(error),
                stack: error instanceof Error ? error.stack : undefined,
                cause: error instanceof Error ? error.cause : undefined
            });
        }
        throw error;
    }
}
