import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/Spinner';
import { updateReservationDates } from '@/services/reservations';
import { getErrorMessage } from '@/lib/errors';

/**
 * Convierte una fecha ISO del backend a `YYYY-MM-DDTHH:mm` para
 * `datetime-local`. Devuelve cadena vacía si el valor es inválido.
 * @param {string | null | undefined} iso
 * @returns {string}
 */
function isoToLocalInput(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  // slice hasta los minutos (formato `datetime-local`).
  return date.toISOString().slice(0, 16);
}

/**
 * Modal para editar fechas y habitación de una reserva existente.
 * Reusa el `user_id` actual porque el backend lo exige en el PATCH.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {(reservation: import('@/types/api').Reservation) => void} [props.onUpdated]
 * @param {import('@/types/api').Reservation | null} props.reservation
 * @param {import('@/types/api').Room[]} props.rooms
 * @param {import('@/types/api').RoomType[]} props.roomTypes
 */
export function EditReservationModal({
  open,
  onClose,
  onUpdated,
  reservation,
  rooms,
  roomTypes,
}) {
  const [form, setForm] = useState({
    room_number: '',
    checkin_date: '',
    checkout_date: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const firstFieldRef = useRef(null);

  // Reset / prefill al cambiar la reserva objetivo o abrir el modal.
  useEffect(() => {
    if (!open) {
      setForm({ room_number: '', checkin_date: '', checkout_date: '' });
      setErrors({});
      setSubmitError(null);
      setSubmitting(false);
      setSuccess(false);
      return undefined;
    }

    if (reservation) {
      setForm({
        room_number: reservation.room_number ?? '',
        checkin_date: isoToLocalInput(reservation.checkin_date),
        checkout_date: isoToLocalInput(reservation.checkout_date),
      });
    } else {
      setForm({ room_number: '', checkin_date: '', checkout_date: '' });
    }
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
  }, [open, reservation, onClose]);

  if (!open || !reservation) return null;

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
    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitError(null);
    setSubmitting(true);

    try {
      const updated = await updateReservationDates(reservation.id, {
        room_number: Number(form.room_number),
        checkin_date: form.checkin_date,
        checkout_date: form.checkout_date,
        // El backend exige el titular actual.
        user_id: reservation.user_id,
      });

      setSuccess(true);
      onUpdated?.(updated);

      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      setSubmitError(
        getErrorMessage(err, 'No fue posible actualizar la reserva. Inténtalo de nuevo.'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-reservation-title"
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
            <h2 id="edit-reservation-title" className="text-lg font-semibold text-slate-900">
              Editar reserva
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Actualiza las fechas o la habitación. El titular no se modifica aquí.
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
            ¡Reserva actualizada con éxito!
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
          <div>
            <label htmlFor="edit-room_number" className="block text-sm font-medium text-slate-700">
              Habitación
            </label>
            <select
              id="edit-room_number"
              ref={firstFieldRef}
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
              <label htmlFor="edit-checkin_date" className="block text-sm font-medium text-slate-700">
                Check-in
              </label>
              <input
                id="edit-checkin_date"
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
              <label htmlFor="edit-checkout_date" className="block text-sm font-medium text-slate-700">
                Check-out
              </label>
              <input
                id="edit-checkout_date"
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
                  <span>Guardando…</span>
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </form>

        {!success && submitting && <Spinner label="" />}
      </div>
    </div>
  );
}
