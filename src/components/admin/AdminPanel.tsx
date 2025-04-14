import React from 'react';
import { User } from '@supabase/supabase-js';
import TenantList from './TenantList';
import UserManagement from './UserManagement';
import LicenseAdminView from './LicenseAdminView';
import PlatformSettings from './PlatformSettings'; // Import new component
import ImpersonationSection from './ImpersonationSection'; // Extract Impersonation UI
import Procurement from './Procurement';

interface AdminPanelProps {
  user: User;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user }) => {
  return (
    <div className="p-4 space-y-8">
      <h2 className="text-2xl font-semibold mb-6">Platform Admin Panel</h2>
      <p className="text-muted-foreground">Welcome, Admin {user.email}.</p>

      {/* Impersonation Section */}
      <ImpersonationSection />

      {/* Tenant Management Section */}
      <div className="border-t pt-6">
        <TenantList />
      </div>

      {/* User Management Section */}
      <div className="border-t pt-6">
        <UserManagement />
      </div>

      {/* License Management Section */}
      <div className="border-t pt-6">
        <LicenseAdminView />
      </div>

      {/* Platform Settings Section */}
      <div className="border-t pt-6">
        <PlatformSettings />
      </div>

      {/* Procurement Section */}
      <div className="border-t pt-6">
        <Procurement />
      </div>
    </div>
  );
};

export default AdminPanel;
