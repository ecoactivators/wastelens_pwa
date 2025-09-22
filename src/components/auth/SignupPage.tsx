import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface SignupPageProps {
  onSwitchToLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = signup(username, password, confirmPassword);
    if (!result.success && result.error) {
      setError(result.error);
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
            Create Account
          </h1>
          <p className="text-body text-secondary-gold">
            Join Waste Lens™ to start your waste analysis journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

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
              placeholder="Choose a username"
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
              placeholder="Create a password"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-white mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-primary-bg border border-primary-accent-pink/30 rounded-xl text-secondary-white placeholder-secondary-gold/60 focus:outline-none focus:border-primary-accent-cyan transition-colors"
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-secondary-gold text-sm">Already have an account?</span>
          </div>
          
          <button
            onClick={onSwitchToLogin}
            className="text-primary-accent-cyan hover:text-primary-accent-pink transition-colors text-sm font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};