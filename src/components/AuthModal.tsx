import React, { useState } from 'react';
import { X, Mail, Lock, LogIn, ChevronDown } from 'lucide-react';
import { authService } from '../services/auth';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type AuthView = 'initial' | 'signin' | 'signup';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA',
  'ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK',
  'OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [view, setView] = useState<AuthView>('initial');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [street, setStreet] = useState('');
  const [apt, setApt] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [mobile, setMobile] = useState('');

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
    } catch {
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
    } catch {
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
      const fullName = `${firstName} ${lastName}`.trim();
      const result = await authService.signUpWithEmail(email, password, fullName, {
        firstName,
        lastName,
        street,
        aptUnit: apt,
        city,
        state,
        zip,
        mobile,
      });

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
    } catch {
      setError('Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-accent-cyan focus:outline-none text-gray-900 placeholder-gray-400 bg-white';
  const labelClass = 'block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 max-h-[90vh] overflow-y-auto">
          {view === 'initial' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-3">
                  <img src="/Waste_Lens_(1).png" alt="Waste Lens Logo" className="w-20 h-20 rounded-full object-cover" />
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
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-brand-dark mb-1">Create Account</h2>
                <p className="text-gray-600">Earn Money from Food Waste</p>
              </div>

              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={inputClass}
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={inputClass}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Street</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className={inputClass}
                    placeholder="123 Main St"
                  />
                </div>

                <div>
                  <label className={labelClass}>Apt or Unit Number</label>
                  <input
                    type="text"
                    value={apt}
                    onChange={(e) => setApt(e.target.value)}
                    className={inputClass}
                    placeholder="Apt 4B (optional)"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="col-span-2 sm:col-span-1">
                    <label className={labelClass}>City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={inputClass}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>State</label>
                    <div className="relative">
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className={`${inputClass} appearance-none pr-8 cursor-pointer`}
                      >
                        <option value="">ST</option>
                        {US_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Zip</label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className={inputClass}
                      placeholder="00000"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`${inputClass} pl-10`}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Mobile <span className="text-gray-400 font-normal normal-case">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className={inputClass}
                    placeholder="Mobile (optional)"
                  />
                </div>

                <div>
                  <label className={labelClass}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className={`${inputClass} pl-10`}
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
