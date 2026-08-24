'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from './api';
import type { Role } from './types';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Self-registered students have no internal financial access yet (see
// accounts/permissions.py IsInternalUser on the backend) - this mirrors
// that on the frontend so pages can gate consistently.
export function isInternalRole(role: Role | undefined): boolean {
  return role === 'ADMIN' || role === 'FINANCE_OFFICER' || role === 'COMMITTEE_MEMBER';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('itca_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<AuthUser>('/auth/me')
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('itca_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await api.post<{ accessToken: string; user: AuthUser }>('/auth/login', {
        email,
        password,
      });
      localStorage.setItem('itca_token', result.accessToken);
      setUser(result.user);
      router.push(isInternalRole(result.user.role) ? '/dashboard' : '/');
    },
    [router],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const result = await api.post<{ accessToken: string; user: AuthUser }>('/auth/register', {
        name,
        email,
        password,
      });
      localStorage.setItem('itca_token', result.accessToken);
      setUser(result.user);
      router.push('/');
    },
    [router],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('itca_token');
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { ApiError };
