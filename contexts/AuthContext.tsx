import type { AppRole } from '@/constants/school-theme';
import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type AuthContextValue = {
  role: AppRole | null;
  isLoggedIn: boolean;
  login: (role: AppRole) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const rolePaths: Record<AppRole, string> = {
  student: '/(student)/(tabs)',
  parent: '/(parent)/(tabs)',
  teacher: '/(teacher)/(tabs)',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<AppRole | null>(null);

  const login = useCallback((next: AppRole) => {
    setRole(next);
    router.replace(rolePaths[next] as never);
  }, []);

  const logout = useCallback(() => {
    setRole(null);
    router.replace('/login');
  }, []);

  const value = useMemo(
    () => ({
      role,
      isLoggedIn: role !== null,
      login,
      logout,
    }),
    [role, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
