export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type RequestOptions = RequestInit & {
    headers?: Record<string, string>;
};

export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${apiBaseUrl}${endpoint}`;

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

    const response = await fetch(url, config);

    if (response.status === 401) {
        console.warn(`401 Unauthorized from ${url}`);
        throw new Error('Unauthorized');
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
}
