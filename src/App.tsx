import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoadingScreen } from './components/LoadingScreen';
import { Viewfinder } from './components/camera/Viewfinder';
import { AuthModal } from './components/AuthModal';
import { authService } from './services/auth';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [oauthUpgradeProcessed, setOauthUpgradeProcessed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoadingScreen(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (!authLoading && user && !oauthUpgradeProcessed && authService.isPendingOAuthUpgrade()) {
        const result = await authService.handleOAuthUpgradeCallback();
        setOauthUpgradeProcessed(true);

        if (result.success) {
          console.log('OAuth upgrade completed successfully');
        } else if (result.error) {
          console.error('OAuth upgrade failed:', result.error);
        }
      }
    };

    handleOAuthCallback();
  }, [authLoading, user, oauthUpgradeProcessed]);

  useEffect(() => {
    if (!authLoading && !user && !showLoadingScreen) {
      setShowAuthModal(true);
    }
  }, [authLoading, user, showLoadingScreen]);

  if (showLoadingScreen) {
    return <LoadingScreen />;
  }

  if (!user && !authLoading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => setShowAuthModal(false)}
          />
        )}
      </div>
    );
  }

  return <Viewfinder />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;