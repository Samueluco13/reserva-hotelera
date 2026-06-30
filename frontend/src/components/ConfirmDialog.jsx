import { useEffect, useRef } from 'react';

/**
 * Diálogo de confirmación accesible y reutilizable.
 * Se muestra como popup centrado con backdrop borroso.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {string} props.title
 * @param {string} props.message
 * @param {string} [props.confirmLabel='Confirmar']
 * @param {string} [props.cancelLabel='Cancelar']
 * @param {'danger' | 'primary'} [props.variant='primary']
 * @param {() => void} props.onConfirm
 * @param {() => void} props.onCancel
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'primary',
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    // Foco al botón principal al abrir.
    confirmRef.current?.focus();

    // Cerrar con Escape.
    function onKeyDown(e) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', onKeyDown);

    // Evitar scroll del body mientras el modal está abierto.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onCancel]);

  if (!open) return null;

  const confirmClasses =
    variant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500'
      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      {/* Backdrop borroso + botón invisible para captar clicks de cierre. */}
      <button
        type="button"
        aria-label="Cerrar diálogo"
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-slate-900/40 backdrop-blur-md"
      />

      {/* Tarjeta centrada con animación de entrada. */}
      <div className="pointer-events-auto relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 animate-[popIn_180ms_ease-out]">
        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <p id="confirm-dialog-message" className="mt-2 text-sm leading-relaxed text-slate-600">
          {message}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`rounded-md px-3 py-2 text-sm font-medium text-white shadow-sm transition focus:outline-none focus:ring-2 ${confirmClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}