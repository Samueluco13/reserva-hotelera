import { useEffect, useState } from 'react';
import { Spinner } from '@/components/Spinner';
import { RoomTypeFormModal } from '@/components/RoomTypeFormModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { RequireAuth } from '@/components/RequireAuth';
import { getRoomTypes, deleteRoomType } from '@/services/rooms';
import { getErrorMessage } from '@/lib/errors';

function formatPrice(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

function RoomTypesContent() {
  const [state, setState] = useState({ kind: 'loading' });
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [actionError, setActionError] = useState(null);

  const load = () => {
    setState({ kind: 'loading' });
    getRoomTypes()
      .then((roomTypes) => {
        const sorted = [...roomTypes].sort((a, b) => a.name.localeCompare(b.name));
        setState({ kind: 'ready', roomTypes: sorted });
      })
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : 'No se pudieron cargar los tipos de habitación.';
        setState({ kind: 'error', message });
      });
  };

  useEffect(() => {
    load();
  }, []);

  async function handleConfirmDelete() {
    if (!deleting) return;
    const name = deleting.name;
    setDeleting(null);
    setActionError(null);
    try {
      await deleteRoomType(name);
      load();
    } catch (err) {
      setActionError(
        getErrorMessage(err, 'No fue posible eliminar el tipo de habitación.'),
      );
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Tipos de habitación</h1>
          <p className="mt-2 text-slate-600">
            Crea y administra las categorías de habitación y su precio por noche.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="self-start rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Nuevo tipo
        </button>
      </section>

      {actionError && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {actionError}
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="ml-3 text-rose-700 underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {state.kind === 'loading' && <Spinner label="Cargando tipos de habitación…" />}

      {state.kind === 'error' && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <p className="font-medium">Algo salió mal</p>
          <p className="mt-1 text-sm">{state.message}</p>
          <button
            type="button"
            onClick={load}
            className="mt-4 rounded-md bg-rose-600 px-3 py-1.5 text-sm text-white transition hover:bg-rose-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {state.kind === 'ready' && state.roomTypes.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500">
          Aún no hay tipos de habitación. Crea el primero con el botón "Nuevo tipo".
        </div>
      )}

      {state.kind === 'ready' && state.roomTypes.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[1fr_180px_180px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
            <span>Nombre</span>
            <span>Precio / noche</span>
            <span className="text-right">Acciones</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {state.roomTypes.map((rt) => (
              <li
                key={rt.id}
                className="grid grid-cols-1 gap-2 px-4 py-3 text-sm md:grid-cols-[1fr_180px_180px] md:items-center md:gap-3"
              >
                <div className="min-w-0">
                  <span className="text-xs uppercase text-slate-400 md:hidden">Nombre</span>
                  <p className="font-medium text-slate-800">{rt.name}</p>
                </div>
                <div>
                  <span className="text-xs uppercase text-slate-400 md:hidden">Precio / noche</span>
                  <p className="text-slate-700">{formatPrice(rt.price)}</p>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(rt)}
                    className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Editar precio
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(rt)}
                    className="rounded-md border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <RoomTypeFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={load}
        mode="create"
      />

      <RoomTypeFormModal
        open={!!editing}
        roomType={editing}
        onClose={() => setEditing(null)}
        onSaved={load}
        mode="edit"
      />

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar tipo de habitación"
        message={
          deleting
            ? `¿Eliminar el tipo "${deleting.name}"? Si hay habitaciones asociadas la operación podría fallar.`
            : ''
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </main>
  );
}

export function RoomTypesPage() {
  return (
    <RequireAuth roles={['staff', 'admin']}>
      <RoomTypesContent />
    </RequireAuth>
  );
}
