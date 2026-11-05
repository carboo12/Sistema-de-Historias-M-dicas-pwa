import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import {
  getFirebaseSession,
  signInWithFirebase,
  signOutFromFirebase
} from '../services/firebase/auth';
import { useFirebaseBackend } from '../services/firebase/client';
import type { User } from '../types';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  login: (identifier: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const refresh = useCallback(async () => {
    try {
      const session = useFirebaseBackend
        ? await getFirebaseSession()
        : (await api.auth.me()).user;
      setUser(session);
      setStatus('authenticated');
    } catch {
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (identifier: string, password: string) => {
    const session = useFirebaseBackend
      ? await signInWithFirebase(identifier, password)
      : (await api.auth.login(identifier, password)).user;
    setUser(session);
    setStatus('authenticated');
    return session;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (useFirebaseBackend) await signOutFromFirebase();
      else await api.auth.logout();
    } finally {
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return value;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-200 border-t-teal-700" />
          <p className="text-sm font-semibold text-ink/50">Cargando tu espacio clínico…</p>
        </div>
      </div>
    );
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  if (status === 'authenticated') return <Navigate to="/agenda" replace />;
  return <>{children}</>;
}
