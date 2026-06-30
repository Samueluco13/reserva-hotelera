import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/Spinner';

/**
 * Guard de ruta: protege contra acceso no autenticado y, opcionalmente,
 * restringe por roles.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children
 * @param {import('@/types/api').Role[]} [props.roles] Lista de roles permitidos.
 */
export function RequireAuth({ children, roles }) {
  const { isAuthenticated, user, status } = useAuth();

  // Mientras se resuelve el token persistido, mostramos spinner.
  if (status === 'loading') {
    return <Spinner label="Verificando sesión…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}