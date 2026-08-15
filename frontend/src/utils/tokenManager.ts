// src/utils/tokenManager.ts
import type { UserProfile } from '@/types/auth.types';

// Storage keys
const ACCESS_TOKEN_KEY = 'orthovoix_access_token';
const USER_KEY = 'orthovoix_user';
const REFRESH_TOKEN_KEY = 'orthovoix_refresh_token';

// In-memory cache
let accessToken: string | null = null;
let refreshToken: string | null = null;
let currentUser: UserProfile | null = null;

// Initialize from storage on module load
const initFromStorage = () => {
  // Access token
  const storedToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (storedToken) {
    accessToken = storedToken;
  }

  // Refresh token
  const storedRefresh = sessionStorage.getItem(REFRESH_TOKEN_KEY);
  if (storedRefresh) {
    refreshToken = storedRefresh;
  }

  // User
  const storedUser = sessionStorage.getItem(USER_KEY);
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch {
      console.error('❌ TokenManager: Failed to parse stored user');
      sessionStorage.removeItem(USER_KEY);
    }
  }
};

// Initialize immediately
initFromStorage();

export const tokenManager = {
  // Access Token
  getAccessToken: (): string | null => {
    if (accessToken) return accessToken;
    
    const stored = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    if (stored) {
      accessToken = stored;
      return stored;
    }
    return null;
  },

  setAccessToken: (token: string): void => {
    accessToken = token;
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  // Refresh Token
  getRefreshToken: (): string | null => {
    if (refreshToken) return refreshToken;
    
    const stored = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    if (stored) {
      refreshToken = stored;
      return stored;
    }
    return null;
  },

  setRefreshToken: (token: string): void => {
    refreshToken = token;
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  // User
  getUser: (): UserProfile | null => {
    if (currentUser) return currentUser;
    
    const stored = sessionStorage.getItem(USER_KEY);
    if (stored) {
      try {
        currentUser = JSON.parse(stored);
        return currentUser;
      } catch {
        return null;
      }
    }
    return null;
  },

  setUser: (user: UserProfile): void => {
    currentUser = user;
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Clear methods
  clearTokens: (): void => {
    accessToken = null;
    refreshToken = null;
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  clearUser: (): void => {
    currentUser = null;
    sessionStorage.removeItem(USER_KEY);
  },

  clearAll: (): void => {
    accessToken = null;
    refreshToken = null;
    currentUser = null;
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  // Auth checks
  isAuthenticated: (): boolean => {
    return !!tokenManager.getAccessToken();
  },

  hasValidSession: (): boolean => {
    return !!tokenManager.getAccessToken() && !!tokenManager.getUser();
  },
};