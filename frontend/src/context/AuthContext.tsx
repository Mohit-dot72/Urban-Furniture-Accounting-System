import React, { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axiosClient from '../api/axiosClient';
import type { AuthUser, Role } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ role: Role }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('uf_token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('uf_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string): Promise<{ role: Role }> => {
    const res = await axiosClient.post<{ token: string; user: { name: string; email: string; role: Role; id: string; contactId?: string | null } }>('/auth/login', { email, password });
    const { token: newToken, user: apiUser } = res.data;

    const decoded = jwtDecode<{ userId: string; role: Role; contactId?: string | null }>(newToken);
    const authUser: AuthUser = {
      userId: decoded.userId,
      role: decoded.role,
      contactId: decoded.contactId,
      name: apiUser.name,
      email: apiUser.email,
    };

    localStorage.setItem('uf_token', newToken);
    localStorage.setItem('uf_user', JSON.stringify(authUser));
    setToken(newToken);
    setUser(authUser);

    return { role: decoded.role };
  };

  const logout = () => {
    localStorage.removeItem('uf_token');
    localStorage.removeItem('uf_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
