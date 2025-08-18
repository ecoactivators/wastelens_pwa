import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show our custom install prompt after a delay
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    setDeferredPrompt(null);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-primary-bg border border-primary-accent-pink/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary-accent-pink/20 rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-primary-accent-pink" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-secondary-white font-semibold text-sm mb-1">
              Add Waste Lens™ to Home Screen
            </h3>
            <p className="text-secondary-gold text-xs leading-relaxed mb-3">
              Install our app for quick access and a better experience
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="px-4 py-2 bg-primary-accent-pink text-secondary-white text-xs font-semibold rounded-lg hover:bg-primary-accent-pink/90 transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-secondary-gold text-xs font-medium hover:text-secondary-white transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-secondary-gold hover:text-secondary-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};