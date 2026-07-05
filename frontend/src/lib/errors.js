import axios from 'axios';

/** Regex básico de email. Suficiente para validación de UI. */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Devuelve un mensaje legible a partir de una respuesta de error de Axios.
 * Cubre los códigos más comunes de la API del backend.
 *
 * @param {unknown} err
 * @param {string} fallback Mensaje por defecto si no se puede extraer uno.
 * @returns {string}
 */
export function getErrorMessage(err, fallback) {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data;
    if (typeof detail?.detail === 'string') return detail.detail;
    if (typeof detail?.message === 'string') return detail.message;
    if (Array.isArray(detail?.detail) && detail.detail[0]?.msg) {
      return detail.detail[0].msg;
    }
    if (err.response?.status === 401) return 'Sesión expirada. Inicia sesión de nuevo.';
    if (err.response?.status === 403) return 'No tienes permisos para realizar esta acción.';
    if (err.response?.status === 404) return 'Recurso no encontrado.';
    if (err.response?.status === 409) return 'Conflicto con los datos enviados.';
  }
  return fallback;
}
