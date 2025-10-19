import React, { useState } from 'react';
import { X, Mail, Lock, Crown, User, LogIn } from 'lucide-react';
import { authService } from '../services/auth';

interface UpgradePromptProps {
  onClose: () => void;
  onSuccess: () => void;
}

type AuthView = 'initial' | 'signin' | 'signup';

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ onClose, onSuccess }) => {
  const [view, setView] = useState<AuthView>('initial');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await authService.signInWithEmail(email, password);

      if (result.error) {
        setError(result.error.message);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const currentUser = await authService.getCurrentUser();
      let result;

      if (currentUser?.is_anonymous) {
        result = await authService.upgradeAnonymousToEmail(email, password, fullName);
      } else {
        result = await authService.signUpWithEmail(email, password, fullName);
      }

      if (result.error) {
        if (result.error.message.includes('already registered') || result.error.message.includes('already been registered')) {
          setError('Email address is already registered');
        } else {
          setError(result.error.message);
        }
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentUser = await authService.getCurrentUser();
      const isUpgrade = currentUser?.is_anonymous === true;

      const result = await authService.signInWithOAuth('google', {
        isUpgrade,
        redirectPath: window.location.pathname,
      });

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-primary-bg rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border-2 border-primary-accent-cyan/30">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-secondary-gold hover:text-secondary-gold/80 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          {view === 'initial' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-accent-cyan/20 rounded-full mb-4">
                  <Crown className="w-8 h-8 text-primary-accent-cyan" />
                </div>
                <h2 className="text-2xl font-bold text-secondary-white mb-2">Upgrade Your Account</h2>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setView('signin')}
                  className="w-full px-6 py-3 bg-primary-accent-cyan/10 text-primary-accent-cyan rounded-xl hover:bg-primary-accent-cyan/20 transition-colors font-medium"
                >
                  Sign In with Email
                </button>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-secondary-white border-2 border-secondary-white/20 rounded-xl hover:bg-secondary-white/90 transition-colors font-medium text-brand-dark"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <button
                  onClick={() => setView('signup')}
                  className="w-full px-6 py-3 bg-transparent text-secondary-white/80 rounded-xl hover:bg-secondary-white/10 transition-colors font-medium"
                >
                  Create Account
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-primary-accent-cyan/30"></div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full btn-primary"
              >
                Maybe Later
              </button>

              {error && (
                <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              <div className="pt-4 border-t border-primary-accent-cyan/30">
                <div className="text-sm text-secondary-white">
                  <p className="font-medium mb-2">Benefits:</p>
                  <ul className="space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-secondary-gold mt-0.5">✓</span>
                      <span>Access Agent Handle for AI-powered waste management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary-gold mt-0.5">✓</span>
                      <span>Sync data across all your devices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary-gold mt-0.5">✓</span>
                      <span>Access your snap history anytime</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {view === 'signin' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-secondary-white mb-2">Sign In</h2>
                <p className="text-secondary-white/70">Welcome back to Waste Lens</p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-white mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-accent-cyan" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-primary-bg border-2 border-primary-accent-cyan/50 text-secondary-white rounded-xl focus:border-primary-accent-cyan focus:outline-none placeholder:text-secondary-white/40"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-white mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-accent-cyan" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-primary-bg border-2 border-primary-accent-cyan/50 text-secondary-white rounded-xl focus:border-primary-accent-cyan focus:outline-none placeholder:text-secondary-white/40"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <button
                onClick={() => setView('initial')}
                className="w-full text-secondary-white/70 hover:text-secondary-white transition-colors text-sm"
              >
                Back
              </button>
            </div>
          )}

          {view === 'signup' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-secondary-white mb-2">Create Account</h2>
                <p className="text-secondary-white/70">Join Waste Lens today</p>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-white mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-accent-cyan" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-primary-bg border-2 border-primary-accent-cyan/50 text-secondary-white rounded-xl focus:border-primary-accent-cyan focus:outline-none placeholder:text-secondary-white/40"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-white mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-accent-cyan" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-primary-bg border-2 border-primary-accent-cyan/50 text-secondary-white rounded-xl focus:border-primary-accent-cyan focus:outline-none placeholder:text-secondary-white/40"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-white mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-accent-cyan" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-3 bg-primary-bg border-2 border-primary-accent-cyan/50 text-secondary-white rounded-xl focus:border-primary-accent-cyan focus:outline-none placeholder:text-secondary-white/40"
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="mt-1 text-xs text-secondary-white/60">Minimum 6 characters</p>
                </div>

                {error && (
                  <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <button
                onClick={() => setView('initial')}
                className="w-full text-secondary-white/70 hover:text-secondary-white transition-colors text-sm"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
