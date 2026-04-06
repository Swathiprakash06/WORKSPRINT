// API utility for making authenticated requests
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const normalizeApiBaseUrl = (raw) => {
  if (!raw) return 'http://localhost:3000';

  let url = raw;
  while (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  if (url.endsWith('/api/v1')) {
    url = url.slice(0, -'/api/v1'.length);
  }

  return url;
};

export const API_BASE_URL = normalizeApiBaseUrl(rawApiBaseUrl);

const logoutAndRedirect = () => {
  sessionStorage.clear();
  localStorage.removeItem('rememberMe');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userPassword');
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

export const logoutApi = async () => {
  const refreshToken = sessionStorage.getItem('refreshToken');
  if (!refreshToken) return;

  await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
};

const refreshAuthToken = async () => {
  const refreshToken = sessionStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token available');

  const refreshRes = await fetch(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!refreshRes.ok) {
    throw new Error('Refresh token failed');
  }

  const refreshData = await refreshRes.json();

  sessionStorage.setItem('token', refreshData.accessToken);
  if (refreshData.refreshToken) {
    sessionStorage.setItem('refreshToken', refreshData.refreshToken);
  }

  return refreshData.accessToken;
};

export const apiCall = async (endpoint, options = {}) => {
  let token = sessionStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const makeRequest = async () => fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

  try {
    let response = await makeRequest();

    if (response.status === 401) {
      console.warn('API 401 received, attempting token refresh for', endpoint);
      try {
        const newToken = await refreshAuthToken();
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await makeRequest();
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        logoutAndRedirect();
        const err = new Error('Unauthorized');
        err.status = 401;
        throw err;
      }
    }

    if (response.status === 401) {
      logoutAndRedirect();
      const err = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    if (response.status === 429) {
      console.warn('API rate limit reached for', endpoint);
      const errorBody = await response.text();
      const err = new Error('Too Many Requests');
      err.status = 429;
      err.body = errorBody;
      throw err;
    }

    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * GET request helper
 */
export const apiGet = (endpoint) => {
  return apiCall(endpoint, { method: 'GET' });
};

/**
 * POST request helper
 */
export const apiPost = (endpoint, data) => {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * PUT request helper
 */
export const apiPut = (endpoint, data) => {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request helper
 */
export const apiDelete = (endpoint) => {
  return apiCall(endpoint, { method: 'DELETE' });
};
