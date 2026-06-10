import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  login as loginService,
  logout as logoutService,
  type LoginCredentials,
} from '@/services/auth.service';
import { getStoredToken, setAuthToken } from '@/services/api';
import type { User } from '@/types';
import {
  AUTH_USER_STORAGE_KEY,
  AuthContext,
  type AuthContextValue,
} from './auth-context';

interface PersistedAuth {
  user: User | null;
  token: string | null;
}

function readPersistedAuth(): PersistedAuth {
  const token = getStoredToken();
  const rawUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
  if (!token || !rawUser) return { user: null, token: null };
  try {
    return { user: JSON.parse(rawUser) as User, token };
  } catch {
    setAuthToken(null);
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [persisted] = useState<PersistedAuth>(readPersistedAuth);
  const [user, setUser] = useState<User | null>(persisted.user);
  const [token, setToken] = useState<string | null>(persisted.token);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const session = await loginService(credentials);
    setAuthToken(session.token);
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(session.user));
    setUser(session.user);
    setToken(session.token);
  }, []);

  const logout = useCallback(async () => {
    await logoutService();
    setAuthToken(null);
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading: false,
      login,
      logout,
    }),
    [user, token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
