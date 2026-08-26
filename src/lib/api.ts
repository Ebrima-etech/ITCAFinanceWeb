const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://itcafinanceback.onrender.com/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('itca_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!res.ok) {
      let message = res.statusText;
      try {
        const body = await res.json();
        message = Array.isArray(body.message) ? body.message.join(', ') : body.message ?? message;
      } catch {
        // response had no JSON body
      }
      throw new ApiError(message, res.status);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  } catch (err) {
    // Network error or other fetch failure
    if (err instanceof ApiError) throw err;

    const message = err instanceof Error && err.message.includes('Failed to fetch')
      ? `Cannot connect to server (${API_URL}). Make sure the backend is running.`
      : err instanceof Error ? err.message : 'Network error. Please try again.';

    throw new ApiError(message, 0);
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
