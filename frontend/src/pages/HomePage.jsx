import { useEffect, useState } from 'react';
import { RoomCard } from '@/components/RoomCard';
import { Spinner } from '@/components/Spinner';
import { getRooms, getRoomTypes } from '@/services/rooms';

export function HomePage() {
  const [state, setState] = useState({ kind: 'loading' });

  const load = () => {
    setState({ kind: 'loading' });
    Promise.all([getRooms(), getRoomTypes()])
      .then(([rooms, roomTypes]) => setState({ kind: 'ready', rooms, roomTypes }))
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : 'No se pudieron cargar las habitaciones.';
        setState({ kind: 'error', message });
      });
  };

  useEffect(() => {
    load();
  }, []);

  const roomTypeById =
    state.kind === 'ready'
      ? new Map(state.roomTypes.map((rt) => [rt.id, rt]))
      : new Map();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900">Nuestras habitaciones</h1>
        <p className="mt-2 text-slate-600">
          Explora las habitaciones disponibles y encuentra la que mejor se adapte a tu estadía.
        </p>
      </section>

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
          Aún no hay habitaciones registradas.
        </div>
      )}

      {state.kind === 'ready' && state.rooms.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {state.rooms.map((room) => (
            <RoomCard key={room.number} room={room} roomType={roomTypeById.get(room.type_id)} />
          ))}
        </div>
      )}
    </main>
  );
}