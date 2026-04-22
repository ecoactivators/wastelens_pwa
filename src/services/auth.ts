import { supabase } from './supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface ProfileFields {
  firstName?: string;
  lastName?: string;
  street?: string;
  aptUnit?: string;
  city?: string;
  state?: string;
  zip?: string;
  mobile?: string;
}

async function upsertProfileFields(userId: string, email: string, fullName: string | undefined, fields: ProfileFields | undefined) {
  if (!supabase || !fields) return;
  try {
    await supabase.from('user_profiles').upsert(
      {
        id: userId,
        email,
        full_name: fullName || null,
        first_name: fields.firstName || null,
        last_name: fields.lastName || null,
        street: fields.street || null,
        apt_unit: fields.aptUnit || null,
        city: fields.city || null,
        state: fields.state || null,
        zip: fields.zip || null,
        mobile: fields.mobile || null,
        is_anonymous: false,
      },
      { onConflict: 'id' }
    );
  } catch (err) {
    console.error('Failed to upsert profile fields:', err);
  }
}

export class AuthService {
  async signInAnonymously(): Promise<AuthResult> {
    if (!supabase) {
      return {
        user: null,
        session: null,
        error: { message: 'Supabase client not initialized', name: 'ConfigError', status: 500 } as AuthError,
      };
    }

    try {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.error('Anonymous sign in error:', error);
        return { user: null, session: null, error };
      }

      console.log('Anonymous user signed in:', data.user?.id);
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Anonymous sign in failed:', error);
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }

  async signUpWithEmail(email: string, password: string, fullName?: string, profileFields?: ProfileFields): Promise<AuthResult> {
    if (!supabase) {
      return {
        user: null,
        session: null,
        error: { message: 'Supabase client not initialized', name: 'ConfigError', status: 500 } as AuthError,
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        return { user: null, session: null, error };
      }

      console.log('User signed up:', data.user?.id);
      if (data.user?.id) {
        await upsertProfileFields(data.user.id, email, fullName, profileFields);
      }
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Sign up failed:', error);
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }

  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    if (!supabase) {
      return {
        user: null,
        session: null,
        error: { message: 'Supabase client not initialized', name: 'ConfigError', status: 500 } as AuthError,
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { user: null, session: null, error };
      }

      console.log('User signed in:', data.user?.id);
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Sign in failed:', error);
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }

  async signInWithOAuth(
    provider: 'google' | 'github' | 'facebook',
    options?: { isUpgrade?: boolean; redirectPath?: string }
  ): Promise<{ error: AuthError | null }> {
    if (!supabase) {
      return {
        error: { message: 'Supabase client not initialized', name: 'ConfigError', status: 500 } as AuthError,
      };
    }

    try {
      if (options?.isUpgrade) {
        const { data: currentUser } = await supabase.auth.getUser();
        if (currentUser?.user?.is_anonymous) {
          localStorage.setItem('pendingOAuthUpgrade', 'true');
          localStorage.setItem('anonymousUserId', currentUser.user.id);
          if (options.redirectPath) {
            localStorage.setItem('oauthRedirectPath', options.redirectPath);
          }
        }
      }

      const redirectPath = options?.redirectPath || window.location.pathname;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}${redirectPath}`,
        },
      });

      if (error) {
        console.error('OAuth sign in error:', error);
        localStorage.removeItem('pendingOAuthUpgrade');
        localStorage.removeItem('anonymousUserId');
        localStorage.removeItem('oauthRedirectPath');
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('OAuth sign in failed:', error);
      localStorage.removeItem('pendingOAuthUpgrade');
      localStorage.removeItem('anonymousUserId');
      localStorage.removeItem('oauthRedirectPath');
      return { error: error as AuthError };
    }
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    if (!supabase) {
      return {
        error: { message: 'Supabase client not initialized', name: 'ConfigError', status: 500 } as AuthError,
      };
    }

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
        return { error };
      }

      console.log('User signed out');
      return { error: null };
    } catch (error) {
      console.error('Sign out failed:', error);
      return { error: error as AuthError };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch (error) {
      console.error('Get current user failed:', error);
      return null;
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch (error) {
      console.error('Get current session failed:', error);
      return null;
    }
  }

  isAnonymousUser(user: User | null): boolean {
    return user?.is_anonymous === true;
  }

  onAuthStateChange(callback: (user: User | null, session: Session | null) => void) {
    if (!supabase) {
      return { unsubscribe: () => {} };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        const user = session?.user ?? null;
        callback(user, session);
      })();
    });

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  }

  async upgradeAnonymousToEmail(email: string, password: string, fullName?: string, profileFields?: ProfileFields): Promise<AuthResult> {
    if (!supabase) {
      return {
        user: null,
        session: null,
        error: { message: 'Supabase client not initialized', name: 'ConfigError', status: 500 } as AuthError,
      };
    }

    try {
      const { data: currentUser } = await supabase.auth.getUser();

      if (!currentUser.user || !currentUser.user.is_anonymous) {
        return {
          user: null,
          session: null,
          error: { message: 'User is not anonymous', name: 'UpgradeError', status: 400 } as AuthError,
        };
      }

      const { data, error } = await supabase.auth.updateUser({
        email,
        password,
        data: {
          full_name: fullName,
        },
      });

      if (error) {
        console.error('Upgrade anonymous user error:', error);
        return { user: null, session: null, error };
      }

      console.log('Anonymous user upgraded to registered:', data.user?.id);
      if (data.user?.id) {
        await upsertProfileFields(data.user.id, email, fullName, profileFields);
      }
      return { user: data.user, session: null, error: null };
    } catch (error) {
      console.error('Upgrade anonymous user failed:', error);
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }

  async handleOAuthUpgradeCallback(): Promise<{ success: boolean; error?: string }> {
    const isPendingUpgrade = localStorage.getItem('pendingOAuthUpgrade');
    const anonymousUserId = localStorage.getItem('anonymousUserId');

    if (!isPendingUpgrade || !anonymousUserId) {
      return { success: false };
    }

    try {
      const { data: currentUser } = await supabase?.auth.getUser() || { data: null };

      if (!currentUser?.user) {
        localStorage.removeItem('pendingOAuthUpgrade');
        localStorage.removeItem('anonymousUserId');
        localStorage.removeItem('oauthRedirectPath');
        return { success: false, error: 'No user found after OAuth' };
      }

      if (currentUser.user.is_anonymous) {
        localStorage.removeItem('pendingOAuthUpgrade');
        localStorage.removeItem('anonymousUserId');
        localStorage.removeItem('oauthRedirectPath');
        return { success: false, error: 'Still anonymous after OAuth' };
      }

      console.log('OAuth upgrade successful:', currentUser.user.id);
      localStorage.removeItem('pendingOAuthUpgrade');
      localStorage.removeItem('anonymousUserId');
      localStorage.removeItem('oauthRedirectPath');

      return { success: true };
    } catch (error) {
      console.error('OAuth upgrade callback failed:', error);
      localStorage.removeItem('pendingOAuthUpgrade');
      localStorage.removeItem('anonymousUserId');
      localStorage.removeItem('oauthRedirectPath');
      return { success: false, error: 'Failed to process OAuth upgrade' };
    }
  }

  isPendingOAuthUpgrade(): boolean {
    return localStorage.getItem('pendingOAuthUpgrade') === 'true';
  }

  getOAuthRedirectPath(): string | null {
    return localStorage.getItem('oauthRedirectPath');
  }
}

export const authService = new AuthService();
