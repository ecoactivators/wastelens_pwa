@@ .. @@
   const login = (username: string, password: string): boolean => {
     // For now, accept any username/password combination
     // TODO: Replace with real authentication logic
     const user: User = {
       id: `user_${Date.now()}`,
       username,
       email: `${username}@example.com`, // Mock email
     };
     
     setUser(user);
     setIsAuthenticated(true);
     localStorage.setItem('waste_lens_user', JSON.stringify(user));
     return true;
   };

+  const proceedAsGuest = (): boolean => {
+    // Create a guest user session
+    const guestUser: User = {
+      id: `guest_${Date.now()}`,
+      username: 'Guest User',
+      email: 'guest@wastelens.com',
+    };
+    
+    setUser(guestUser);
+    setIsAuthenticated(true);
+    localStorage.setItem('waste_lens_user', JSON.stringify(guestUser));
+    return true;
+  };

   const signup = (username: string, password: string, confirmPassword: string): { success: boolean; error?: string } => {
@@ .. @@
   return {
     user,
     isAuthenticated,
     loading,
     login,
     signup,
+    proceedAsGuest,
     logout,
   };
 };