import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoginPage } from './LoginPage';
import { SignupPage } from './SignupPage';

interface AuthWrapperProps {
  children: React.ReactNode;
}

type AuthView = 'login' | 'signup';

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated, loading, login, signup } = useAuth();
  const [currentView, setCurrentView] = useState<AuthView>('login');

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <img 
            src="/icon-loading-512.png" 
            alt="Waste Lens™" 
            className="w-48 h-48 animate-subtle-grow mx-auto mb-4"
          />
          <div className="w-8 h-8 border-4 border-primary-accent-cyan border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // If authenticated, show the main app
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Show authentication pages
  if (currentView === 'signup') {
    return (
      <SignupPage
        onSignup={signup}
        onNavigateToLogin={() => setCurrentView('login')}
      />
    );
  }

  return (
    <LoginPage
      onLogin={login}
      onNavigateToSignup={() => setCurrentView('signup')}
    />
  );
};