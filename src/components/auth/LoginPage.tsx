import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { LoginCredentials } from '../../types/auth';

interface LoginPageProps {
  onLogin: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  onNavigateToSignup: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToSignup }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await onLogin(credentials);
    
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error when user starts typing
  };

  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <img 
            src="/icon-512.png" 
            alt="Waste Lens™" 
            className="w-24 h-24 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-secondary-white mb-2">
            Welcome to Waste Lens™
          </h1>
          <p className="text-secondary-gold">
            Sign in to start analyzing your waste
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-secondary-white mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-secondary-gold" />
              </div>
              <input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-secondary-gold/30 rounded-xl bg-primary-bg/50 text-secondary-white placeholder-secondary-gold/60 focus:outline-none focus:ring-2 focus:ring-primary-accent-cyan focus:border-transparent transition-all duration-300"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-secondary-white mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-secondary-gold" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border border-secondary-gold/30 rounded-xl bg-primary-bg/50 text-secondary-white placeholder-secondary-gold/60 focus:outline-none focus:ring-2 focus:ring-primary-accent-cyan focus:border-transparent transition-all duration-300"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-gold hover:text-secondary-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-secondary-white border-t-transparent rounded-full animate-spin"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Signup Link */}
        <div className="mt-8 text-center">
          <p className="text-secondary-gold">
            Don't have an account?{' '}
            <button
              onClick={onNavigateToSignup}
              className="text-primary-accent-cyan hover:text-primary-accent-pink font-semibold transition-colors"
            >
              Create Account
            </button>
          </p>
        </div>

        {/* Demo Notice */}
        <div className="mt-6 bg-primary-accent-cyan/10 border border-primary-accent-cyan/20 rounded-xl p-4">
          <p className="text-primary-accent-cyan text-sm text-center">
            <strong>Demo Mode:</strong> Any username and password combination will work for now.
          </p>
        </div>
      </div>
    </div>
  );
};