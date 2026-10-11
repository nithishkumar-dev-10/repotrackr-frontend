import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../../api/client';

interface User {
  id: number;
  email: string;
  is_verified: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = api.getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const res = await api.getMe();
    if (res.ok && res.data) {
      setUser(res.data);
    } else {
      api.clearTokens();
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (access: string, refresh?: string) => {
    api.setTokens(access, refresh);
    await refreshUser();
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    api.clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
