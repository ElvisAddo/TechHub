import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to clear auth data
  const clearAuthData = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    try {
      // Check if storedUser exists and is not "undefined" string
      if (storedToken && storedUser && storedUser !== 'undefined') {
        const parsedUser = JSON.parse(storedUser);
        // Additional validation
        if (parsedUser && typeof parsedUser === 'object' && 'id' in parsedUser) {
          setToken(storedToken);
          setUser(parsedUser);
        } else {
          console.warn('Invalid user data in localStorage');
          clearAuthData();
        }
      } else {
        // Clear data if token exists but user data is invalid
        if (storedToken && (!storedUser || storedUser === 'undefined')) {
          console.warn('Token exists but user data is invalid');
          clearAuthData();
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await authService.register(username, email, password);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
