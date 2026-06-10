import type { AuthSession } from '@/types';

import { api } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export async function login({
  email,
  password,
}: LoginCredentials): Promise<AuthSession> {
  const res = await api.post<AuthSession>('/auth/admin/login', {
    email,
    password,
  });
  return res.data;
}

export async function logout(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150));
}
