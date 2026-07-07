import { useEffect, useMemo, useState } from 'react';
import { Spinner } from '@/components/Spinner';
import { RoomFormModal } from '@/components/RoomFormModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { RequireAuth } from '@/components/RequireAuth';
import { getRooms, getRoomTypes, deleteRoom } from '@/services/rooms';
import { getErrorMessage } from '@/lib/errors';

const STATUS_STYLES = {
  available: { label: 'Disponible', classes: 'bg-emerald-100 text-emerald-700' },
  reserved: { label: 'Reservada', classes: 'bg-amber-100 text-amber-700' },
  occupied: { label: 'Ocupada', classes: 'bg-rose-100 text-rose-700' },
};

function formatPrice(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

function StatusPill({ status }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.available;
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${style.classes}`}
    >
      {style.label}
    </span>
  );
}

function ActionButton({ onClick, children, variant = 'neutral' }) {
  const classes =
    variant === 'danger'
      ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
      : 'border-slate-200 text-slate-700 hover:bg-slate-100';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${classes}`}
    >
      {children}
    </button>
  );
}

function RoomsContent() {
  const [state, setState] = useState({ kind: 'loading' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [actionError, setActionError] = useState(null);

  const load = () => {
    setState({ kind: 'loading' });
    Promise.all([getRooms(), getRoomTypes()])
      .then(([rooms, roomTypes]) => {
        const typeById = new Map(roomTypes.map((rt) => [rt.id, rt]));
        const sorted = [...rooms].sort((a, b) => a.number - b.number);
        setState({ kind: 'ready', rooms: sorted, typeById });
      })
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : 'No se pudieron cargar las habitaciones.';
        setState({ kind: 'error', message });
      });
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (state.kind !== 'ready') return [];
    const term = search.trim().toLowerCase();
    return state.rooms.filter((room) => {
      if (statusFilter !== 'all' && room.status !== statusFilter) return false;
      if (!term) return true;
      const type = state.typeById.get(room.type_id);
      const typeName = type?.name?.toLowerCase() ?? '';
      return String(room.number).includes(term) || typeName.includes(term);
    });
  }, [state, search, statusFilter]);

  const roomTypesList = state.kind === 'ready' ? Array.from(state.typeById.values()) : [];

  async function handleConfirmDelete() {
    if (!deleting) return;
    const number = deleting.number;
    setDeleting(null);
    setActionError(null);
    try {
      await deleteRoom(number);
      load();
    } catch (err) {
      setActionError(
        getErrorMessage(err, 'No fue posible eliminar la habitación.'),
      );
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Habitaciones</h1>
          <p className="mt-2 text-slate-600">
            Inventario de habitaciones del hotel. Crea, edita o elimina habitaciones individuales.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="self-start rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Nueva habitación
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

      {state.kind === 'ready' && (
        <div className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_180px]">
          <div>
            <label htmlFor="room-search" className="block text-xs font-medium text-slate-500">
              Buscar por número o tipo
            </label>
            <input
              id="room-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ej. 101 o Suite"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label htmlFor="room-status-filter" className="block text-xs font-medium text-slate-500">
              Estado
            </label>
            <select
              id="room-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">Todos</option>
              <option value="available">Disponibles</option>
              <option value="reserved">Reservadas</option>
              <option value="occupied">Ocupadas</option>
            </select>
          </div>
        </div>
      )}

      {state.kind === 'loading' && <Spinner label="Cargando habitaciones…" />}

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

      {state.kind === 'ready' && state.rooms.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500">
          Aún no hay habitaciones registradas. Crea la primera con el botón "Nueva habitación".
        </div>
      )}

      {state.kind === 'ready' && state.rooms.length > 0 && filtered.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500">
          Ninguna habitación coincide con los filtros actuales.
        </div>
      )}

      {state.kind === 'ready' && filtered.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[100px_1fr_140px_140px_220px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
            <span>Hab.</span>
            <span>Tipo</span>
            <span>Precio / noche</span>
            <span>Estado</span>
            <span className="text-right">Acciones</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {filtered.map((room) => {
              const type = state.typeById.get(room.type_id);
              return (
                <li
                  key={room.number}
                  className="grid grid-cols-1 gap-2 px-4 py-3 text-sm md:grid-cols-[100px_1fr_140px_140px_220px] md:items-center md:gap-3"
                >
                  <div>
                    <span className="text-xs uppercase text-slate-400 md:hidden">Habitación</span>
                    <p className="font-medium text-slate-800">#{room.number}</p>
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs uppercase text-slate-400 md:hidden">Tipo</span>
                    <p className="text-slate-700">{type?.name ?? `Tipo #${room.type_id}`}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-slate-400 md:hidden">Precio / noche</span>
                    <p className="text-slate-700">{type ? formatPrice(type.price) : '—'}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-slate-400 md:hidden">Estado</span>
                    <StatusPill status={room.status} />
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <ActionButton onClick={() => setEditing(room)}>Editar</ActionButton>
                    <ActionButton onClick={() => setDeleting(room)} variant="danger">
                      Eliminar
                    </ActionButton>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <RoomFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={load}
        mode="create"
        roomTypes={roomTypesList}
      />

      <RoomFormModal
        open={!!editing}
        room={editing}
        onClose={() => setEditing(null)}
        onSaved={load}
        mode="edit"
        roomTypes={roomTypesList}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar habitación"
        message={
          deleting
            ? `¿Eliminar la habitación #${deleting.number}? Si tiene reservas asociadas la operación podría fallar.`
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

export function RoomsPage() {
  return (
    <RequireAuth roles={['staff', 'admin']}>
      <RoomsContent />
    </RequireAuth>
  );
}
