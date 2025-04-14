export interface Tenant {
  id: string;
  created_at?: string;
  name: string;
  owner_id: string;
  stripe_customer_id?: string | null;
}

export interface UserDetails {
  id: string;
  created_at?: string;
  email: string;
  roles?: string[];
  tenant_memberships?: TenantMembership[];
  // Add other user-related fields as needed
}

export interface TenantMembership {
  tenant_id: string;
  user_id: string;
  role: string; // e.g., 'tenant_admin', 'tenant_user'
}

export interface Project {
    id: string;
    created_at?: string;
    tenant_id: string;
    name: string;
    description?: string;
    status: 'active' | 'inactive' | 'completed';
    // Add other project-related fields as needed
}
