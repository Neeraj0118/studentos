const API_BASE = 'https://studentos-3yfg.onrender.com/api';

export const getAuthToken = () => localStorage.getItem('studentos_token');
export const setAuthToken = (token) => localStorage.setItem('studentos_token', token);
export const removeAuthToken = () => localStorage.removeItem('studentos_token');

export const fetchApi = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Token invalid or expired
      removeAuthToken();
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data;
};
