export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated, loading, proceedAsGuest } = useAuth();
  const [currentView, setCurrentView] = useState<'login' | 'signup'>('login');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <>
        {currentView === 'login' && (
          <LoginPage 
            onSwitchToSignup={() => setCurrentView('signup')}
            onProceedAsGuest={proceedAsGuest}
          />
        )}
        {currentView === 'signup' && (
          <SignupPage 
            onSwitchToLogin={() => setCurrentView('login')}
          />
        )}
      </>
    );
  }

  return <>{children}</>;
};