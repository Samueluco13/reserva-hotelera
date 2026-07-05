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

/**
 * Edita fechas y/o habitación de una reserva.
 * Endpoint: PATCH /reservations/{id}.
 * El backend requiere que el payload incluya `user_id`, así que se reenvía
 * el titular actual de la reserva.
 * @param {number} reservationId
 * @param {import('@/types/api').ReservationUpdate} payload
 * @returns {Promise<import('@/types/api').Reservation>}
 */
export async function updateReservationDates(reservationId, payload) {
  const { data } = await apiClient.patch(`/reservations/${reservationId}`, payload);
  return data;
}

/**
 * Cambia el estado de una reserva (active/cancelled/completed).
 * Endpoint: PATCH /reservations/{id}/status (requiere rol staff/admin).
 * @param {number} reservationId
 * @param {import('@/types/api').ReservationStatus} status
 * @returns {Promise<import('@/types/api').Reservation>}
 */
export async function updateReservationStatus(reservationId, status) {
  const { data } = await apiClient.patch(`/reservations/${reservationId}/status`, {
    status,
  });
  return data;
}

/**
 * Cambia el titular de una reserva por email.
 * Endpoint: PATCH /reservations/{id}/holder (requiere rol staff/admin).
 * @param {number} reservationId
 * @param {string} newEmail
 * @returns {Promise<import('@/types/api').Reservation>}
 */
export async function updateReservationHolder(reservationId, newEmail) {
  const { data } = await apiClient.patch(`/reservations/${reservationId}/holder`, {
    new_email: newEmail,
  });
  return data;
}

/**
 * Elimina una reserva.
 * Endpoint: DELETE /reservations/{id} (requiere rol staff/admin).
 * @param {number} reservationId
 * @returns {Promise<{ message: string }>}
 */
export async function deleteReservation(reservationId) {
  const { data } = await apiClient.delete(`/reservations/${reservationId}`);
  return data;
}