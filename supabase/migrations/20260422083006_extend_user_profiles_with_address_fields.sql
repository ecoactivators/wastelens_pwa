/*
  # Extend user_profiles with new registration fields

  ## Overview
  The original registration form collected only Full Name + Email. The new Create Account
  form captures First Name, Last Name, Street, Apt/Unit, City, State, Zip, Email, Mobile,
  and Password. This migration additively extends the existing `user_profiles` table with
  the new columns so registration data can be persisted without dropping existing data.

  NOTE: We intentionally do NOT drop the existing `user_profiles` table. Dropping is a
  destructive operation and the table is referenced by triggers and is linked to
  auth.users via foreign key. Instead, we add the new columns (all nullable so existing
  rows remain valid) and leave the previous `full_name` column in place.

  ## Changes
  1. Add columns to `user_profiles`:
     - `first_name` (text, nullable)
     - `last_name` (text, nullable)
     - `street` (text, nullable)
     - `apt_unit` (text, nullable)
     - `city` (text, nullable)
     - `state` (text, 2 chars, nullable)
     - `zip` (text, nullable)
     - `mobile` (text, nullable)

  ## Security
  - `user_profiles` already has RLS enabled with policies for SELECT/INSERT/UPDATE scoped
    to `auth.uid() = id`. No changes to policies are required; the new columns inherit
    the existing row-level protections.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'first_name') THEN
    ALTER TABLE user_profiles ADD COLUMN first_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'last_name') THEN
    ALTER TABLE user_profiles ADD COLUMN last_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'street') THEN
    ALTER TABLE user_profiles ADD COLUMN street text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'apt_unit') THEN
    ALTER TABLE user_profiles ADD COLUMN apt_unit text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'city') THEN
    ALTER TABLE user_profiles ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'state') THEN
    ALTER TABLE user_profiles ADD COLUMN state text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'zip') THEN
    ALTER TABLE user_profiles ADD COLUMN zip text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'mobile') THEN
    ALTER TABLE user_profiles ADD COLUMN mobile text;
  END IF;
END $$;
