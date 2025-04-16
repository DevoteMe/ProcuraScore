export interface Tenant {
  id: string; // UUID
  name: string;
  created_at: string; // ISO 8601 timestamp string
  updated_at: string; // ISO 8601 timestamp string
  status: 'active' | 'inactive' | 'suspended'; // Example statuses
  // Add other relevant fields from your schema.sql if needed
  // e.g., owner_user_id?: string;
}

export interface Project {
  id: string; // UUID
  tenant_id: string;
  name: string;
  description?: string | null;
  status: 'draft' | 'published' | 'evaluating' | 'completed' | 'archived'; // Example statuses
  created_at: string;
  updated_at: string;
  // Add other relevant fields
}

// Add other shared types here as needed
