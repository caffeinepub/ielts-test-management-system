import { useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  username: string;
}

const AUTH_STORAGE_KEY = 'ielts_auth_state';
const VALID_USERNAME = "Hexa's Beanibazar";
const VALID_PASSWORD = 'Hexas@12345';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialize from session storage
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { isAuthenticated: false, username: '' };
      }
    }
    return { isAuthenticated: false, username: '' };
  });

  // Persist to session storage whenever auth state changes
  useEffect(() => {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  }, [authState]);

  const login = (username: string, password: string): boolean => {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      setAuthState({ isAuthenticated: true, username });
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuthState({ isAuthenticated: false, username: '' });
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const getCredentials = () => {
    if (!authState.isAuthenticated) {
      return null;
    }
    return {
      username: VALID_USERNAME,
      password: VALID_PASSWORD,
    };
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    username: authState.username,
    login,
    logout,
    getCredentials,
  };
}
