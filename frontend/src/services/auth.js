import { apiClient, setAuthToken } from '@/api/client';

/**
 * @param {import('@/types/api').UserCreate} payload
 * @returns {Promise<import('@/types/api').User>}
 */
export async function registerUser(payload) {
  const { data } = await apiClient.post('/auth/register', payload);
  return data;
}

/**
 * El endpoint usa OAuth2PasswordRequestForm (application/x-www-form-urlencoded).
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('@/types/api').TokenResponse>}
 */
export async function loginUser(email, password) {
  const body = new URLSearchParams();
  body.append('username', email);
  body.append('password', password);

  const { data } = await apiClient.post('/auth/login', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  setAuthToken(data.access_token);
  return data;
}

/** @returns {Promise<import('@/types/api').User>} */
export async function fetchCurrentUser() {
  const { data } = await apiClient.get('/users/me');
  return data;
}

export function logout() {
  setAuthToken(null);
}