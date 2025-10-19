/*
  # Waste Lens Database Schema

  ## Overview
  Creates the complete database schema for Waste Lens PWA with support for:
  - User profiles (extends Supabase auth.users)
  - Snap metadata with location data
  - AI waste analysis results
  - User activity tracking for agent learning

  ## New Tables

  ### `user_profiles`
  Extends Supabase auth.users with custom profile fields
  - `id` (uuid, primary key, references auth.users)
  - `created_at` (timestamptz, defaults to now())
  - `updated_at` (timestamptz, defaults to now())
  - `email` (text, nullable for anonymous users)
  - `full_name` (text, nullable)
  - `is_anonymous` (boolean, defaults to true for guest users)

  ### `snaps`
  Stores metadata for captured waste images
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `timestamp` (bigint, Unix timestamp when photo was captured)
  - `latitude` (numeric, nullable GPS coordinate)
  - `longitude` (numeric, nullable GPS coordinate)
  - `image_storage_url` (text, Supabase Storage URL for image)
  - `created_at` (timestamptz, defaults to now())

  ### `waste_analysis_results`
  Stores AI analysis results from OpenAI
  - `id` (uuid, primary key)
  - `snap_id` (uuid, foreign key to snaps)
  - `user_id` (uuid, foreign key to auth.users)
  - `analysis_json` (jsonb, full WasteAnalysisResponse from OpenAI)
  - `created_at` (timestamptz, defaults to now())

  ### `user_activity_logs`
  Tracks user engagement and activity for agent learning
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `activity_type` (text, type of activity: snap_success, idle_training_shown, etc.)
  - `activity_data` (jsonb, additional context data)
  - `created_at` (timestamptz, defaults to now())

  ## Security (RLS Policies)

  ### user_profiles
  - Users can view only their own profile
  - Users can update only their own profile
  - Users can insert their own profile on signup

  ### snaps
  - Users can view only their own snaps
  - Users can insert their own snaps
  - Users can delete their own snaps

  ### waste_analysis_results
  - Users can view only their own analysis results
  - Users can insert their own analysis results

  ### user_activity_logs
  - Users can view only their own activity logs
  - Users can insert their own activity logs

  ## Indexes
  - user_id indexes on all tables for fast user data queries
  - snap_id index on waste_analysis_results for fast lookups
  - created_at indexes for chronological sorting
  - timestamp index on snaps for chronological ordering

  ## Important Notes
  - All tables use ON DELETE CASCADE for user_id foreign keys
  - Anonymous users are supported via is_anonymous flag
  - Location data is optional (nullable lat/long)
  - Images are stored in Supabase Storage, not database
  - JSONB used for flexible analysis storage
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  email text,
  full_name text,
  is_anonymous boolean DEFAULT true NOT NULL
);

-- Create snaps table
CREATE TABLE IF NOT EXISTS snaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp bigint NOT NULL,
  latitude numeric(10, 6),
  longitude numeric(10, 6),
  image_storage_url text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create waste_analysis_results table
CREATE TABLE IF NOT EXISTS waste_analysis_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snap_id uuid NOT NULL REFERENCES snaps(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_json jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create user_activity_logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  activity_data jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_snaps_user_id ON snaps(user_id);
CREATE INDEX IF NOT EXISTS idx_snaps_created_at ON snaps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_snaps_timestamp ON snaps(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_waste_analysis_user_id ON waste_analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_waste_analysis_snap_id ON waste_analysis_results(snap_id);
CREATE INDEX IF NOT EXISTS idx_waste_analysis_created_at ON waste_analysis_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON user_activity_logs(created_at DESC);

-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE snaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for snaps
CREATE POLICY "Users can view own snaps"
  ON snaps FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own snaps"
  ON snaps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own snaps"
  ON snaps FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for waste_analysis_results
CREATE POLICY "Users can view own analysis results"
  ON waste_analysis_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis results"
  ON waste_analysis_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_activity_logs
CREATE POLICY "Users can view own activity logs"
  ON user_activity_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity logs"
  ON user_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile automatically on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, is_anonymous)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.is_anonymous
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();