// Tipos compartidos con el backend.
// Se documentan con JSDoc para tener autocompletado en JS.

/**
 * @typedef {'guest' | 'staff' | 'admin'} Role
 * @typedef {'available' | 'reserved' | 'occupied'} RoomStatus
 *
 * @typedef {Object} User
 * @property {number} id
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} email
 * @property {Role} role
 * @property {string | null} phone_number
 *
 * @typedef {Object} UserCreate
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} email
 * @property {string} password
 * @property {Role} [role]
 * @property {string | null} [phone_number]
 *
 * @typedef {Object} TokenResponse
 * @property {string} access_token
 * @property {string} token_type
 *
 * @typedef {Object} Room
 * @property {number} number
 * @property {RoomStatus} status
 * @property {number} type_id
 *
 * @typedef {Object} RoomType
 * @property {number} id
 * @property {string} name
 * @property {number} price
 */

export {};