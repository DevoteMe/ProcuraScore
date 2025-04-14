// Create or update a types file (e.g., src/types.ts)
export interface Tenant {
  id: string; // Typically UUID
  name: string;
  created_at: string; // ISO timestamp string
  updated_at?: string; // ISO timestamp string
  status: 'active' | 'disabled'; // Example status field
  // Add any other relevant tenant fields from your 'tenants' table
  // e.g., owner_user_id?: string;
}

// Add other shared types here if needed
// export interface Project { ... }
// export interface License { ... }
