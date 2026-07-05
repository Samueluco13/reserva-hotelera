// Tipos compartidos con el backend.
// Se documentan con JSDoc para tener autocompletado en JS.

/**
 * @typedef {'guest' | 'staff' | 'admin'} Role
 * @typedef {'available' | 'reserved' | 'occupied'} RoomStatus
 * @typedef {'active' | 'cancelled' | 'completed'} ReservationStatus
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
 *
 * @typedef {Object} Reservation
 * @property {number} id
 * @property {string} created_at
 * @property {string | null} last_edit
 * @property {string | null} checkin_date
 * @property {string | null} checkout_date
 * @property {ReservationStatus} status
 * @property {number} room_number
 * @property {number} user_id
 *
 * @typedef {Object} ReservationCreate
 * @property {number} room_number
 * @property {string | null} [checkin_date]
 * @property {string | null} [checkout_date]
 * @property {number} user_id
 *
 * @typedef {Object} ReservationCreateStaff
 * @property {number} room_number
 * @property {string} user_email
 * @property {string | null} [checkin_date]
 * @property {string | null} [checkout_date]
 *
 * @typedef {Object} ReservationUpdate
 * @property {string | null} [checkin_date]
 * @property {string | null} [checkout_date]
 * @property {number} [room_number]
 * @property {number} user_id  Requerido por el backend en PATCH.
 *
 * @typedef {Object} ReservationUpdateStatus
 * @property {ReservationStatus} status
 *
 * @typedef {Object} ReservationUpdateHolder
 * @property {string} new_email
 */

export {};