// every request to OUR server goes through this one function
const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(API_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // adds the header only if there is a token
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (res.status === 401) {
    window.dispatchEvent(new Event('auth:expired')); // AuthContext hears this and logs out
  }
  if (!res.ok) throw new Error((await res.json()).error); // the server's message
  return res.status === 204 ? null : res.json(); // 204 has no body, so nothing to read
}
