import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TOKEN_STORAGE_KEY } from '@/api/client';
import { fetchCurrentUser, loginUser, registerUser } from '@/services/auth';

/**
 * @typedef {Object} AuthContextValue
 * @property {import('@/types/api').User | null} user
 * @property {string | null} token
 * @property {'idle' | 'loading' | 'ready'} status
 * @property {boolean} isAuthenticated
 * @property {(email: string, password: string) => Promise<void>} login
 * @property {(payload: import('@/types/api').UserCreate) => Promise<import('@/types/api').User>} register
 * @property {() => void} logout
 */

const AuthContext = createContext(/** @type {AuthContextValue | undefined} */ (undefined));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(/** @type {import('@/types/api').User | null} */ (null));
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [status, setStatus] = useState(token ? 'loading' : 'ready');

  // Al montar: si hay token persistido, intentar cargar el usuario actual.
  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setStatus('ready');
      return;
    }
    fetchCurrentUser()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setStatus('ready');
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (email, password) => {
    const tokenResponse = await loginUser(email, password);
    setToken(tokenResponse.access_token);
    const current = await fetchCurrentUser();
    setUser(current);
  }, []);

  const register = useCallback(async (payload) => {
    return registerUser(payload);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      status,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }),
    [user, token, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}