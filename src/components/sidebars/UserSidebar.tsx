// Renamed from Sidebar.tsx - Specific for User Dashboard
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FolderKanban, Users, Settings, CreditCard, Building } from 'lucide-react'; // Added CreditCard, Building
import clsx from 'clsx';
import { useAuth } from '@/contexts/AuthContext';

const commonLinkClasses = "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150";
const inactiveLinkClasses = "text-muted-foreground hover:bg-muted hover:text-foreground";
const activeLinkClasses = "bg-primary text-primary-foreground";

const UserSidebar: React.FC = () => {
  const { userDetails } = useAuth(); // Use userDetails to check for tenant admin role if needed

  // Determine if the user is an admin of *any* tenant they belong to
  // This logic might need refinement based on how tenant roles are stored/checked
  const isTenantAdmin = userDetails?.tenant_memberships?.some(m => m.role?.includes('admin')); // Example check

  return (
    <aside className="w-64 bg-card border-r border-border p-4 flex flex-col"> {/* Use bg-card */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center text-primary">ProcuraScore</h1>
      </div>
      <nav className="flex-grow space-y-2">
        {/* Common User Routes */}
        <NavLink
          to="/dashboard"
          end // Use 'end' for the index route
          className={({ isActive }) => clsx(commonLinkClasses, isActive ? activeLinkClasses : inactiveLinkClasses)}
        >
          <Home className="mr-3 h-5 w-5" />
          Overview
        </NavLink>
        <NavLink
          to="/dashboard/projects"
          className={({ isActive }) => clsx(commonLinkClasses, isActive ? activeLinkClasses : inactiveLinkClasses)}
        >
          <FolderKanban className="mr-3 h-5 w-5" />
          Projects
        </NavLink>

        {/* Tenant Admin Specific Routes */}
        {/* TODO: Refine role checking logic if necessary */}
        {isTenantAdmin && (
          <>
            <NavLink
              to="/dashboard/team"
              className={({ isActive }) => clsx(commonLinkClasses, isActive ? activeLinkClasses : inactiveLinkClasses)}
            >
              <Users className="mr-3 h-5 w-5" />
              Team Members
            </NavLink>
            <NavLink
              to="/dashboard/subscription"
              className={({ isActive }) => clsx(commonLinkClasses, isActive ? activeLinkClasses : inactiveLinkClasses)}
            >
              <CreditCard className="mr-3 h-5 w-5" />
              Subscription
            </NavLink>
             <NavLink
              to="/dashboard/settings"
              className={({ isActive }) => clsx(commonLinkClasses, isActive ? activeLinkClasses : inactiveLinkClasses)}
            >
              <Settings className="mr-3 h-5 w-5" />
              Tenant Settings
            </NavLink>
          </>
        )}
        {/* Add other user-specific links here */}
      </nav>
      <div className="mt-auto">
        {/* Optional: Footer links or user info */}
      </div>
    </aside>
  );
};

export default UserSidebar;
