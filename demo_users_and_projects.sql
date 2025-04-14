-- 1. Create Tenant

INSERT INTO public.tenants (name)
VALUES ('Demo Tenant')
RETURNING id AS tenant_id;


-- 2. Create Demo User

WITH new_tenant AS (
  -- Fetch the tenant_id of the Demo Tenant created earlier
  SELECT id AS tenant_id FROM public.tenants WHERE name = 'Demo Tenant'
), demo_user AS (
  -- Create the demo user
  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data)
  VALUES (uuid_generate_v4(), 'authenticated', 'authenticated', 'demo_user1@procurascore.com', 
          '$2a$10$vrujWqY4maVSBvO2qjEBkejpq8EqSP93Wsyq4.7MdEq4AGVjS9/6a', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}')
  RETURNING id AS demo_user_id
)
-- Insert the demo user's membership in the tenant
INSERT INTO public.tenant_memberships (user_id, tenant_id, role)
SELECT demo_user.demo_user_id, new_tenant.tenant_id, 'tenant_id_user'
FROM demo_user, new_tenant;


-- 3. Create Platform Admin User

WITH new_tenant AS (
  -- Fetch the tenant_id of the Demo Tenant created earlier
  SELECT id FROM public.tenants WHERE name = 'Demo Tenant'
), platform_admin AS (
  -- Create platform admin user
  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data)
  VALUES (uuid_generate_v4(), 'authenticated', 'authenticated', 'platform_admin@procurascore.com', 
          '$2a$10$vrujWqY4maVSBvO2qjEBkejpq8EqSP93Wsyq4.7MdEq4AGVjS9/6a', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"],"claims_admin":true}')
  RETURNING id AS platform_admin_id
)
-- Platform admin doesn't have tenant membership in this case, no further insert needed
SELECT platform_admin_id FROM platform_admin;


-- 4. Create Mockup Projects for Demo User

WITH new_tenant AS (
  -- Fetch the tenant_id of the Demo Tenant created earlier
  SELECT id AS tenant_id FROM public.tenants WHERE name = 'Demo Tenant'
), demo_user AS (
  -- Fetch the demo user_id for demo_user1@procurascore.com
  SELECT id AS demo_user_id FROM auth.users WHERE email = 'demo_user1@procurascore.com'
)
-- Insert Mockup Projects
INSERT INTO public.projects (tenant_id, name, status, created_by, created_at, updated_at)
SELECT new_tenant.tenant_id, 'Completed Project', 'completed'::project_status, demo_user.demo_user_id, NOW(), NOW()
FROM new_tenant, demo_user
UNION ALL
SELECT new_tenant.tenant_id, 'In Progress Project', 'active'::project_status, demo_user.demo_user_id, NOW(), NOW()
FROM new_tenant, demo_user
UNION ALL
SELECT new_tenant.tenant_id, 'Draft Project', 'draft'::project_status, demo_user.demo_user_id, NOW(), NOW()
FROM new_tenant, demo_user;
