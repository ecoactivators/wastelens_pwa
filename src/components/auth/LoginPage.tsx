import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface LoginPageProps {
  onSwitchToSignup: () => void;
  onProceedAsGuest: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignup, onProceedAsGuest }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      login(username, password);
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/icon-512.png" 
            alt="Waste Lens™" 
            className="w-24 h-24 mx-auto mb-6 animate-subtle-grow"
          />
          <h1 className="text-heading font-bold text-secondary-white mb-2">
            Welcome to Waste Lens™
          </h1>
          <p className="text-body text-secondary-gold">
            Sign in to start analyzing your waste
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-secondary-white mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-primary-bg border border-primary-accent-pink/30 rounded-xl text-secondary-white placeholder-secondary-gold/60 focus:outline-none focus:border-primary-accent-cyan transition-colors"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-secondary-white mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-primary-bg border border-primary-accent-pink/30 rounded-xl text-secondary-white placeholder-secondary-gold/60 focus:outline-none focus:border-primary-accent-cyan transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <span className="text-secondary-gold text-sm">Don't have an account?</span>
          </div>
          
          <button
            onClick={onSwitchToSignup}
            className="text-primary-accent-cyan hover:text-primary-accent-pink transition-colors text-sm font-medium"
          >
            Create Account
          </button>
          
          <div className="mt-6 pt-6 border-t border-primary-accent-pink/20">
            <button
              onClick={onProceedAsGuest}
              className="w-full text-secondary-gold hover:text-secondary-white transition-colors text-sm font-medium underline"
            >
              Proceed as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};