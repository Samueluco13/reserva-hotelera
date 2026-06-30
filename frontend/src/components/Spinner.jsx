export function Spinner({ label = 'Cargando…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
      <span
        aria-hidden
        className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}