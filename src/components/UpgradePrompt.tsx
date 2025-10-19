import React, { useState } from 'react';
import { X, Mail, Lock, Crown } from 'lucide-react';
import { authService } from '../services/auth';

interface UpgradePromptProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await authService.upgradeAnonymousToEmail(email, password);

      if (result.error) {
        setError(result.error.message);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to upgrade account. Please try again.');
    } finally {
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
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-accent-cyan/20 rounded-full mb-4">
                <Crown className="w-8 h-8 text-primary-accent-cyan" />
              </div>
              <h2 className="text-2xl font-bold text-secondary-white mb-2">Upgrade Your Account</h2>
              <p className="text-secondary-white/80">
                Create an account to access premium features like Agent Handle and sync your data across devices
              </p>
            </div>

            <form onSubmit={handleUpgrade} className="space-y-4">
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
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary"
                >
                  {loading ? 'Upgrading Account...' : 'Upgrade Account'}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full px-6 py-3 bg-transparent text-secondary-white/80 border border-secondary-white/20 rounded-xl hover:bg-secondary-white/10 transition-colors font-medium"
                >
                  Maybe Later
                </button>
              </div>
            </form>

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
        </div>
      </div>
    </div>
  );
};
