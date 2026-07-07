import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/Spinner';
import { createRoom, updateRoom } from '@/services/rooms';
import { getErrorMessage } from '@/lib/errors';

const STATUS_OPTIONS = [
  { value: 'available', label: 'Disponible' },
  { value: 'reserved', label: 'Reservada' },
  { value: 'occupied', label: 'Ocupada' },
];

/**
 * Modal para crear o editar una habitación.
 *
 * - `mode='create'`: envía number + type_id + status al endpoint POST.
 * - `mode='edit'`:   envía type_id y/o status al endpoint PATCH; el número
 *   es el identificador y se muestra en modo lectura.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {(room: import('@/types/api').Room) => void} [props.onSaved]
 * @param {'create' | 'edit'} props.mode
 * @param {import('@/types/api').Room | null} [props.room]
 * @param {import('@/types/api').RoomType[]} props.roomTypes
 */
export function RoomFormModal({ open, onClose, onSaved, mode, room, roomTypes }) {
  const [form, setForm] = useState({ number: '', type_id: '', status: 'available' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setForm({ number: '', type_id: '', status: 'available' });
      setErrors({});
      setSubmitError(null);
      setSubmitting(false);
      setSuccess(false);
      return undefined;
    }

    if (mode === 'edit' && room) {
      setForm({
        number: room.number != null ? String(room.number) : '',
        type_id: room.type_id != null ? String(room.type_id) : '',
        status: room.status ?? 'available',
      });
    } else {
      setForm({ number: '', type_id: '', status: 'available' });
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
  }, [open, mode, room, onClose]);

  if (!open) return null;
  if (mode === 'edit' && !room) return null;

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate() {
    const next = {};
    if (mode === 'create') {
      if (form.number === '') {
        next.number = 'El número de habitación es obligatorio.';
      } else if (!Number.isInteger(Number(form.number)) || Number(form.number) <= 0) {
        next.number = 'Número de habitación no válido.';
      }
    }
    if (!form.type_id) {
      next.type_id = 'Selecciona un tipo de habitación.';
    }
    if (!form.status) {
      next.status = 'Selecciona un estado.';
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

    const typeId = Number(form.type_id);

    try {
      let saved;
      if (mode === 'create') {
        saved = await createRoom({
          number: Number(form.number),
          type_id: typeId,
          status: form.status,
        });
      } else {
        saved = await updateRoom(room.number, {
          type_id: typeId,
          status: form.status,
        });
      }

      setSuccess(true);
      onSaved?.(saved);

      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      setSubmitError(
        getErrorMessage(
          err,
          mode === 'create'
            ? 'No fue posible crear la habitación.'
            : 'No fue posible actualizar la habitación.',
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const title = mode === 'edit' ? 'Editar habitación' : 'Nueva habitación';
  const submitLabel = mode === 'edit' ? 'Guardar cambios' : 'Crear habitación';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-form-title"
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
            <h2 id="room-form-title" className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {mode === 'edit'
                ? 'Modifica el tipo o el estado. El número no se puede cambiar.'
                : 'Asigna un número único y un tipo a la nueva habitación.'}
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
            {mode === 'create' ? '¡Habitación creada!' : '¡Habitación actualizada!'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
          <div>
            <label htmlFor="room-number" className="block text-sm font-medium text-slate-700">
              Número
            </label>
            <input
              id="room-number"
              ref={firstFieldRef}
              type="number"
              min="1"
              step="1"
              value={form.number}
              onChange={(e) => update('number', e.target.value)}
              disabled={mode === 'edit'}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              placeholder="ej. 101"
              aria-invalid={!!errors.number}
            />
            {errors.number && <p className="mt-1 text-xs text-rose-600">{errors.number}</p>}
            {mode === 'edit' && (
              <p className="mt-1 text-xs text-slate-400">
                El número es el identificador de la habitación.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="room-type" className="block text-sm font-medium text-slate-700">
              Tipo de habitación
            </label>
            <select
              id="room-type"
              value={form.type_id}
              onChange={(e) => update('type_id', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-invalid={!!errors.type_id}
            >
              <option value="">Selecciona un tipo</option>
              {roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name} — ${new Intl.NumberFormat('es-CO').format(rt.price)}
                </option>
              ))}
            </select>
            {errors.type_id && <p className="mt-1 text-xs text-rose-600">{errors.type_id}</p>}
          </div>

          <div>
            <label htmlFor="room-status" className="block text-sm font-medium text-slate-700">
              Estado
            </label>
            <select
              id="room-status"
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-invalid={!!errors.status}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.status && <p className="mt-1 text-xs text-rose-600">{errors.status}</p>}
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
              className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
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

        {!success && submitting && <Spinner label="" />}
      </div>
    </div>
  );
}
