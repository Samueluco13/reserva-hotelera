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

export function RoomCard({ room, roomType }) {
  const status = STATUS_STYLES[room.status];
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Habitación</p>
          <h3 className="text-2xl font-semibold text-slate-900">#{room.number}</h3>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${status.classes}`}
        >
          {status.label}
        </span>
      </header>

      <div className="border-t border-slate-100 pt-4">
        <p className="text-sm text-slate-500">Tipo</p>
        <p className="text-base font-medium text-slate-800">
          {roomType?.name ?? `Tipo #${room.type_id}`}
        </p>
        <p className="mt-2 text-sm text-slate-500">Precio por noche</p>
        <p className="text-lg font-semibold text-blue-700">
          {roomType ? formatPrice(roomType.price) : '—'}
        </p>
      </div>
    </article>
  );
}