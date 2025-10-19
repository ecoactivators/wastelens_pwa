import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoadingScreen } from './components/LoadingScreen';
import { Viewfinder } from './components/camera/Viewfinder';
import { AuthModal } from './components/AuthModal';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoadingScreen(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

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