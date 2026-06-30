import { apiClient } from '@/api/client';

/**
 * Devuelve todos los usuarios del sistema.
 * Endpoint: GET /users (requiere rol staff/admin).
 * @returns {Promise<import('@/types/api').User[]>}
 */
export async function getAllUsers() {
  const { data } = await apiClient.get('/users');
  return data;
}

/**
 * Devuelve un usuario por email.
 * Endpoint: GET /users/email/{user_email} (requiere rol staff/admin).
 * @param {string} email
 * @returns {Promise<import('@/types/api').User>}
 */
export async function getUserByEmail(email) {
  const { data } = await apiClient.get(`/users/email/${encodeURIComponent(email)}`);
  return data;
}