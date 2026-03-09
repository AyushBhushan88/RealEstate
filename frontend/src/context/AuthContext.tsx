'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { apiFetch } from '../lib/api';

interface User {
  id: string;
  email: string;
  role: string;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
}

interface LoginCredentials {
  email: string;
  password?: string;
}

interface RegisterData {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await apiFetch('/auth/me');
        setUser(userData);
      } catch (error: unknown) {
        console.error('Failed to fetch user', error);
        Cookies.remove('token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    Cookies.set('token', data.token, { expires: 7 });
    setUser(data.user);
    router.push('/');
  };

  const register = async (userData: RegisterData) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    Cookies.set('token', data.token, { expires: 7 });
    setUser(data.user);
    router.push('/');
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
