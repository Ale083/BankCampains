import { apiFetch } from '../api/client';

export async function login(email, password) {
  try {
    const params = new URLSearchParams({ email, password });
    return await apiFetch(`/api/auth/login?${params}`).then(r => r.json());
  } catch (error) {
    console.error("Error logging in: ", error);
    throw error;
  }
}

export async function register(nombre, email, password, rol) {
  try {
    return await apiFetch('/api/auth/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ nombre, email, password, rol }),
    }).then(r => r.json());
  } catch (error) {
    console.error("Error registering: ", error);
    throw error;
  }
}
