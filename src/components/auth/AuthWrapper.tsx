@@ .. @@
 export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
-  const { isAuthenticated, loading } = useAuth();
+  const { isAuthenticated, loading, proceedAsGuest } = useAuth();
   const [currentView, setCurrentView] = useState<'login' | 'signup'>('login');

@@ .. @@
   if (!isAuthenticated) {
     return (
       <>
         {currentView === 'login' && (
           <LoginPage 
             onSwitchToSignup={() => setCurrentView('signup')}
+            onProceedAsGuest={proceedAsGuest}
           />
         )}
         {currentView === 'signup' && (