-- 1. Detailed Supabase Schema (SQL)
-- Run these in the Supabase SQL Editor

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Custom Types
create type public.tenant_role as enum ('tenant_id_admin', 'tenant_id_user');
create type public.license_type as enum ('per_tender', 'subscription');
create type public.license_status as enum ('active', 'inactive', 'expired', 'cancelled');
create type public.project_status as enum ('draft', 'active', 'completed', 'archived');
create type public.score_scale as enum ('1-5', '1-10'); -- Example, can be extended

-- Tenants Table: Represents customer organizations
create table public.tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Add other tenant-specific settings if needed (e.g., default currency, language)
  stripe_customer_id text unique -- Store Stripe Customer ID for billing
);
comment on table public.tenants is 'Stores information about customer organizations (tenants).';

-- Tenant Memberships Table: Links users to tenants and defines their role within that tenant
create table public.tenant_memberships (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  role public.tenant_role not null default 'tenant_id_user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, tenant_id) -- Ensure a user has only one role per tenant
);
comment on table public.tenant_memberships is 'Associates users with tenants and defines their role within the tenant.';
-- Index for efficient lookup of user's tenants
create index idx_tenant_memberships_user_id on public.tenant_memberships(user_id);
-- Index for efficient lookup of tenant's members
create index idx_tenant_memberships_tenant_id on public.tenant_memberships(tenant_id);

-- Licenses Table: Tracks purchased licenses (per-tender or subscription) for tenants
create table public.licenses (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  type public.license_type not null,
  status public.license_status not null default 'inactive',
  -- For per_tender:
  project_id uuid null, -- Link to the specific project if type is 'per_tender'
  -- For subscription:
  stripe_subscription_id text null unique, -- Store Stripe Subscription ID
  current_period_start timestamp with time zone null,
  current_period_end timestamp with time zone null,
  max_users integer null, -- Based on subscription tier
  -- Common fields:
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint chk_license_details check (
    (type = 'per_tender' and project_id is not null and stripe_subscription_id is null) or
    (type = 'subscription' and project_id is null and stripe_subscription_id is not null)
  )
);
comment on table public.licenses is 'Stores license information for tenants, linked to Stripe.';
create index idx_licenses_tenant_id on public.licenses(tenant_id);
create index idx_licenses_project_id on public.licenses(project_id) where type = 'per_tender';
create index idx_licenses_stripe_subscription_id on public.licenses(stripe_subscription_id) where type = 'subscription';

-- Projects Table: Represents a single tender evaluation project
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  name text not null,
  description text,
  status public.project_status not null default 'draft',
  default_score_scale public.score_scale not null default '1-5',
  default_currency char(3) not null default 'NOK', -- ISO 4217 currency code
  created_by uuid references auth.users(id) on delete set null, -- Track who created it
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  evaluation_locked boolean not null default false -- To prevent changes after completion
);
comment on table public.projects is 'Stores details about individual tender evaluation projects.';
create index idx_projects_tenant_id_status on public.projects(tenant_id, status);

-- Link licenses to projects for 'per_tender' type after project creation
alter table public.licenses add constraint fk_licenses_project_id foreign key (project_id) references public.projects(id) on delete set null;

-- Suppliers Table: Information about suppliers being evaluated in a project
create table public.suppliers (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade not null,
  tenant_id uuid references public.tenants(id) on delete cascade not null, -- Denormalized for RLS convenience
  name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  -- Add other relevant supplier fields
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.suppliers is 'Stores information about suppliers participating in a project.';
create index idx_suppliers_project_id on public.suppliers(project_id);
create index idx_suppliers_tenant_id on public.suppliers(tenant_id); -- For RLS checks

-- Criteria Categories Table: Main categories or usage areas for criteria
create table public.criteria_categories (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade not null,
  tenant_id uuid references public.tenants(id) on delete cascade not null, -- Denormalized for RLS convenience
  name text not null,
  weight numeric(5, 2) not null default 0.00 check (weight >= 0 and weight <= 100), -- Percentage weight
  display_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.criteria_categories is 'Defines main categories for evaluation criteria within a project.';
create index idx_criteria_categories_project_id on public.criteria_categories(project_id);
create index idx_criteria_categories_tenant_id on public.criteria_categories(tenant_id); -- For RLS checks

-- Criteria Table: Specific evaluation criteria within a category
create table public.criteria (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references public.criteria_categories(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null, -- Denormalized for RLS convenience
  tenant_id uuid references public.tenants(id) on delete cascade not null, -- Denormalized for RLS convenience
  name text not null,
  description text,
  weight numeric(5, 2) not null default 0.00 check (weight >= 0 and weight <= 100), -- Weight within category
  is_enabled boolean not null default true,
  is_price_criterion boolean not null default false, -- Flag for the special price criterion
  display_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.criteria is 'Defines specific evaluation criteria belonging to a category.';
create index idx_criteria_category_id on public.criteria(category_id);
create index idx_criteria_project_id on public.criteria(project_id); -- For RLS checks
create index idx_criteria_tenant_id on public.criteria(tenant_id); -- For RLS checks

-- Evaluations Table: Stores overall evaluation info per evaluator per project (optional, could be implicit)
-- This might be useful for tracking assignment and completion status per evaluator.
create table public.evaluations (
   id uuid primary key default uuid_generate_v4(),
   project_id uuid references public.projects(id) on delete cascade not null,
   tenant_id uuid references public.tenants(id) on delete cascade not null, -- Denormalized for RLS convenience
   evaluator_id uuid references auth.users(id) on delete cascade not null,
   status text default 'pending', -- e.g., pending, in_progress, completed
   submitted_at timestamp with time zone null,
   created_at timestamp with time zone default timezone('utc'::text, now()) not null,
   unique (project_id, evaluator_id) -- One evaluation record per evaluator per project
);
comment on table public.evaluations is 'Tracks the evaluation process for each assigned evaluator on a project.';
create index idx_evaluations_project_id on public.evaluations(project_id);
create index idx_evaluations_evaluator_id on public.evaluations(evaluator_id);
create index idx_evaluations_tenant_id on public.evaluations(tenant_id); -- For RLS checks


-- Evaluation Scores Table: Stores the actual scores and comments given by an evaluator
create table public.evaluation_scores (
  id uuid primary key default uuid_generate_v4(),
  criterion_id uuid references public.criteria(id) on delete cascade not null,
  supplier_id uuid references public.suppliers(id) on delete cascade not null,
  evaluator_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null, -- Denormalized for RLS convenience
  tenant_id uuid references public.tenants(id) on delete cascade not null, -- Denormalized for RLS convenience
  score numeric(10, 2) null, -- Allows for different scales, or price value
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (criterion_id, supplier_id, evaluator_id) -- One score per evaluator per criterion per supplier
);
comment on table public.evaluation_scores is 'Stores individual scores and comments given by evaluators.';
create index idx_evaluation_scores_criterion_id on public.evaluation_scores(criterion_id);
create index idx_evaluation_scores_supplier_id on public.evaluation_scores(supplier_id);
create index idx_evaluation_scores_evaluator_id on public.evaluation_scores(evaluator_id);
create index idx_evaluation_scores_project_id on public.evaluation_scores(project_id); -- For RLS checks
create index idx_evaluation_scores_tenant_id on public.evaluation_scores(tenant_id); -- For RLS checks


-- Invites Table (Optional but recommended for tracking): Store pending invitations
create table public.invites (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  invited_by uuid references auth.users(id) on delete set null,
  email text not null,
  role public.tenant_role not null,
  token text unique, -- Store the invite token if using custom logic, or rely on Supabase's built-in
  status text default 'pending', -- pending, accepted, expired
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone,
  unique(tenant_id, email) -- Prevent duplicate pending invites for the same email in a tenant
);
comment on table public.invites is 'Tracks user invitations to tenants.';
create index idx_invites_tenant_id on public.invites(tenant_id);
create index idx_invites_email on public.invites(email);


-- Activity Log Table (Optional): Track key actions
create table public.activity_logs (
  id bigserial primary key,
  tenant_id uuid references public.tenants(id) on delete cascade, -- Nullable if action is platform-wide
  project_id uuid references public.projects(id) on delete cascade, -- Nullable if action is tenant-wide or platform-wide
  user_id uuid references auth.users(id) on delete set null,
  action text not null, -- e.g., 'project_created', 'score_updated', 'user_invited'
  details jsonb, -- Store relevant details about the action
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.activity_logs is 'Logs significant user actions within the application.';
create index idx_activity_logs_tenant_id on public.activity_logs(tenant_id);
create index idx_activity_logs_project_id on public.activity_logs(project_id);
create index idx_activity_logs_user_id on public.activity_logs(user_id);
create index idx_activity_logs_created_at on public.activity_logs(created_at desc);


-- Function to get the user's tenant IDs (returns setof uuid)
create or replace function get_user_tenant_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select tenant_id from tenant_memberships where user_id = auth.uid();
$$;

-- Function to get the user's role in a specific tenant
create or replace function get_user_role_in_tenant(tenant_id_input uuid)
returns public.tenant_role
language sql
security definer
set search_path = public
stable
as $$
  select role from tenant_memberships where user_id = auth.uid() and tenant_id = tenant_id_input;
$$;

-- Function to check if the user is a platform admin (checks custom claim/metadata)
-- IMPORTANT: Adjust 'is_platform_admin' to match the actual metadata key you use.
create or replace function is_platform_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(auth.jwt()->'user_metadata'->>'is_platform_admin', 'false')::boolean or
         coalesce(auth.jwt()->'app_metadata'->>'claims_admin', 'false')::boolean; -- Check both user and app metadata as examples
$$;

-- Function to check if a user is a member of a specific tenant
create or replace function is_tenant_member(tenant_id_input uuid)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  return exists (
    select 1
    from tenant_memberships
    where user_id = auth.uid() and tenant_id = tenant_id_input
  );
end;
$$;

-- Trigger function to automatically create a tenant for a new user (Example - adjust if tenants are created differently)
-- This might be better handled manually or after signup confirmation depending on your flow.
-- create or replace function handle_new_user()
-- returns trigger
-- language plpgsql
-- security definer -- Use with caution, prefer specific grants or service_role key functions
-- set search_path = public
-- as $$
-- declare
--   new_tenant_id uuid;
-- begin
--   -- Create a new tenant for the user
--   insert into public.tenants (name)
--   values (new.email || '''s Tenant') -- Example name
--   returning id into new_tenant_id;
--
--   -- Add the user as the admin of their new tenant
--   insert into public.tenant_memberships (user_id, tenant_id, role)
--   values (new.id, new_tenant_id, 'tenant_id_admin');
--
--   return new;
-- end;
-- $$;

-- Trigger to call the function after a new user signs up
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();

-- Trigger function to update 'updated_at' columns automatically
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to tables with 'updated_at'
CREATE TRIGGER set_timestamp_projects
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_licenses
BEFORE UPDATE ON public.licenses
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_evaluation_scores
BEFORE UPDATE ON public.evaluation_scores
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add similar triggers for other tables with updated_at if needed
