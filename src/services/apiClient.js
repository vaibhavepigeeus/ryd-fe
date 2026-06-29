const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function getApiBaseUrl() {
  return API_BASE.replace(/\/$/, '');
}

export async function apiFetch(path, options = {}) {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = `API error: ${response.status}`;

    try {
      const body = await response.json();
      message = body.message || body.error || body.detail || message;
    } catch {
      // ignore JSON parse errors
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function apiUpload(path, formData, options = {}) {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: formData,
    ...options,
  });

  if (!response.ok) {
    let message = `Upload failed: ${response.status}`;

    try {
      const body = await response.json();
      message = body.message || body.error || body.detail || message;
    } catch {
      // ignore JSON parse errors
    }

    throw new Error(message);
  }

  return response.json();
}
