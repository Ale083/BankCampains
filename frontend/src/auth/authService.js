const URL_BASE = process.env.URL_BASE || "http://localhost:3001";

export async function login(email, password) {
  try {
    return await fetch(`${URL_BASE}/api/auth/login?email=${email}&password=${password}`).then(r => r.json());
  } catch (error) {
    console.error("Error logging in: ", error);
    throw error;
  }
}