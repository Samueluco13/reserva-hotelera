import { useEffect, useState } from 'react';
import { Spinner } from '@/components/Spinner';
import { ReservationFormModal } from '@/components/ReservationFormModal';
import { RequireAuth } from '@/components/RequireAuth';
import { getMyReservations } from '@/services/reservations';
import { getRooms, getRoomTypes } from '@/services/rooms';

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

function ReservationCard({ reservation, roomType }) {
  const status = STATUS_STYLES[reservation.status] ?? STATUS_STYLES.active;
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Habitación</p>
          <h3 className="text-2xl font-semibold text-slate-900">
            #{reservation.room_number}
          </h3>
          {roomType && (
            <p className="mt-1 text-sm text-slate-500">{roomType.name}</p>
          )}
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.classes}`}>
          {status.label}
        </span>
      </header>

      <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm">
        <div>
          <p className="text-slate-500">Check-in</p>
          <p className="font-medium text-slate-800">{formatDate(reservation.checkin_date)}</p>
        </div>
        <div>
          <p className="text-slate-500">Check-out</p>
          <p className="font-medium text-slate-800">{formatDate(reservation.checkout_date)}</p>
        </div>
      </div>
    </article>
  );
}

function MyReservationsContent() {
  const [state, setState] = useState({ kind: 'loading' });
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => {
    setState({ kind: 'loading' });
    Promise.all([getMyReservations(), getRooms(), getRoomTypes()])
      .then(([reservations, rooms, roomTypes]) => {
        const roomByNumber = new Map(rooms.map((r) => [r.number, r]));
        const typeById = new Map(roomTypes.map((rt) => [rt.id, rt]));
        setState({ kind: 'ready', reservations, roomByNumber, typeById });
      })
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : 'No se pudieron cargar tus reservas.';
        setState({ kind: 'error', message });
      });
  };

  useEffect(() => {
    load();
  }, []);

  function handleCreated() {
    // Al cerrar el modal con éxito, refrescamos la lista.
    load();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Mis reservas</h1>
          <p className="mt-2 text-slate-600">
            Aquí encuentras todas tus reservas activas, canceladas y completadas.
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

      {state.kind === 'loading' && <Spinner label="Cargando tus reservas…" />}

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
          Aún no tienes reservas. ¡Crea la primera con el botón "Nueva reserva"!
        </div>
      )}

      {state.kind === 'ready' && state.reservations.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {state.reservations.map((reservation) => {
            const room = state.roomByNumber.get(reservation.room_number);
            const roomType = room ? state.typeById.get(room.type_id) : undefined;
            return (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                roomType={roomType}
              />
            );
          })}
        </div>
      )}

      {state.kind === 'ready' && (
        <ReservationFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={handleCreated}
          mode="guest"
          rooms={state.roomByNumber ? Array.from(state.roomByNumber.values()) : []}
          roomTypes={state.typeById ? Array.from(state.typeById.values()) : []}
        />
      )}
    </main>
  );
}

export function MyReservationsPage() {
  return (
    <RequireAuth>
      <MyReservationsContent />
    </RequireAuth>
  );
}