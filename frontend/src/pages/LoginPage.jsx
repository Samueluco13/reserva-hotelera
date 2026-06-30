import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

function getErrorMessage(err) {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data;
    if (typeof detail?.detail === 'string') return detail.detail;
    if (err.response?.status === 401) return 'Credenciales inválidas.';
    return 'No fue posible iniciar sesión. Inténtalo de nuevo.';
  }
  return 'No fue posible iniciar sesión. Inténtalo de nuevo.';
}

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  function validate() {
    const next = {};
    if (!email.trim()) next.email = 'El email es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Email no válido.';
    if (!password) next.password = 'La contraseña es obligatoria.';
    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Iniciar sesión</h1>
      <p className="mt-1 text-sm text-slate-600">Accede para gestionar tus reservas.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-xs text-rose-600">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <p id="password-error" className="mt-1 text-xs text-rose-600">
              {errors.password}
            </p>
          )}
        </div>

        {submitError && (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {submitting ? 'Ingresando…' : 'Ingresar'}
        </button>

        <p className="text-center text-sm text-slate-600">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-medium text-blue-700 hover:underline">
            Regístrate
          </Link>
        </p>
      </form>
    </main>
  );
}