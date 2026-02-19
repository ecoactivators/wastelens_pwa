/*
  # Fix RLS Performance and Security Issues

  ## Overview
  This migration optimizes Row Level Security (RLS) policies and fixes security issues identified by Supabase database advisor.

  ## Changes Made

  ### 1. RLS Performance Optimization
  All RLS policies now use `(select auth.uid())` instead of `auth.uid()` to prevent re-evaluation for each row.
  This significantly improves query performance at scale.

  **Tables affected:**
  - user_profiles (3 policies)
  - snaps (3 policies)
  - waste_analysis_results (2 policies)
  - user_activity_logs (2 policies)
  - resell_listings (4 policies)
  - resell_listing_media (4 policies)

  ### 2. Unused Index Removal
  Removed redundant and unused indexes to reduce storage overhead and improve write performance:
  - idx_user_profiles_user_id (redundant with primary key)
  - idx_snaps_created_at (unused)
  - idx_snaps_timestamp (unused)
  - idx_waste_analysis_snap_id (unused)
  - idx_waste_analysis_created_at (unused)
  - idx_activity_logs_created_at (unused)
  - resell_listings_status_idx (unused)
  - resell_listing_media_listing_id_idx (unused)

  **Kept essential indexes:**
  - idx_snaps_user_id (used for user snap queries)
  - idx_waste_analysis_user_id (used for user analysis queries)
  - idx_activity_logs_user_id (used for user activity queries)
  - resell_listings_user_id_idx (used for user listing queries)

  ### 3. Function Security
  Fixed mutable search_path security issues in functions by setting explicit search_path.

  ### 4. Anonymous Access
  Policies are restricted to authenticated users only, preventing anonymous access.

  ## Security Impact
  - ✅ Improved RLS query performance (no re-evaluation per row)
  - ✅ Reduced attack surface (explicit search_path in functions)
  - ✅ Anonymous access properly restricted
  - ✅ Reduced storage overhead from unused indexes

  ## Important Notes
  - All existing data and functionality is preserved
  - No breaking changes to application code
  - Performance improvements will be immediate
*/

-- ============================================================================
-- PART 1: DROP AND RECREATE RLS POLICIES WITH OPTIMIZED auth.uid() CALLS
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users can view own snaps" ON snaps;
DROP POLICY IF EXISTS "Users can insert own snaps" ON snaps;
DROP POLICY IF EXISTS "Users can delete own snaps" ON snaps;

DROP POLICY IF EXISTS "Users can view own analysis results" ON waste_analysis_results;
DROP POLICY IF EXISTS "Users can insert own analysis results" ON waste_analysis_results;

DROP POLICY IF EXISTS "Users can view own activity logs" ON user_activity_logs;
DROP POLICY IF EXISTS "Users can insert own activity logs" ON user_activity_logs;

DROP POLICY IF EXISTS "Users can view own listings" ON resell_listings;
DROP POLICY IF EXISTS "Users can create own listings" ON resell_listings;
DROP POLICY IF EXISTS "Users can update own listings" ON resell_listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON resell_listings;

DROP POLICY IF EXISTS "Users can view own listing media" ON resell_listing_media;
DROP POLICY IF EXISTS "Users can create own listing media" ON resell_listing_media;
DROP POLICY IF EXISTS "Users can update own listing media" ON resell_listing_media;
DROP POLICY IF EXISTS "Users can delete own listing media" ON resell_listing_media;

-- ============================================================================
-- OPTIMIZED RLS POLICIES - user_profiles
-- ============================================================================

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- OPTIMIZED RLS POLICIES - snaps
-- ============================================================================

CREATE POLICY "Users can view own snaps"
  ON snaps FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own snaps"
  ON snaps FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own snaps"
  ON snaps FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- OPTIMIZED RLS POLICIES - waste_analysis_results
-- ============================================================================

CREATE POLICY "Users can view own analysis results"
  ON waste_analysis_results FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own analysis results"
  ON waste_analysis_results FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- OPTIMIZED RLS POLICIES - user_activity_logs
-- ============================================================================

CREATE POLICY "Users can view own activity logs"
  ON user_activity_logs FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own activity logs"
  ON user_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- OPTIMIZED RLS POLICIES - resell_listings
-- ============================================================================

CREATE POLICY "Users can view own listings"
  ON resell_listings FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own listings"
  ON resell_listings FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own listings"
  ON resell_listings FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own listings"
  ON resell_listings FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- OPTIMIZED RLS POLICIES - resell_listing_media
-- ============================================================================

CREATE POLICY "Users can view own listing media"
  ON resell_listing_media FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) IN (
      SELECT user_id FROM resell_listings WHERE id = listing_id
    )
  );

CREATE POLICY "Users can create own listing media"
  ON resell_listing_media FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) IN (
      SELECT user_id FROM resell_listings WHERE id = listing_id
    )
  );

CREATE POLICY "Users can update own listing media"
  ON resell_listing_media FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) IN (
      SELECT user_id FROM resell_listings WHERE id = listing_id
    )
  )
  WITH CHECK (
    (select auth.uid()) IN (
      SELECT user_id FROM resell_listings WHERE id = listing_id
    )
  );

CREATE POLICY "Users can delete own listing media"
  ON resell_listing_media FOR DELETE
  TO authenticated
  USING (
    (select auth.uid()) IN (
      SELECT user_id FROM resell_listings WHERE id = listing_id
    )
  );

-- ============================================================================
-- PART 2: DROP UNUSED INDEXES
-- ============================================================================

-- Drop redundant index (id is already primary key)
DROP INDEX IF EXISTS idx_user_profiles_user_id;

-- Drop unused timestamp indexes
DROP INDEX IF EXISTS idx_snaps_created_at;
DROP INDEX IF EXISTS idx_snaps_timestamp;
DROP INDEX IF EXISTS idx_waste_analysis_created_at;
DROP INDEX IF EXISTS idx_activity_logs_created_at;

-- Drop unused snap_id index
DROP INDEX IF EXISTS idx_waste_analysis_snap_id;

-- Drop unused resell listing indexes
DROP INDEX IF EXISTS resell_listings_status_idx;
DROP INDEX IF EXISTS resell_listing_media_listing_id_idx;

-- Keep essential user_id indexes that are actively used by queries:
-- - idx_snaps_user_id
-- - idx_waste_analysis_user_id
-- - idx_activity_logs_user_id
-- - resell_listings_user_id_idx

-- ============================================================================
-- PART 3: FIX FUNCTION SECURITY (Mutable Search Path)
-- ============================================================================

-- Recreate update_updated_at_column with explicit search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate handle_new_user with explicit search_path
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, is_anonymous)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.is_anonymous
  );
  RETURN NEW;
END;
$$;

-- ============================================================================
-- PART 4: ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "Users can view own profile" ON user_profiles IS 
  'Optimized RLS policy using (select auth.uid()) to prevent per-row re-evaluation';

COMMENT ON POLICY "Users can view own snaps" ON snaps IS 
  'Optimized RLS policy using (select auth.uid()) to prevent per-row re-evaluation';

COMMENT ON POLICY "Users can view own analysis results" ON waste_analysis_results IS 
  'Optimized RLS policy using (select auth.uid()) to prevent per-row re-evaluation';

COMMENT ON POLICY "Users can view own activity logs" ON user_activity_logs IS 
  'Optimized RLS policy using (select auth.uid()) to prevent per-row re-evaluation';

COMMENT ON POLICY "Users can view own listings" ON resell_listings IS 
  'Optimized RLS policy using (select auth.uid()) to prevent per-row re-evaluation';

COMMENT ON POLICY "Users can view own listing media" ON resell_listing_media IS 
  'Optimized RLS policy using (select auth.uid()) to prevent per-row re-evaluation';
