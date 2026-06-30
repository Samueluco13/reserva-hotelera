import { apiClient } from '@/api/client';

/**
 * Devuelve las reservas del usuario en sesión.
 * Endpoint: GET /reservations/me
 * @returns {Promise<import('@/types/api').Reservation[]>}
 */
export async function getMyReservations() {
  const { data } = await apiClient.get('/reservations/me');
  return data;
}

/**
 * Devuelve todas las reservas del sistema.
 * Endpoint: GET /reservations (requiere rol staff/admin).
 * @returns {Promise<import('@/types/api').Reservation[]>}
 */
export async function getAllReservations() {
  const { data } = await apiClient.get('/reservations');
  return data;
}

/**
 * Crea una reserva a nombre del usuario en sesión.
 * Endpoint: POST /reservations (requiere rol guest).
 * @param {import('@/types/api').ReservationCreate} payload
 * @returns {Promise<import('@/types/api').Reservation>}
 */
export async function createReservationGuest(payload) {
  const { data } = await apiClient.post('/reservations', payload);
  return data;
}

/**
 * Crea una reserva a nombre de un huésped identificado por email.
 * Endpoint: POST /reservations/staff (requiere rol staff/admin).
 * @param {import('@/types/api').ReservationCreateStaff} payload
 * @returns {Promise<import('@/types/api').Reservation>}
 */
export async function createReservationStaff(payload) {
  const { data } = await apiClient.post('/reservations/staff', payload);
  return data;
}