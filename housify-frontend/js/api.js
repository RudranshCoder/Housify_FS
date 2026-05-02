const BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? 'http://127.0.0.1:5000/api'
  : 'https://housifyfs-production.up.railway.app/api';
const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('housify_token');
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(BASE_URL + endpoint, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    const data = await res.json();

    if (res.status === 401) {
      console.log('Unauthorized access, logging out...');
      localStorage.removeItem('housify_token');
      localStorage.removeItem('housify_user');
      window.location.href = 'login.html';
      return;
    }

    if (!res.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (err) {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      console.error('API Error: Backend server is unreachable. Is it running on http://localhost:5000?');
      throw new Error('Backend server is unreachable. Please ensure the backend is running and MongoDB is connected.');
    }
    console.error('API Error:', err.message);
    throw err;
  }
}
