export async function authFetch(url, options = {}) {
  const session = JSON.parse(localStorage.getItem('session') || '{}');
  const headers = { ...(options.headers || {}), 'x-user-id': session.userId || '' };
  return fetch(url, { ...options, headers });
}
