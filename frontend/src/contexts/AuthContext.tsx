import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);

      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`; // Set the token in axios headers

      fetchUserData(); // Fetch user data
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserData = async (): Promise<void> => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);

      localStorage.removeItem('token'); // Token might be invalid, clear it
      setToken(null);

      delete api.defaults.headers.common['Authorization']; // Delete the token from axios headers
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = response.data;
      setToken(access_token);
      localStorage.setItem('token', access_token);

      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`; // Set the token in axios headers

      await fetchUserData(); // Fetch user data
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<void> => {
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
      });

      const { access_token } = response.data;
      setToken(access_token);
      localStorage.setItem('token', access_token);

      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`; // Set the token in axios headers

      await fetchUserData(); // Fetch user data
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
