// Placeholder Tenant Dashboard component
import React from 'react';
import { User } from '@supabase/supabase-js';

interface TenantDashboardProps {
  user: User;
  tenantId: string;
  role: 'tenant_id_admin' | 'tenant_id_user';
}

const TenantDashboard: React.FC<TenantDashboardProps> = ({ user, tenantId, role }) => {
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Tenant Admin Dashboard (ID: {tenantId.substring(0,8)}...)</h2>
      <p>User: {user.email}</p>
      <p>Role in this tenant: {role}</p>
      <p className="text-muted-foreground">Tenant Admin Panel - Features coming soon.</p>

      {/* Add Tenant-specific features based on role */}
      {/* - Project List/Management */}
      {/* - Evaluation Interface */}
      {/* - Results Dashboard */}
      {/* - Supplier Management */}
      {/* - Criteria Builder */}
      {/* - User Management (if role is tenant_id_admin) */}
      {/* - Tenant Settings */}

      {role === 'tenant_id_admin' && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-medium">Tenant Admin Actions</h3>
          {/* Add Invite User button/form */}
          {/* Add User list for this tenant */}
        </div>
      )}
    </div>
  );
};

export default TenantDashboard;
