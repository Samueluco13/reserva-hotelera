import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="text-sm font-medium text-blue-700">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-900">Página no encontrada</h1>
      <p className="mt-2 text-slate-600">
        La ruta que buscas no existe o fue movida.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        Volver al inicio
      </Link>
    </main>
  );
}