@@ .. @@
 interface LoginPageProps {
   onSwitchToSignup: () => void;
+  onProceedAsGuest: () => void;
 }

-export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignup }) => {
+export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignup, onProceedAsGuest }) => {
   const [username, setUsername] = useState('');
@@ .. @@
           </div>
           
           <button
             onClick={onSwitchToSignup}
             className="text-primary-accent-cyan hover:text-primary-accent-pink transition-colors text-sm font-medium"
           >
             Create Account
           </button>
+          
+          <div className="mt-6 pt-6 border-t border-primary-accent-pink/20">
+            <button
+              onClick={onProceedAsGuest}
+              className="w-full text-secondary-gold hover:text-secondary-white transition-colors text-sm font-medium underline"
+            >
+              Proceed as Guest
+            </button>
+          </div>
         </div>
       </div>
     </div>