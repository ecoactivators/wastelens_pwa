import { supabase } from './supabase';
import { WasteAnalysisResponse } from '../types/waste';

export interface SnapRecord {
  id: string;
  user_id: string;
  timestamp: number;
  latitude: number | null;
  longitude: number | null;
  image_storage_url: string;
  created_at: string;
}

export interface AnalysisRecord {
  id: string;
  snap_id: string;
  user_id: string;
  analysis_json: WasteAnalysisResponse;
  created_at: string;
}

export interface ActivityLogRecord {
  id: string;
  user_id: string;
  activity_type: string;
  activity_data: Record<string, any>;
  created_at: string;
}

export interface UserProfile {
  id: string;
  created_at: string;
  updated_at: string;
  email: string | null;
  full_name: string | null;
  is_anonymous: boolean;
}

export class DatabaseService {
  async createSnap(
    userId: string,
    timestamp: number,
    imageStorageUrl: string,
    latitude?: number,
    longitude?: number
  ): Promise<SnapRecord | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabase
        .from('snaps')
        .insert({
          user_id: userId,
          timestamp,
          image_storage_url: imageStorageUrl,
          latitude: latitude ?? null,
          longitude: longitude ?? null,
        })
        .select()
        .single();

      if (error) {
        console.error('Create snap error:', error);
        throw new Error(`Failed to create snap: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Create snap failed:', error);
      throw error;
    }
  }

  async getSnapById(snapId: string): Promise<SnapRecord | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabase
        .from('snaps')
        .select('*')
        .eq('id', snapId)
        .maybeSingle();

      if (error) {
        console.error('Get snap error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get snap failed:', error);
      return null;
    }
  }

  async getUserSnaps(userId: string, limit = 50): Promise<SnapRecord[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabase
        .from('snaps')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Get user snaps error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get user snaps failed:', error);
      return [];
    }
  }

  async deleteSnap(snapId: string): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { error } = await supabase
        .from('snaps')
        .delete()
        .eq('id', snapId);

      if (error) {
        console.error('Delete snap error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete snap failed:', error);
      return false;
    }
  }

  async createAnalysis(
    snapId: string,
    userId: string,
    analysisJson: WasteAnalysisResponse
  ): Promise<AnalysisRecord | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabase
        .from('waste_analysis_results')
        .insert({
          snap_id: snapId,
          user_id: userId,
          analysis_json: analysisJson as any,
        })
        .select()
        .single();

      if (error) {
        console.error('Create analysis error:', error);
        throw new Error(`Failed to create analysis: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Create analysis failed:', error);
      throw error;
    }
  }

  async getAnalysisForSnap(snapId: string): Promise<AnalysisRecord | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabase
        .from('waste_analysis_results')
        .select('*')
        .eq('snap_id', snapId)
        .maybeSingle();

      if (error) {
        console.error('Get analysis error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get analysis failed:', error);
      return null;
    }
  }

  async getUserAnalyses(userId: string, limit = 50): Promise<AnalysisRecord[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabase
        .from('waste_analysis_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Get user analyses error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get user analyses failed:', error);
      return [];
    }
  }

  async logActivity(
    userId: string,
    activityType: string,
    activityData: Record<string, any> = {}
  ): Promise<ActivityLogRecord | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: userId,
          activity_type: activityType,
          activity_data: activityData as any,
        })
        .select()
        .single();

      if (error) {
        console.error('Log activity error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Log activity failed:', error);
      return null;
    }
  }

  async getUserActivityLogs(userId: string, limit = 100): Promise<ActivityLogRecord[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Get activity logs error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get activity logs failed:', error);
      return [];
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Get user profile error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get user profile failed:', error);
      return null;
    }
  }

  async updateUserProfile(
    userId: string,
    updates: Partial<Pick<UserProfile, 'email' | 'full_name' | 'is_anonymous'>>
  ): Promise<UserProfile | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Update user profile error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Update user profile failed:', error);
      return null;
    }
  }
}

export const databaseService = new DatabaseService();
