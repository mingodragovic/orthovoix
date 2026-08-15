// src/providers/AuthProvider.tsx
import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { tokenManager } from '@/utils/tokenManager';
import { useCurrentUser } from '@/hooks/useAuth';
import type { UserProfile } from '@/types/auth.types';

interface AuthContextValue {
  user: UserProfile | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null | undefined>(() => tokenManager.getUser());
  
  const { data: fetchedUser, isLoading, refetch } = useCurrentUser();

  useEffect(() => {
    if (fetchedUser) {
      setUser(fetchedUser);
      tokenManager.setUser(fetchedUser);
    }
  }, [fetchedUser]);

  const isAuthenticated = tokenManager.hasValidSession() && !!user;

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated,
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}