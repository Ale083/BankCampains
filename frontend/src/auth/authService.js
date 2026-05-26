const URL_BASE = process.env.URL_BASE || "https://bankcampains.onrender.com";

export async function login(email, password) {
  try {
    return await fetch(`${URL_BASE}/api/auth/login?email=${email}&password=${password}`).then(r => r.json());
  } catch (error) {
    console.error("Error logging in: ", error);
    throw error;
  }
}

export async function register(nombre, email, password, rol) {
  try {
    return await fetch(`${URL_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ nombre, email, password, rol }),
    }).then(r => r.json());
  } catch (error) {
    console.error("Error registering: ", error);
    throw error;
  }
}