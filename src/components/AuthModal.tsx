import React, { useState } from 'react';
import { X, Mail, Lock, User, LogIn } from 'lucide-react';
import { authService } from '../services/auth';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type AuthView = 'initial' | 'signin' | 'signup';

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [view, setView] = useState<AuthView>('initial');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleContinueAsGuest = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.signInAnonymously();

      if (result.error) {
        setError(result.error.message);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to continue as guest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      const result = await authService.signUpWithEmail(email, password, fullName);

      if (result.error) {
        setError(result.error.message);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to sign up. Please try again.');
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
  //     const result = await authService.signInWithOAuth('google', {
  //       isUpgrade: false,
  //       redirectPath: window.location.pathname,
  //     });
  //
  //     if (result.error) {
  //       setError(result.error.message);
  //       setLoading(false);
  //       return;
  //     }
  //   } catch (err) {
  //     setError('Failed to sign in with Google. Please try again.');
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          {view === 'initial' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-accent-cyan/10 rounded-full mb-3">
                  <img src="/Waste Lens emblem.png" alt="Waste Lens Logo" className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-brand-dark">Waste Lens</h2>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setView('signin')}
                  className="w-full px-6 py-3 bg-primary-accent-cyan text-white rounded-xl hover:bg-primary-accent-cyan/90 transition-colors font-medium"
                >
                  Sign In with Email
                </button>

                <button
                  onClick={() => setView('signup')}
                  className="w-full px-6 py-3 bg-primary-accent-cyan/10 text-primary-accent-cyan rounded-xl hover:bg-primary-accent-cyan/20 transition-colors font-medium border-2 border-primary-accent-cyan/30"
                >
                  Create Account
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
              </div>

              <button
                onClick={handleContinueAsGuest}
                disabled={loading}
                className="w-full text-primary-accent-cyan hover:text-primary-accent-cyan/80 transition-colors font-medium"
              >
                {loading ? 'Loading...' : 'Continue as Guest'}
              </button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {view === 'signin' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-brand-dark mb-2">Sign In</h2>
                <p className="text-gray-600">Welcome back to Waste Lens</p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-accent-cyan focus:outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-accent-cyan focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
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
                className="w-full text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                Back
              </button>
            </div>
          )}

          {view === 'signup' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-brand-dark mb-2">Create Account</h2>
                <p className="text-gray-600">Join Waste Lens today</p>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-accent-cyan focus:outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-accent-cyan focus:outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-accent-cyan focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
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
                className="w-full text-gray-600 hover:text-gray-800 transition-colors text-sm"
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
