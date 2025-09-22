import React from 'react';
import { useState, useEffect, createContext, useContext } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => boolean;
  signup: (username: string, password: string, confirmPassword: string) => { success: boolean; error?: string };
  proceedAsGuest: () => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthInternal();
  return React.createElement(AuthContext.Provider, { value: auth }, children);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const useAuthInternal = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const savedUser = localStorage.getItem('waste_lens_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('waste_lens_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    // For now, accept any username/password combination
    // TODO: Replace with real authentication logic
    const user: User = {
      id: `user_${Date.now()}`,
      username,
      email: `${username}@example.com`, // Mock email
    };
    
    setUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('waste_lens_user', JSON.stringify(user));
    return true;
  };

  const proceedAsGuest = (): boolean => {
    // Create a guest user session
    const guestUser: User = {
      id: `guest_${Date.now()}`,
      username: 'Guest User',
      email: 'guest@wastelens.com',
    };
    
    setUser(guestUser);
    setIsAuthenticated(true);
    localStorage.setItem('waste_lens_user', JSON.stringify(guestUser));
    return true;
  };

  const signup = (username: string, password: string, confirmPassword: string): { success: boolean; error?: string } => {
    // Basic validation
    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }
    
    if (username.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }
    
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    
    // For now, create account immediately
    // TODO: Replace with real signup logic
    const user: User = {
      id: `user_${Date.now()}`,
      username,
      email: `${username}@example.com`, // Mock email
    };
    
    setUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('waste_lens_user', JSON.stringify(user));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('waste_lens_user');
    // Force page reload to ensure clean state
    window.location.reload();
  };

  return {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    proceedAsGuest,
    logout,
  };
};