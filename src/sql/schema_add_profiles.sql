-- schema_add_profiles.sql
-- Run this in the Supabase SQL Editor

-- 1. Create the profiles table
-- Stores public profile information linked to auth.users
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE, -- Foreign key linked to auth.users
  updated_at timestamptz,
  full_name text,
  avatar_url text,
  -- Add other profile fields as needed, e.g.:
  -- tenant_id uuid REFERENCES public.tenants, -- If you want to link profiles to tenants here
  -- job_title text,

  PRIMARY KEY (id)
);

-- Optional: Add comments to clarify columns
COMMENT ON COLUMN public.profiles.id IS 'Links to auth.users.id';
COMMENT ON COLUMN public.profiles.full_name IS 'User''s full name';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL for user''s avatar image';

-- 2. Enable RLS for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for profiles
--    - Allow users to view their own profile
--    - Allow users to update their own profile
--    - Allow platform admins to view ALL profiles (needed for User Management)
--    - Allow platform admins to update ALL profiles (needed for User Management)

DROP POLICY IF EXISTS "Allow individual read access" ON public.profiles;
CREATE POLICY "Allow individual read access" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow individual update access" ON public.profiles;
CREATE POLICY "Allow individual update access" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow platform admin read access" ON public.profiles;
CREATE POLICY "Allow platform admin read access" ON public.profiles
  FOR SELECT USING (is_platform_admin()); -- Assumes is_platform_admin() function exists

DROP POLICY IF EXISTS "Allow platform admin update access" ON public.profiles;
CREATE POLICY "Allow platform admin update access" ON public.profiles
  FOR UPDATE USING (is_platform_admin()) WITH CHECK (is_platform_admin()); -- Assumes is_platform_admin() function exists

-- Grant authenticated users permissions on profiles table (RLS handles row access)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; -- Ensure schema usage

-- 4. Create a trigger function to automatically create a profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Important: Allows function to write to profiles table
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name', -- Attempt to get full_name from metadata if provided at signup
    NEW.raw_user_meta_data ->> 'avatar_url' -- Attempt to get avatar_url from metadata if provided at signup
  );
  RETURN NEW;
END;
$$;

-- 5. Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Optional: Ensure function ownership and permissions if needed
-- ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
-- GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin; -- Or relevant role

-- Optional: Backfill profiles for existing users (run this manually if needed)
/*
INSERT INTO public.profiles (id, full_name, avatar_url)
SELECT id, raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING; -- Avoid errors if a profile already exists
*/
