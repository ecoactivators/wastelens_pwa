//import React from 'react';
import { useState, useEffect } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { Viewfinder } from './components/camera/Viewfinder';

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

  return <Viewfinder />;
}

export default App;