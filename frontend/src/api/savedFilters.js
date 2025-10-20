import { authFetch } from './client';

export async function listSavedFilters() {
  const r = await authFetch('/api/saved-filters');
  return r.json();
}

export async function createSavedFilter({ name, filter }) {
  const r = await authFetch('/api/saved-filters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, filter })
  });
  return r.json();
}

export async function updateSavedFilter(id, { name, filter }) {
  const r = await authFetch(`/api/saved-filters/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, filter })
  });
  return r.json();
}

export async function deleteSavedFilter(id) {
  const r = await authFetch(`/api/saved-filters/${id}`, { method: 'DELETE' });
  return r.json();
}
