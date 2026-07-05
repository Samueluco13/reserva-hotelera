import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/Spinner';
import { createRoomType, updateRoomType } from '@/services/rooms';
import { getErrorMessage } from '@/lib/errors';

/**
 * Modal para crear o editar un tipo de habitación.
 *
 * - `mode='create'`: envía name + price al endpoint POST.
 * - `mode='edit'`:   envía sólo price al endpoint PATCH (que es lo que
 *   acepta el backend actualmente); `name` se muestra en modo lectura.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {(roomType: import('@/types/api').RoomType) => void} [props.onSaved]
 * @param {'create' | 'edit'} props.mode
 * @param {import('@/types/api').RoomType | null} [props.roomType]
 */
export function RoomTypeFormModal({ open, onClose, onSaved, mode, roomType }) {
  const [form, setForm] = useState({ name: '', price: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setForm({ name: '', price: '' });
      setErrors({});
      setSubmitError(null);
      setSubmitting(false);
      setSuccess(false);
      return undefined;
    }

    if (mode === 'edit' && roomType) {
      setForm({ name: roomType.name ?? '', price: roomType.price != null ? String(roomType.price) : '' });
    } else {
      setForm({ name: '', price: '' });
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
  }, [open, mode, roomType, onClose]);

  if (!open) return null;
  if (mode === 'edit' && !roomType) return null;

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate() {
    const next = {};
    if (mode === 'create') {
      if (!form.name.trim()) next.name = 'El nombre es obligatorio.';
    }
    if (form.price === '' || form.price === null) {
      next.price = 'El precio es obligatorio.';
    } else {
      const price = Number(form.price);
      if (Number.isNaN(price)) {
        next.price = 'Precio no válido.';
      } else if (price < 0) {
        next.price = 'El precio no puede ser negativo.';
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

    const price = Number(form.price);

    try {
      let saved;
      if (mode === 'create') {
        saved = await createRoomType({ name: form.name.trim(), price });
      } else {
        saved = await updateRoomType(roomType.name, { price });
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
            ? 'No fue posible crear el tipo de habitación.'
            : 'No fue posible actualizar el tipo de habitación.',
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const title = mode === 'edit' ? 'Editar tipo de habitación' : 'Nuevo tipo de habitación';
  const submitLabel = mode === 'edit' ? 'Guardar cambios' : 'Crear tipo';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-type-form-title"
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
            <h2 id="room-type-form-title" className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {mode === 'edit'
                ? 'El identificador no se puede modificar; sólo el precio por noche.'
                : 'Define un nombre único y un precio por noche para las habitaciones de este tipo.'}
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
            {mode === 'create' ? '¡Tipo de habitación creado!' : '¡Precio actualizado!'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
          <div>
            <label htmlFor="rt-name" className="block text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              id="rt-name"
              ref={firstFieldRef}
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              disabled={mode === 'edit'}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              placeholder="ej. Suite, Standard, Familiar…"
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
            {mode === 'edit' && (
              <p className="mt-1 text-xs text-slate-400">El nombre es el identificador del tipo.</p>
            )}
          </div>

          <div>
            <label htmlFor="rt-price" className="block text-sm font-medium text-slate-700">
              Precio por noche (COP)
            </label>
            <input
              id="rt-price"
              type="number"
              min="0"
              step="1000"
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="ej. 180000"
              aria-invalid={!!errors.price}
            />
            {errors.price && <p className="mt-1 text-xs text-rose-600">{errors.price}</p>}
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
