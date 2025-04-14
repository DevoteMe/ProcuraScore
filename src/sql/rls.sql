-- 2. Detailed RLS Policies (SQL)
-- Run these in the Supabase SQL Editor AFTER creating the schema and helper functions.

-- ** Tenants Table **
-- Platform Admins can see all tenants. Regular users cannot see the tenants table directly.
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow platform admin full access on tenants" ON public.tenants;
CREATE POLICY "Allow platform admin full access on tenants" ON public.tenants
  FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- ** Tenant Memberships Table **
ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;

-- Users can see their own memberships.
DROP POLICY IF EXISTS "Allow users to see their own memberships" ON public.tenant_memberships;
CREATE POLICY "Allow users to see their own memberships" ON public.tenant_memberships
  FOR SELECT
  USING (auth.uid() = user_id);

-- Tenant Admins can see memberships within their own tenant.
DROP POLICY IF EXISTS "Allow tenant admins to see memberships in their tenant" ON public.tenant_memberships;
CREATE POLICY "Allow tenant admins to see memberships in their tenant" ON public.tenant_memberships
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM public.tenant_memberships
      WHERE user_id = auth.uid() AND role = 'tenant_id_admin'
    )
  );

-- Tenant Admins can manage memberships within their tenant (Split Policies)
DROP POLICY IF EXISTS "Allow tenant admins to manage memberships in their tenant" ON public.tenant_memberships; -- Drop old combined policy if exists

DROP POLICY IF EXISTS "Allow tenant admins to insert memberships in their tenant" ON public.tenant_memberships;
CREATE POLICY "Allow tenant admins to insert memberships in their tenant" ON public.tenant_memberships
  FOR INSERT
  WITH CHECK (
     tenant_id IN (
      SELECT tenant_id
      FROM public.tenant_memberships
      WHERE user_id = auth.uid() AND role = 'tenant_id_admin'
    )
  );

DROP POLICY IF EXISTS "Allow tenant admins to update memberships in their tenant" ON public.tenant_memberships;
CREATE POLICY "Allow tenant admins to update memberships in their tenant" ON public.tenant_memberships
  FOR UPDATE
  USING (
     tenant_id IN (
      SELECT tenant_id
      FROM public.tenant_memberships
      WHERE user_id = auth.uid() AND role = 'tenant_id_admin'
    )
  )
  WITH CHECK (
     tenant_id IN (
      SELECT tenant_id
      FROM public.tenant_memberships
      WHERE user_id = auth.uid() AND role = 'tenant_id_admin'
    )
    -- Optional: Prevent tenant admin from removing themselves or changing their own role?
    -- AND auth.uid() != user_id -- Example: prevent self-modification
  );

DROP POLICY IF EXISTS "Allow tenant admins to delete memberships in their tenant" ON public.tenant_memberships;
CREATE POLICY "Allow tenant admins to delete memberships in their tenant" ON public.tenant_memberships
  FOR DELETE
  USING (
     tenant_id IN (
      SELECT tenant_id
      FROM public.tenant_memberships
      WHERE user_id = auth.uid() AND role = 'tenant_id_admin'
    )
    -- Optional: Prevent tenant admin from removing themselves?
    -- AND auth.uid() != user_id -- Example: prevent self-deletion
  );

-- Platform Admins can manage all memberships
DROP POLICY IF EXISTS "Allow platform admin full access on tenant_memberships" ON public.tenant_memberships;
CREATE POLICY "Allow platform admin full access on tenant_memberships" ON public.tenant_memberships
  FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- ** Projects Table **
-- *** PROJECTS CANNOT BE DELETED VIA RLS ***
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Members can read projects in their tenants
DROP POLICY IF EXISTS "Allow members to read projects in their tenants" ON public.projects;
CREATE POLICY "Allow members to read projects in their tenants" ON public.projects
  FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Tenant Admins can manage projects in their tenant (Split Policies, No Delete)
DROP POLICY IF EXISTS "Allow tenant admins to manage projects in their tenant" ON public.projects; -- Drop old combined policy

DROP POLICY IF EXISTS "Allow tenant admins to insert projects in their tenant" ON public.projects;
CREATE POLICY "Allow tenant admins to insert projects in their tenant" ON public.projects
  FOR INSERT
  WITH CHECK (get_user_role_in_tenant(tenant_id) = 'tenant_id_admin');

DROP POLICY IF EXISTS "Allow tenant admins to update projects in their tenant" ON public.projects;
CREATE POLICY "Allow tenant admins to update projects in their tenant" ON public.projects
  FOR UPDATE
  USING (get_user_role_in_tenant(tenant_id) = 'tenant_id_admin')
  WITH CHECK (get_user_role_in_tenant(tenant_id) = 'tenant_id_admin');

-- Platform Admins can access projects (Split Policies, No Delete)
DROP POLICY IF EXISTS "Allow platform admin access on projects" ON public.projects; -- Drop old combined policy

DROP POLICY IF EXISTS "Allow platform admin select on projects" ON public.projects;
CREATE POLICY "Allow platform admin select on projects" ON public.projects
  FOR SELECT
  USING (is_platform_admin());

DROP POLICY IF EXISTS "Allow platform admin insert on projects" ON public.projects;
CREATE POLICY "Allow platform admin insert on projects" ON public.projects
  FOR INSERT
  WITH CHECK (is_platform_admin());

DROP POLICY IF EXISTS "Allow platform admin update on projects" ON public.projects;
CREATE POLICY "Allow platform admin update on projects" ON public.projects
  FOR UPDATE
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());


-- ** Suppliers Table **
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Members can read suppliers
DROP POLICY IF EXISTS "Allow members to read suppliers in their tenant projects" ON public.suppliers;
CREATE POLICY "Allow members to read suppliers in their tenant projects" ON public.suppliers
  FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Tenant Admins can manage suppliers (Split Policies)
DROP POLICY IF EXISTS "Allow tenant admins to manage suppliers in their tenant projects" ON public.suppliers; -- Drop old combined policy

DROP POLICY IF EXISTS "Allow tenant admins to insert suppliers in their tenant projects" ON public.suppliers;
CREATE POLICY "Allow tenant admins to insert suppliers in their tenant projects" ON public.suppliers
  FOR INSERT
  WITH CHECK (get_user_role_in_tenant(tenant_id) = 'tenant_id_admin');

DROP POLICY IF EXISTS "Allow tenant admins to update suppliers in their tenant projects" ON public.suppliers;
CREATE POLICY "Allow tenant admins to update suppliers in their tenant projects" ON public.suppliers
  FOR UPDATE
  USING (get_user_role_in_tenant(tenant_id) = 'tenant_id_admin')
  WITH CHECK (get_user_role_in_tenant(tenant_id) = 'tenant_id_admin');

DROP POLICY IF EXISTS "Allow tenant admins to delete suppliers in their tenant projects" ON public.suppliers;
CREATE POLICY "Allow tenant admins to delete suppliers in their tenant projects" ON public.suppliers
  FOR DELETE
  USING (get_user_role_in_tenant(tenant_id) = 'tenant_id_admin');

-- Platform Admins can manage all suppliers
DROP POLICY IF EXISTS "Allow platform admin full access on suppliers" ON public.suppliers;
CREATE POLICY "Allow platform admin full access on suppliers" ON public.suppliers
  FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());


-- ** Criteria Categories Table **
ALTER TABLE public.criteria_categories ENABLE ROW LEVEL SECURITY;

-- Members can read categories
DROP POLICY IF EXISTS "Allow members to read categories in their tenant projects" ON public.criteria_categories;
CREATE POLICY "Allow members to read categories in their tenant projects" ON public.criteria_categories
  FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Tenant Admins can manage categories (Split Policies)
DROP POLICY IF EXISTS "Allow tenant admins to manage categories in their tenant projects" ON public.criteria_categories; -- Drop old combined policy

DROP POLICY IF EXISTS "Allow tenant admins to insert categories in their tenant projects" ON public.criteria_categories;
CREATE POLICY "Allow tenant admins to insert categories in their tenant projects" ON public.criteria_categories
  FOR INSERT
  WITH CHECK (get_user_role_in_tenant(tenant_id) = 'tenant_id_admin');

DROP POLICY IF EXISTS "Allow tenant admins to update categories in their tenant projects" ON public.criteria_categories;
CREATE POLICY "Allow tenant admins to update categories in their tenant projects" ON public.criteria_categories
  FOR UPDATE
  USING (get_user_role_in_tenant(tenant_id) = 'tenant_id_admin')
  WITH CHECK (get_user_role_in_tenant(tenant_id) = 'tenant_id_admin');

DROP POLICY IF EXISTS "Allow tenant admins to delete categories in their tenant projects" ON public.criteria_categories;
CREATE POLICY "Allow tenant admins to delete categories in their tenant projects" ON public.criteria_categories
  FOR DELETE
  USING (get_user_role_in_tenant(tenant_id) = 'tenant_id_admin');

-- Platform Admins can manage all categories
DROP POLICY IF EXISTS "Allow platform admin full access on criteria_categories" ON public.criteria_categories;
CREATE POLICY "Allow platform admin full access on criteria_categories" ON public.criteria_categories
  FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());


-- ** Criteria Table **
ALTER TABLE public.criteria ENABLE ROW LEVEL SECURITY;

-- Members can read criteria
DROP POLICY IF EXISTS "Allow members to read criteria in their tenant projects" ON public.criteria;
CREATE POLICY "Allow members to read criteria in their tenant projects" ON public.criteria
  FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Tenant Admins can manage criteria (Split Policies)
DROP POLICY IF EXISTS "Allow tenant admins to manage criteria in their tenant projects" ON public.criteria; -- Drop old combined policy

DROP POLICY IF EXISTS "Allow tenant admins to insert criteria in their tenant projects" ON public.criteria;
CREATE POLICY "Allow tenant admins to insert criteria in their tenant projects" ON public.criteria
  FOR INSERT
  WITH CHECK (get_user_role_in_tenant(tenant_id) = 'tenant_id_admin');

DROP POLICY IF EXISTS "Allow tenant admins to update criteria in their tenant projects" ON public.criteria;
CREATE POLICY "Allow tenant admins to update criteria in their tenant projects" ON public.criteria
  FOR UPDATE
  USING (get_user_role_in_tenant(tenant_id) = 'tenant_id_admin')
  WITH CHECK (get_user_role_in_tenant(tenant_id) = 'tenant_id_admin');

DROP POLICY IF EXISTS "Allow tenant admins to delete criteria in their tenant projects" ON public.criteria;
CREATE POLICY "Allow tenant admins to delete criteria in their tenant projects" ON public.criteria
  FOR DELETE
  USING (get_user_role_in_tenant(tenant_id) = 'tenant_id_admin');

-- Platform Admins can manage all criteria
DROP POLICY IF EXISTS "Allow platform admin full access on criteria" ON public.criteria;
CREATE POLICY "Allow platform admin full access on criteria" ON public.criteria
  FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());


-- ** Evaluation Scores Table **
ALTER TABLE public.evaluation_scores ENABLE ROW LEVEL SECURITY;

-- Evaluators can manage their own scores for unlocked projects
DROP POLICY IF EXISTS "Allow evaluators to manage their own scores for unlocked projects" ON public.evaluation_scores;
CREATE POLICY "Allow evaluators to manage their own scores for unlocked projects" ON public.evaluation_scores
  FOR ALL -- SELECT, INSERT, UPDATE, DELETE (Individual scores can be deleted/reset by the evaluator)
  USING (
    auth.uid() = evaluator_id AND
    tenant_id IN (SELECT get_user_tenant_ids()) AND
    NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.evaluation_locked = true)
  )
  WITH CHECK (
    auth.uid() = evaluator_id AND
    tenant_id IN (SELECT get_user_tenant_ids()) AND
    NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.evaluation_locked = true)
  );

-- Tenant Admins can read scores in their tenant projects
DROP POLICY IF EXISTS "Allow tenant admins to read scores in their tenant projects" ON public.evaluation_scores;
CREATE POLICY "Allow tenant admins to read scores in their tenant projects" ON public.evaluation_scores
  FOR SELECT
  USING (get_user_role_in_tenant(tenant_id) = 'tenant_id_admin');

-- Platform Admins can manage all scores
DROP POLICY IF EXISTS "Allow platform admin full access on evaluation_scores" ON public.evaluation_scores;
CREATE POLICY "Allow platform admin full access on evaluation_scores" ON public.evaluation_scores
  FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());


-- ** Licenses Table **
-- *** LICENSES CANNOT BE DELETED VIA RLS ***
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- Tenant Admins can view their own tenant licenses
DROP POLICY IF EXISTS "Allow tenant admins to view their own tenant licenses" ON public.licenses;
CREATE POLICY "Allow tenant admins to view their own tenant licenses" ON public.licenses
  FOR SELECT
  USING (get_user_role_in_tenant(tenant_id) = 'tenant_id_admin');

-- Platform Admins can access licenses (Split Policies, No Delete)
DROP POLICY IF EXISTS "Allow platform admin access on licenses" ON public.licenses; -- Drop old combined policy

DROP POLICY IF EXISTS "Allow platform admin select on licenses" ON public.licenses;
CREATE POLICY "Allow platform admin select on licenses" ON public.licenses
  FOR SELECT
  USING (is_platform_admin());

DROP POLICY IF EXISTS "Allow platform admin insert on licenses" ON public.licenses;
CREATE POLICY "Allow platform admin insert on licenses" ON public.licenses
  FOR INSERT
  WITH CHECK (is_platform_admin());

DROP POLICY IF EXISTS "Allow platform admin update on licenses" ON public.licenses;
CREATE POLICY "Allow platform admin update on licenses" ON public.licenses
  FOR UPDATE
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());
-- NOTE: Lifecycle changes (status updates, creation) primarily happen via Edge Functions using the service_role key.


-- ** Invites Table (If used) **
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Tenant Admins can manage invites for their tenant
DROP POLICY IF EXISTS "Allow tenant admins to manage invites for their tenant" ON public.invites;
CREATE POLICY "Allow tenant admins to manage invites for their tenant" ON public.invites
  FOR ALL
  USING (get_user_role_in_tenant(tenant_id) = 'tenant_id_admin')
  WITH CHECK (get_user_role_in_tenant(tenant_id) = 'tenant_id_admin');

-- Platform Admins can manage all invites
DROP POLICY IF EXISTS "Allow platform admin full access on invites" ON public.invites;
CREATE POLICY "Allow platform admin full access on invites" ON public.invites
  FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());


-- ** Activity Logs Table (If used) **
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Tenant members can view logs for their tenant
DROP POLICY IF EXISTS "Allow tenant members to view logs for their tenant" ON public.activity_logs;
CREATE POLICY "Allow tenant members to view logs for their tenant" ON public.activity_logs
  FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Platform Admins can manage all logs
DROP POLICY IF EXISTS "Allow platform admin full access on activity_logs" ON public.activity_logs;
CREATE POLICY "Allow platform admin full access on activity_logs" ON public.activity_logs
  FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());
-- Note: Inserting logs might be done via triggers or Edge Functions using service_role key to bypass RLS if needed.
