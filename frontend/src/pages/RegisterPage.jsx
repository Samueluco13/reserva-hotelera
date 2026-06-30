import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const PHONE_REGEX = /^\+?[0-9\s-]{7,15}$/;

function getErrorMessage(err, fallback) {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data;
    if (typeof detail?.detail === 'string') return detail.detail;
    if (err.response?.status === 409) return 'Ese email ya está registrado.';
    if (err.response?.status === 422) return 'Revisa los datos ingresados.';
  }
  return fallback;
}

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate() {
    const next = {};
    if (!form.first_name.trim()) next.first_name = 'El nombre es obligatorio.';
    if (!form.last_name.trim()) next.last_name = 'El apellido es obligatorio.';
    if (!form.email.trim()) next.email = 'El email es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Email no válido.';
    if (!form.password) next.password = 'La contraseña es obligatoria.';
    else if (form.password.length < 8)
      next.password = 'La contraseña debe tener al menos 8 caracteres.';
    if (form.phone_number && !PHONE_REGEX.test(form.phone_number))
      next.phone_number = 'Teléfono no válido.';
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
      await register({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone_number: form.phone_number?.trim() || null,
      });
      setSuccess(true);
      // Redirigir tras un breve delay para que el usuario vea el mensaje.
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'No fue posible crear la cuenta.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Crear cuenta</h1>
      <p className="mt-1 text-sm text-slate-600">Regístrate para poder reservar habitaciones.</p>

      {success && (
        <div
          role="status"
          className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
        >
          Cuenta creada con éxito. Te llevamos al inicio de sesión…
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              id="first_name"
              type="text"
              autoComplete="given-name"
              value={form.first_name}
              onChange={(e) => update('first_name', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-invalid={!!errors.first_name}
            />
            {errors.first_name && (
              <p className="mt-1 text-xs text-rose-600">{errors.first_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-slate-700">
              Apellido
            </label>
            <input
              id="last_name"
              type="text"
              autoComplete="family-name"
              value={form.last_name}
              onChange={(e) => update('last_name', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-invalid={!!errors.last_name}
            />
            {errors.last_name && (
              <p className="mt-1 text-xs text-rose-600">{errors.last_name}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-slate-700">
            Teléfono <span className="text-slate-400">(opcional)</span>
          </label>
          <input
            id="phone_number"
            type="tel"
            autoComplete="tel"
            value={form.phone_number ?? ''}
            onChange={(e) => update('phone_number', e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            aria-invalid={!!errors.phone_number}
          />
          {errors.phone_number && (
            <p className="mt-1 text-xs text-rose-600">{errors.phone_number}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            aria-invalid={!!errors.password}
            aria-describedby="password-hint"
          />
          <p id="password-hint" className="mt-1 text-xs text-slate-500">
            Mínimo 8 caracteres.
          </p>
          {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
        </div>

        {submitError && (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || success}
          className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>

        <p className="text-center text-sm text-slate-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-blue-700 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </main>
  );
}