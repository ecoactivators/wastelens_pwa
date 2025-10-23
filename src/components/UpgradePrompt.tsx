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

  // Google sign-in temporarily disabled - uncomment when ready to enable
  // const handleGoogleSignIn = async () => {
  //   setLoading(true);
  //   setError(null);
  //
  //   try {
  //     const currentUser = await authService.getCurrentUser();
  //     const isUpgrade = currentUser?.is_anonymous === true;
  //
  //     const result = await authService.signInWithOAuth('google', {
  //       isUpgrade,
  //       redirectPath: window.location.pathname,
  //     });
  //
  //     if (result.error) {
  //       setError(result.error.message);
  //       setLoading(false);
  //       return;
  //     }
  //
  //   } catch (err) {
  //     setError('Failed to sign in with Google. Please try again.');
  //     setLoading(false);
  //   }
  // };

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
