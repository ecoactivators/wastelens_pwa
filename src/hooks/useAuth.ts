import { useState, useEffect } from 'react';
import { User, AuthState, LoginCredentials, SignupData } from '../types/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    currentUser: null,
    loading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('waste_lens_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({
          isAuthenticated: true,
          currentUser: user,
          loading: false,
        });
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('waste_lens_user');
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      // For now, accept any username/password combination
      // In the future, this would validate against a real backend
      
      if (!credentials.username.trim() || !credentials.password.trim()) {
        return { success: false, error: 'Username and password are required' };
      }

      const user: User = {
        username: credentials.username.trim(),
        password: credentials.password, // In real app, this would be hashed
        createdAt: Date.now(),
      };

      // Save to localStorage (in real app, this would be a secure token)
      localStorage.setItem('waste_lens_user', JSON.stringify(user));

      setAuthState({
        isAuthenticated: true,
        currentUser: user,
        loading: false,
      });

      console.log('User logged in:', user.username);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const signup = async (signupData: SignupData): Promise<{ success: boolean; error?: string }> => {
    try {
      // Basic validation
      if (!signupData.username.trim() || !signupData.password.trim()) {
        return { success: false, error: 'Username and password are required' };
      }

      if (signupData.password !== signupData.confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }

      if (signupData.password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }

      // For now, just create the account (in real app, would check if username exists)
      const user: User = {
        username: signupData.username.trim(),
        password: signupData.password, // In real app, this would be hashed
        createdAt: Date.now(),
      };

      // Save to localStorage (in real app, this would be sent to backend)
      localStorage.setItem('waste_lens_user', JSON.stringify(user));

      setAuthState({
        isAuthenticated: true,
        currentUser: user,
        loading: false,
      });

      console.log('User signed up:', user.username);
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Account creation failed. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('waste_lens_user');
    setAuthState({
      isAuthenticated: false,
      currentUser: null,
      loading: false,
    });
    console.log('User logged out');
    
    // Force a page reload to ensure clean state
    window.location.reload();
  };

  return {
    ...authState,
    login,
    signup,
    logout,
  };
};