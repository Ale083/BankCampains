export const API_BASE_URL =
  (process.env.REACT_APP_API_BASE_URL || 'https://bankcampains.onrender.com').replace(/\/+$/, '');

export function apiUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function apiFetch(url, options = {}) {
  return fetch(apiUrl(url), options);
}

export async function authFetch(url, options = {}) {
  const session = JSON.parse(localStorage.getItem('session') || '{}');
  const headers = { ...(options.headers || {}), 'x-user-id': session.userId || '' };
  return apiFetch(url, { ...options, headers });
}
