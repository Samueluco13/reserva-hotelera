import { apiClient } from '@/api/client';

/** @returns {Promise<import('@/types/api').Room[]>} */
export async function getRooms() {
  const { data } = await apiClient.get('/rooms');
  return data;
}

/** @returns {Promise<import('@/types/api').RoomType[]>} */
export async function getRoomTypes() {
  const { data } = await apiClient.get('/room_types');
  return data;
}

/**
 * Crea un nuevo tipo de habitación.
 * Endpoint: POST /room_types (requiere rol staff/admin).
 * @param {import('@/types/api').RoomTypeCreate} payload
 * @returns {Promise<import('@/types/api').RoomType>}
 */
export async function createRoomType(payload) {
  const { data } = await apiClient.post('/room_types', payload);
  return data;
}

/**
 * Actualiza un tipo de habitación existente (identificado por su nombre).
 * Endpoint: PATCH /room_types/{room_type_name} (requiere rol staff/admin).
 * @param {string} name
 * @param {import('@/types/api').RoomTypeUpdate} payload
 * @returns {Promise<import('@/types/api').RoomType>}
 */
export async function updateRoomType(name, payload) {
  const { data } = await apiClient.patch(`/room_types/${encodeURIComponent(name)}`, payload);
  return data;
}

/**
 * Elimina un tipo de habitación por nombre.
 * Endpoint: DELETE /room_types/{room_type_name} (requiere rol staff/admin).
 * @param {string} name
 * @returns {Promise<{ message: string }>}
 */
export async function deleteRoomType(name) {
  const { data } = await apiClient.delete(`/room_types/${encodeURIComponent(name)}`);
  return data;
}