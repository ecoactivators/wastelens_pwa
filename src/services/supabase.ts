import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

class SupabaseService {
  private client: SupabaseClient<Database> | null = null;
  private supabaseUrl: string;
  private supabaseAnonKey: string;

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    this.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      console.warn('Supabase credentials not found. Database features will not work.');
      return;
    }

    try {
      this.client = createClient<Database>(this.supabaseUrl, this.supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      console.log('Supabase client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
    }
  }

  getClient(): SupabaseClient<Database> | null {
    return this.client;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }
}

export const supabaseService = new SupabaseService();
export const supabase = supabaseService.getClient();
