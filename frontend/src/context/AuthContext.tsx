import React, { createContext, useState, useContext, useEffect } from 'react';
import type { AuthContextType, User } from '../types';
import { authAPI } from '../utils/api';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for using auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  // 🔹 Validate and fetch user on load if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.getCurrentUser(token); // calls `/auth/me`
        setUser(response.data.user);
      } catch (error) {
        console.error('Token invalid or expired:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // 🔹 Login
  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password); // POST /auth/login
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
    } catch (error: any) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  // 🔹 Register
  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authAPI.register(name, email, password); // POST /auth/register
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
    } catch (error: any) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  // 🔹 Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
  };

  // Show a loader while validating session
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-white to-slate-100 text-gray-500">
        Loading authentication...
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
