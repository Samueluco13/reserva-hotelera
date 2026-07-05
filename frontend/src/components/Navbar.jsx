import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ConfirmDialog } from '@/components/ConfirmDialog';

const STAFF_ROLES = ['staff', 'admin'];

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isStaff = !!user && STAFF_ROLES.includes(user.role);

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-blue-700">
            <span aria-hidden className="inline-block h-7 w-7 rounded-md bg-blue-600" />
            Reserva Hotelera
          </Link>

          <div className="flex items-center gap-3 text-sm">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 transition ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-blue-700'
                }`
              }
            >
              Inicio
            </NavLink>

            {isAuthenticated && (
              <NavLink
                to="/my-reservations"
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 transition ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-blue-700'
                  }`
                }
              >
                Mis reservas
              </NavLink>
            )}

            {isStaff && (
              <NavLink
                to="/reservations"
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 transition ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-blue-700'
                  }`
                }
              >
                Reservas
              </NavLink>
            )}

            {isStaff && (
              <NavLink
                to="/room-types"
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 transition ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-blue-700'
                  }`
                }
              >
                Tipos de hab.
              </NavLink>
            )}

            {isAuthenticated && user ? (
              <>
                <span className="hidden text-slate-500 sm:inline">
                  Hola, <span className="font-medium text-slate-700">{user.first_name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-slate-700 transition hover:bg-slate-100"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md border border-blue-600 px-3 py-1.5 text-blue-700 transition hover:bg-blue-50"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-white transition hover:bg-blue-700"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Cerrar sesión"
        message="¿Estás seguro de que quieres cerrar tu sesión? Tendrás que volver a iniciar sesión para acceder a tus reservas."
        confirmLabel="Sí, cerrar sesión"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}