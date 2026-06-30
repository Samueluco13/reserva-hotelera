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