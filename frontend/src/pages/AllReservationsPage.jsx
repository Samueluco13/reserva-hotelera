import { useEffect, useMemo, useState } from 'react';
import { Spinner } from '@/components/Spinner';
import { ReservationFormModal } from '@/components/ReservationFormModal';
import { EditReservationModal } from '@/components/EditReservationModal';
import { ChangeHolderModal } from '@/components/ChangeHolderModal';
import { ChangeStatusModal } from '@/components/ChangeStatusModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { RequireAuth } from '@/components/RequireAuth';
import {
  getAllReservations,
  deleteReservation,
} from '@/services/reservations';
import { getRooms, getRoomTypes } from '@/services/rooms';
import { getAllUsers } from '@/services/users';
import { getErrorMessage } from '@/lib/errors';

const STATUS_STYLES = {
  active: { label: 'Activa', classes: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelada', classes: 'bg-slate-200 text-slate-700' },
  completed: { label: 'Completada', classes: 'bg-blue-100 text-blue-700' },
};

const DATE_FORMAT = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return DATE_FORMAT.format(date);
}

function StatusPill({ status }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.active;
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${style.classes}`}>
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

function AllReservationsContent() {
  const [state, setState] = useState({ kind: 'loading' });
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [editing, setEditing] = useState(null);
  const [holderTarget, setHolderTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [actionError, setActionError] = useState(null);

  const load = () => {
    setState({ kind: 'loading' });
    Promise.all([getAllReservations(), getRooms(), getRoomTypes(), getAllUsers()])
      .then(([reservations, rooms, roomTypes, users]) => {
        const roomByNumber = new Map(rooms.map((r) => [r.number, r]));
        const typeById = new Map(roomTypes.map((rt) => [rt.id, rt]));
        const userById = new Map(users.map((u) => [u.id, u]));
        setState({
          kind: 'ready',
          reservations,
          roomByNumber,
          typeById,
          userById,
        });
      })
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : 'No se pudieron cargar las reservas.';
        setState({ kind: 'error', message });
      });
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (state.kind !== 'ready') return [];
    const term = search.trim().toLowerCase();
    return state.reservations.filter((res) => {
      if (statusFilter !== 'all' && res.status !== statusFilter) return false;
      if (!term) return true;
      const holder = state.userById.get(res.user_id);
      const holderEmail = holder?.email?.toLowerCase() ?? '';
      const roomNumber = String(res.room_number);
      return holderEmail.includes(term) || roomNumber.includes(term);
    });
  }, [state, search, statusFilter]);

  const roomsList = state.kind === 'ready' ? Array.from(state.roomByNumber.values()) : [];
  const roomTypesList = state.kind === 'ready' ? Array.from(state.typeById.values()) : [];

  async function handleConfirmDelete() {
    if (!deleting) return;
    const id = deleting.id;
    setDeleting(null);
    setActionError(null);
    try {
      await deleteReservation(id);
      load();
    } catch (err) {
      setActionError(
        getErrorMessage(err, 'No fue posible eliminar la reserva. Inténtalo de nuevo.'),
      );
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <section className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Reservas</h1>
          <p className="mt-2 text-slate-600">
            Vista global de todas las reservas del hotel. Filtra por titular, habitación o estado.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="self-start rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Nueva reserva
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
            <label htmlFor="search" className="block text-xs font-medium text-slate-500">
              Buscar por email del titular o número de habitación
            </label>
            <input
              id="search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ej. usuario@correo.com o 101"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-xs font-medium text-slate-500">
              Estado
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">Todos</option>
              <option value="active">Activas</option>
              <option value="cancelled">Canceladas</option>
              <option value="completed">Completadas</option>
            </select>
          </div>
        </div>
      )}

      {state.kind === 'loading' && <Spinner label="Cargando reservas…" />}

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

      {state.kind === 'ready' && state.reservations.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500">
          Aún no hay reservas registradas.
        </div>
      )}

      {state.kind === 'ready' && state.reservations.length > 0 && filtered.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500">
          Ninguna reserva coincide con los filtros actuales.
        </div>
      )}

      {state.kind === 'ready' && filtered.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[80px_140px_1fr_180px_180px_120px_220px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
            <span>Hab.</span>
            <span>Tipo</span>
            <span>Titular</span>
            <span>Check-in</span>
            <span>Check-out</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {filtered.map((reservation) => {
              const room = state.roomByNumber.get(reservation.room_number);
              const roomType = room ? state.typeById.get(room.type_id) : undefined;
              const holder = state.userById.get(reservation.user_id);
              return (
                <li
                  key={reservation.id}
                  className="grid grid-cols-1 gap-2 px-4 py-3 text-sm md:grid-cols-[80px_140px_1fr_180px_180px_120px_220px] md:items-center md:gap-3"
                >
                  <div>
                    <span className="text-xs uppercase text-slate-400 md:hidden">Habitación</span>
                    <p className="font-medium text-slate-800">#{reservation.room_number}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-slate-400 md:hidden">Tipo</span>
                    <p className="text-slate-700">{roomType?.name ?? `Tipo #${room?.type_id ?? '?'}`}</p>
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs uppercase text-slate-400 md:hidden">Titular</span>
                    <p className="truncate text-slate-700" title={holder?.email ?? `user #${reservation.user_id}`}>
                      {holder ? `${holder.first_name} ${holder.last_name}` : `Usuario #${reservation.user_id}`}
                    </p>
                    {holder?.email && (
                      <p className="truncate text-xs text-slate-500" title={holder.email}>
                        {holder.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="text-xs uppercase text-slate-400 md:hidden">Check-in</span>
                    <p className="text-slate-700">{formatDate(reservation.checkin_date)}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-slate-400 md:hidden">Check-out</span>
                    <p className="text-slate-700">{formatDate(reservation.checkout_date)}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-slate-400 md:hidden">Estado</span>
                    <StatusPill status={reservation.status} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ActionButton onClick={() => setEditing(reservation)}>Editar</ActionButton>
                    <ActionButton onClick={() => setHolderTarget(reservation)}>
                      Cambiar titular
                    </ActionButton>
                    {reservation.status !== 'completed' && (
                      <ActionButton onClick={() => setStatusTarget(reservation)}>
                        Cambiar estado
                      </ActionButton>
                    )}
                    <ActionButton
                      onClick={() => setDeleting(reservation)}
                      variant="danger"
                    >
                      Eliminar
                    </ActionButton>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {state.kind === 'ready' && (
        <ReservationFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={load}
          mode="staff"
          rooms={roomsList}
          roomTypes={roomTypesList}
        />
      )}

      {state.kind === 'ready' && (
        <EditReservationModal
          open={!!editing}
          reservation={editing}
          onClose={() => setEditing(null)}
          onUpdated={load}
          rooms={roomsList}
          roomTypes={roomTypesList}
        />
      )}

      <ChangeHolderModal
        open={!!holderTarget}
        reservation={holderTarget}
        onClose={() => setHolderTarget(null)}
        onChanged={load}
      />

      <ChangeStatusModal
        open={!!statusTarget}
        reservation={statusTarget}
        onClose={() => setStatusTarget(null)}
        onChanged={load}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar reserva"
        message={
          deleting
            ? `¿Estás seguro de eliminar la reserva #${deleting.id}? Se notificará al titular. Esta acción no se puede deshacer.`
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

export function AllReservationsPage() {
  return (
    <RequireAuth roles={['staff', 'admin']}>
      <AllReservationsContent />
    </RequireAuth>
  );
}
