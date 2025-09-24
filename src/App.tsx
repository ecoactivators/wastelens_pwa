import React from 'react';
import { useState, useEffect } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { Viewfinder } from './components/camera/Viewfinder';
import { AuthWrapper } from './components/auth/AuthWrapper';
import { AuthProvider } from './hooks/useAuth';

function App() {
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);

  useEffect(() => {
    // Show loading screen for 3 seconds before transitioning to main app
    const timer = setTimeout(() => {
      setShowLoadingScreen(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showLoadingScreen) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <AuthWrapper>
        <Viewfinder />
      </AuthWrapper>
    </AuthProvider>
  );
}

export default App;