export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          email: string | null;
          full_name: string | null;
          is_anonymous: boolean;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          email?: string | null;
          full_name?: string | null;
          is_anonymous?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          email?: string | null;
          full_name?: string | null;
          is_anonymous?: boolean;
        };
      };
      snaps: {
        Row: {
          id: string;
          user_id: string;
          timestamp: number;
          latitude: number | null;
          longitude: number | null;
          image_storage_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          timestamp: number;
          latitude?: number | null;
          longitude?: number | null;
          image_storage_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          timestamp?: number;
          latitude?: number | null;
          longitude?: number | null;
          image_storage_url?: string;
          created_at?: string;
        };
      };
      waste_analysis_results: {
        Row: {
          id: string;
          snap_id: string;
          user_id: string;
          analysis_json: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          snap_id: string;
          user_id: string;
          analysis_json: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          snap_id?: string;
          user_id?: string;
          analysis_json?: Record<string, any>;
          created_at?: string;
        };
      };
      user_activity_logs: {
        Row: {
          id: string;
          user_id: string;
          activity_type: string;
          activity_data: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_type: string;
          activity_data?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_type?: string;
          activity_data?: Record<string, any>;
          created_at?: string;
        };
      };
    };
  };
}
