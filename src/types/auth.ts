@@ .. @@
 export interface AuthContextType {
   user: User | null;
   isAuthenticated: boolean;
   loading: boolean;
   login: (username: string, password: string) => boolean;
   signup: (username: string, password: string, confirmPassword: string) => { success: boolean; error?: string };
+  proceedAsGuest: () => boolean;
   logout: () => void;
 }