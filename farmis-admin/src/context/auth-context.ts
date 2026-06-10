import { createContext } from 'react';
import type { User } from '@/types';
import type { LoginCredentials } from '@/services/auth.service';

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export const AUTH_USER_STORAGE_KEY = 'farmis.admin.user';
