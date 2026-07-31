import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const STORAGE_KEY = 'puma-auth';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const syncStorage = (nextAuth) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
  };

  const clearStorage = () => {
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const setSession = (session) => {
    const nextUser = session?.user ?? null;
    const nextToken = session?.token ?? null;
    const nextRole = nextUser?.role ?? nextUser?.rol ?? null;

    setUser(nextUser);
    setToken(nextToken);
    setRole(nextRole);

    if (nextUser && nextToken) {
      syncStorage({ user: nextUser, token: nextToken, role: nextRole });
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    clearStorage();
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedAuth = window.localStorage.getItem(STORAGE_KEY);

        if (!storedAuth) {
          setInitializing(false);
          return;
        }

        const parsedAuth = JSON.parse(storedAuth);

        if (!parsedAuth?.token) {
          logout();
          setInitializing(false);
          return;
        }

        setToken(parsedAuth.token);
        setUser(parsedAuth.user ?? null);
        setRole(parsedAuth.role ?? parsedAuth.user?.role ?? parsedAuth.user?.rol ?? null);

        const response = await api.get('/api/auth/me');
        const currentUser = response.data?.user ?? null;

        if (currentUser) {
          setSession({
            token: parsedAuth.token,
            user: currentUser,
          });
        } else {
          logout();
        }
      } catch (error) {
        logout();
      } finally {
        setInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (session) => {
    setSession(session);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      role,
      isAuthenticated: Boolean(token),
      initializing,
      login,
      logout,
      setSession,
    }),
    [user, token, role, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }

  return context;
};

export { AuthProvider, useAuth };