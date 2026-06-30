import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Spinner } from '@/components/Spinner';
import {
  createReservationGuest,
  createReservationStaff,
} from '@/services/reservations';
import { useAuth } from '@/context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Convierte un valor `datetime-local` (`YYYY-MM-DDTHH:mm`) a ISO 8601 UTC.
 * Devuelve `null` si el valor está vacío.
 * @param {string} value
 * @returns {string | null}
 */
function toIso(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

/**
 * Devuelve un mensaje legible a partir de una respuesta de error de Axios,
 * replicando el patrón usado en LoginPage/RegisterPage.
 * @param {unknown} err
 * @param {string} fallback
 */
function getErrorMessage(err, fallback) {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data;
    if (typeof detail?.detail === 'string') return detail.detail;
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

/**
 * Modal reutilizable para crear reservas en sus dos variantes:
 * - `mode='guest'`  → usa el `user_id` del contexto de autenticación.
 * - `mode='staff'`  → pide el `user_email` del huésped (sólo staff/admin).
 *
 * El padre provee las habitaciones y tipos para evitar dobles fetch.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {(reservation: import('@/types/api').Reservation) => void} [props.onCreated]
 * @param {'guest' | 'staff'} props.mode
 * @param {import('@/types/api').Room[]} props.rooms
 * @param {import('@/types/api').RoomType[]} props.roomTypes
 * @param {number} [props.defaultRoomNumber]
 */
export function ReservationFormModal({
  open,
  onClose,
  onCreated,
  mode = 'guest',
  rooms,
  roomTypes,
  defaultRoomNumber,
}) {
  const { user } = useAuth();

  const initialForm = {
    room_number: defaultRoomNumber ?? '',
    checkin_date: '',
    checkout_date: '',
    user_email: '',
  };
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const firstFieldRef = useRef(null);

  // Reset al abrir/cerrar y enfocar el primer campo al abrir.
  useEffect(() => {
    if (!open) {
      setForm({ ...initialForm, room_number: defaultRoomNumber ?? '' });
      setErrors({});
      setSubmitError(null);
      setSubmitting(false);
      setSuccess(false);
      return undefined;
    }

    setForm({ ...initialForm, room_number: defaultRoomNumber ?? '' });
    setErrors({});
    setSubmitError(null);
    setSubmitting(false);
    setSuccess(false);

    firstFieldRef.current?.focus();

    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultRoomNumber]);

  if (!open) return null;

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate() {
    const next = {};
    if (!form.room_number) next.room_number = 'Selecciona una habitación.';
    if (!form.checkin_date) next.checkin_date = 'La fecha de check-in es obligatoria.';
    if (!form.checkout_date) next.checkout_date = 'La fecha de check-out es obligatoria.';
    if (form.checkin_date && form.checkout_date) {
      const checkin = new Date(form.checkin_date);
      const checkout = new Date(form.checkout_date);
      if (Number.isNaN(checkin.getTime()) || Number.isNaN(checkout.getTime())) {
        next.checkin_date = 'Fecha no válida.';
      } else if (checkin >= checkout) {
        next.checkout_date = 'El check-out debe ser posterior al check-in.';
      }
    }
    if (mode === 'staff') {
      if (!form.user_email.trim()) next.user_email = 'El email del huésped es obligatorio.';
      else if (!EMAIL_REGEX.test(form.user_email.trim())) next.user_email = 'Email no válido.';
    }
    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitError(null);
    setSubmitting(true);

    const checkinISO = form.checkin_date;
    const checkoutISO = form.checkout_date;
    const roomNumber = Number(form.room_number);

    try {
      let created;
      if (mode === 'staff') {
        created = await createReservationStaff({
          room_number: roomNumber,
          user_email: form.user_email.trim(),
          checkin_date: checkinISO,
          checkout_date: checkoutISO,
        });
      } else {
        if (!user?.id) {
          throw new Error('No se pudo identificar al usuario en sesión.');
        }
        created = await createReservationGuest({
          room_number: roomNumber,
          user_id: user.id,
          checkin_date: checkinISO,
          checkout_date: checkoutISO,
        });
      }

      setSuccess(true);
      onCreated?.(created);

      // Breve confirmación antes de cerrar.
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      setSubmitError(
        getErrorMessage(err, 'No fue posible crear la reserva. Inténtalo de nuevo.'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const title = mode === 'staff' ? 'Crear reserva (staff)' : 'Nueva reserva';
  const submitLabel = mode === 'staff' ? 'Reservar para el huésped' : 'Confirmar reserva';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reservation-form-title"
    >
      <button
        type="button"
        aria-label="Cerrar diálogo"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-900/40 backdrop-blur-md"
      />

      <div className="pointer-events-auto relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 animate-[popIn_180ms_ease-out]">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h2 id="reservation-form-title" className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Selecciona la habitación y las fechas de tu estadía.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {success && (
          <div
            role="status"
            className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
          >
            ¡Reserva creada con éxito!
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
          {mode === 'staff' && (
            <div>
              <label htmlFor="user_email" className="block text-sm font-medium text-slate-700">
                Email del huésped
              </label>
              <input
                id="user_email"
                ref={firstFieldRef}
                type="email"
                value={form.user_email}
                onChange={(e) => update('user_email', e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                aria-invalid={!!errors.user_email}
              />
              {errors.user_email && (
                <p className="mt-1 text-xs text-rose-600">{errors.user_email}</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="room_number" className="block text-sm font-medium text-slate-700">
              Habitación
            </label>
            <select
              id="room_number"
              ref={mode === 'guest' ? firstFieldRef : undefined}
              value={form.room_number}
              onChange={(e) => update('room_number', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-invalid={!!errors.room_number}
            >
              <option value="">Selecciona una habitación</option>
              {rooms.map((room) => {
                const type = roomTypes.find((rt) => rt.id === room.type_id);
                return (
                  <option key={room.number} value={room.number}>
                    #{room.number} — {type?.name ?? `Tipo ${room.type_id}`}
                    {type ? ` ($${type.price})` : ''}
                  </option>
                );
              })}
            </select>
            {errors.room_number && (
              <p className="mt-1 text-xs text-rose-600">{errors.room_number}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="checkin_date" className="block text-sm font-medium text-slate-700">
                Check-in
              </label>
              <input
                id="checkin_date"
                type="datetime-local"
                value={form.checkin_date}
                onChange={(e) => update('checkin_date', e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                aria-invalid={!!errors.checkin_date}
              />
              {errors.checkin_date && (
                <p className="mt-1 text-xs text-rose-600">{errors.checkin_date}</p>
              )}
            </div>

            <div>
              <label htmlFor="checkout_date" className="block text-sm font-medium text-slate-700">
                Check-out
              </label>
              <input
                id="checkout_date"
                type="datetime-local"
                value={form.checkout_date}
                onChange={(e) => update('checkout_date', e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                aria-invalid={!!errors.checkout_date}
              />
              {errors.checkout_date && (
                <p className="mt-1 text-xs text-rose-600">{errors.checkout_date}</p>
              )}
            </div>
          </div>

          {submitError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || success}
              className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {submitting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                  <span>Enviando…</span>
                </>
              ) : (
                submitLabel
              )}
            </button>
          </div>
        </form>

        {/* Spinner accesible para usuarios que necesiten pista visual al cargar el modal */}
        {!success && submitting && <Spinner label="" />}
      </div>
    </div>
  );
}