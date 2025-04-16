-- RLS Policy for Tenants Table (Platform Admin Access)
-- Run this in the Supabase SQL Editor if you haven't already applied the full rls.sql script
-- or if you want to ensure this specific policy is in place.

-- 1. Enable RLS on the table (if not already enabled)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 2. Drop any potentially conflicting older policies (optional, but good practice)
-- If you used a different name previously, adjust the name here.
DROP POLICY IF EXISTS "Allow platform admin full access on tenants" ON public.tenants;
DROP POLICY IF EXISTS "Allow platform admin select on tenants" ON public.tenants;
DROP POLICY IF EXISTS "Allow platform admin update on tenants" ON public.tenants;

-- 3. Create policy granting SELECT and UPDATE to platform admins
-- We use 'FOR ALL' as it's simpler and covers SELECT, UPDATE, INSERT, DELETE.
-- If you need finer control, you could create separate policies for SELECT and UPDATE.
CREATE POLICY "Allow platform admin full access on tenants" ON public.tenants
  FOR ALL -- Grants SELECT, INSERT, UPDATE, DELETE
  USING (is_platform_admin()) -- Specifies which rows the policy applies to for existing rows (SELECT, UPDATE, DELETE)
  WITH CHECK (is_platform_admin()); -- Specifies which rows can be created or modified (INSERT, UPDATE)

-- Note: This assumes the is_platform_admin() function correctly identifies platform admins
-- based on their JWT claims (e.g., app_metadata.claims_admin = true).

-- Optional: If you want *only* SELECT and UPDATE, not INSERT/DELETE for admins via RLS:
/*
-- Drop the 'FOR ALL' policy if you created it above
-- DROP POLICY IF EXISTS "Allow platform admin full access on tenants" ON public.tenants;

-- Policy for SELECT
CREATE POLICY "Allow platform admin select on tenants" ON public.tenants
  FOR SELECT
  USING (is_platform_admin());

-- Policy for UPDATE
CREATE POLICY "Allow platform admin update on tenants" ON public.tenants
  FOR UPDATE
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- You might need a separate policy or rely on service_role key for INSERT/DELETE if needed.
*/

-- Grant usage on schema and select on table to authenticated role
-- These grants are usually needed for users to interact with tables via RLS policies.
-- They might already be in place from initial Supabase setup or previous scripts.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tenants TO authenticated; -- Grant base permissions, RLS will restrict access.

-- Ensure the is_platform_admin() function is owned by postgres or a superuser for security definer context
-- Example: ALTER FUNCTION public.is_platform_admin() OWNER TO postgres;
-- Ensure the function has execute permission for authenticated users
-- Example: GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;

-- Ensure the function exists (it should be in your schema.sql)
-- Example check: SELECT proname FROM pg_proc WHERE proname = 'is_platform_admin';
