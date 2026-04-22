import React, { useState } from 'react';
import { X, Mail, Lock, LogIn, ChevronDown } from 'lucide-react';
import { authService } from '../services/auth';

interface UpgradePromptProps {
  onClose: () => void;
  onSuccess: () => void;
  onMaybeLater?: () => void;
}

type AuthView = 'initial' | 'signin' | 'signup';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA',
  'ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK',
  'OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ onClose, onSuccess, onMaybeLater }) => {
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

  const handleMaybeLater = () => {
    if (onMaybeLater) {
      onMaybeLater();
    } else {
      onClose();
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await authService.signInWithEmail(email, password);
      if (result.error) { setError(result.error.message); return; }
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
      const profileFields = {
        firstName,
        lastName,
        street,
        aptUnit: apt,
        city,
        state,
        zip,
        mobile,
      };
      const currentUser = await authService.getCurrentUser();
      let result;
      if (currentUser?.is_anonymous) {
        result = await authService.upgradeAnonymousToEmail(email, password, fullName, profileFields);
      } else {
        result = await authService.signUpWithEmail(email, password, fullName, profileFields);
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
    } catch {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const glassBg = {
    background: 'rgba(0, 17, 35, 0.92)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1.5px solid rgba(87, 235, 221, 0.25)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
  };

  const inputStyle = {
    background: 'rgba(0,48,86,0.4)',
    border: '1.5px solid rgba(87,235,221,0.3)',
    color: '#fff',
    borderRadius: '12px',
    padding: '12px 14px',
    width: '100%',
    fontSize: '14px',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600' as const,
    color: 'rgba(87,235,221,0.8)',
    marginBottom: '6px',
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden" style={glassBg}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all hover:scale-110"
          style={{ background: 'rgba(87,235,221,0.12)', border: '1px solid rgba(87,235,221,0.25)' }}
        >
          <X className="w-4 h-4" style={{ color: '#57ebdd' }} />
        </button>

        <div className="p-7 max-h-[90vh] overflow-y-auto hide-scrollbar">
          {view === 'initial' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'rgba(87,235,221,0.12)', border: '1px solid rgba(87,235,221,0.25)' }}>
                  <img src="/Waste_Lens_(1).png" alt="Waste Lens Logo" className="w-14 h-14 rounded-full object-cover" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Upgrade Experience</h2>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => setView('signin')}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
                  style={{ background: '#57ebdd', color: '#001123' }}
                >
                  Sign In with Email
                </button>
                <button
                  onClick={() => setView('signup')}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
                  style={{ background: 'rgba(87,235,221,0.1)', border: '1.5px solid rgba(87,235,221,0.4)', color: '#57ebdd' }}
                >
                  Create Account
                </button>
              </div>

              <div style={{ borderTop: '1px solid rgba(87,235,221,0.15)', paddingTop: '16px' }}>
                <p className="text-xs font-semibold mb-3" style={{ color: 'rgba(87,235,221,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Benefits</p>
                <ul className="space-y-2.5">
                  {[
                    'Personalized Concierge Agent',
                    'Incentives (Cash, Gas, Groceries)',
                    'Smart Bin Access',
                    'Welcome Gift (ships free)',
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex-shrink-0 font-bold" style={{ color: '#57ebdd' }}>✓</span>
                      <span className="text-sm leading-snug" style={{ color: 'rgba(255,255,255,0.85)' }}>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleMaybeLater}
                className="w-full text-sm transition-colors text-center py-1"
                style={{ color: 'rgba(87,235,221,0.6)' }}
              >
                Maybe Later
              </button>

              {error && (
                <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                  {error}
                </div>
              )}
            </div>
          )}

          {view === 'signin' && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-1">Sign In</h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Welcome back to Waste Lens</p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label style={labelStyle}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#57ebdd' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ ...inputStyle, paddingLeft: '38px' }}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#57ebdd' }} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ ...inputStyle, paddingLeft: '38px' }}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: '#57ebdd', color: '#001123' }}
                >
                  <LogIn className="w-4 h-4" />
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <button
                onClick={() => setView('initial')}
                className="w-full text-sm text-center py-1 transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Back
              </button>
            </div>
          )}

          {view === 'signup' && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-1">Upgrade Experience</h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Earn Money from Food Waste</p>
              </div>

              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      style={inputStyle}
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      style={inputStyle}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Street</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    style={inputStyle}
                    placeholder="123 Main St"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Apt or Unit Number</label>
                  <input
                    type="text"
                    value={apt}
                    onChange={(e) => setApt(e.target.value)}
                    style={inputStyle}
                    placeholder="Apt 4B (optional)"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label style={labelStyle}>City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={inputStyle}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>State</label>
                    <div className="relative">
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        style={{ ...inputStyle, appearance: 'none', paddingRight: '28px', cursor: 'pointer' }}
                      >
                        <option value="">ST</option>
                        {US_STATES.map((s) => (
                          <option key={s} value={s} style={{ background: '#001123', color: '#fff' }}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: '#57ebdd' }} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Zip</label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      style={inputStyle}
                      placeholder="00000"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#57ebdd' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ ...inputStyle, paddingLeft: '38px' }}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Mobile <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    style={inputStyle}
                    placeholder="Mobile (optional)"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#57ebdd' }} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      style={{ ...inputStyle, paddingLeft: '38px' }}
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Minimum 6 characters</p>
                </div>

                {error && (
                  <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: '#57ebdd', color: '#001123' }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <button
                onClick={handleMaybeLater}
                className="w-full text-sm text-center py-1 transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Maybe Later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
