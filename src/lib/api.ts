const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const mergedHeaders = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: mergedHeaders,
      credentials: 'include',
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      return { success: false, data: null, error: err.error || err.message || res.statusText };
    }
    const data = (await res.json()) as T;
    return { success: true, data };
  } catch (e) {
    return { success: false, data: null, error: e instanceof Error ? e.message : 'Network error' };
  }
}

export const api = {
  get: <T>(url: string, options?: RequestInit) => apiFetch<T>(url, { method: 'GET', ...options }),
  post: <T>(url: string, body: unknown, options?: RequestInit) =>
    apiFetch<T>(url, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: <T>(url: string, body: unknown, options?: RequestInit) =>
    apiFetch<T>(url, { method: 'PUT', body: JSON.stringify(body), ...options }),
  patch: <T>(url: string, body: unknown, options?: RequestInit) =>
    apiFetch<T>(url, { method: 'PATCH', body: JSON.stringify(body), ...options }),
  delete: <T>(url: string, options?: RequestInit) => apiFetch<T>(url, { method: 'DELETE', ...options }),
};

export default api;
