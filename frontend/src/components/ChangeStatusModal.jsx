import { useEffect, useRef, useState } from 'react';
import { updateReservationStatus } from '@/services/reservations';
import { getErrorMessage } from '@/lib/errors';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activa' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'completed', label: 'Completada' },
];

/**
 * Modal para cambiar el estado de una reserva.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {(reservation: import('@/types/api').Reservation) => void} [props.onChanged]
 * @param {import('@/types/api').Reservation | null} props.reservation
 * @param {import('@/types/api').ReservationStatus[]} [props.allowedStatuses]
 *   Estados permitidos. Por defecto los 3.
 */
export function ChangeStatusModal({
  open,
  onClose,
  onChanged,
  reservation,
  allowedStatuses,
}) {
  const initial = reservation?.status ?? 'active';
  const allowed = allowedStatuses ?? STATUS_OPTIONS.map((s) => s.value);

  const [status, setStatus] = useState(initial);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setStatus('active');
      setError(null);
      setSubmitting(false);
      setSuccess(false);
      return undefined;
    }

    setStatus(reservation?.status ?? 'active');
    setError(null);
    setSubmitting(false);
    setSuccess(false);

    selectRef.current?.focus();

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

  const options = STATUS_OPTIONS.filter((opt) => allowed.includes(opt.value));

  async function handleSubmit(event) {
    event.preventDefault();
    if (status === reservation.status) {
      setError(`La reserva ya está en estado "${status}".`);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const updated = await updateReservationStatus(reservation.id, status);
      setSuccess(true);
      onChanged?.(updated);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      setError(getErrorMessage(err, 'No fue posible cambiar el estado. Inténtalo de nuevo.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-status-title"
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
            <h2 id="change-status-title" className="text-lg font-semibold text-slate-900">
              Cambiar estado
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Reserva #{reservation.id}. El nuevo estado se notificará al titular.
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
            ¡Estado actualizado con éxito!
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
          <div>
            <label htmlFor="new_status" className="block text-sm font-medium text-slate-700">
              Nuevo estado
            </label>
            <select
              id="new_status"
              ref={selectRef}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-invalid={!!error}
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
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
              className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {submitting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                  <span>Guardando…</span>
                </>
              ) : (
                'Guardar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
