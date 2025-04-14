import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FolderKanban, Users, Settings, ShieldCheck, Building, UserCog } from 'lucide-react'; // Added icons
import clsx from 'clsx';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

const commonLinkClasses = "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150";
const inactiveLinkClasses = "text-muted-foreground hover:bg-muted hover:text-foreground";
const activeLinkClasses = "bg-primary text-primary-foreground"; // Use primary color for active link

const Sidebar: React.FC = () => {
  const { userDetails } = useAuth(); // Get user details to check roles

  // Determine roles - adjust based on your actual role storage
  const isPlatformAdmin = userDetails?.roles?.includes('Platform_Admin');
  // Example: Check if user is an admin of *any* tenant listed in their memberships
  const isTenantAdmin = userDetails?.tenant_memberships?.some(m => m.role.includes('_admin'));

  return (
    <aside className="w-64 bg-background border-r border-border p-4 flex flex-col">
      <div className="mb-6">
        {/* Replace with your actual logo or app name */}
        <h1 className="text-2xl font-bold text-center text-primary">ProcuraScore</h1>
      </div>
      <nav className="flex-grow space-y-2">
        {/* Common Routes */}
        <NavLink
          to="/dashboard"
          end // Use 'end' for the index route
          className={({ isActive }) => clsx(commonLinkClasses, isActive ? activeLinkClasses : inactiveLinkClasses)}
        >
          <Home className="mr-3 h-5 w-5" />
          Overview
        </NavLink>

        {/* Tenant User/Admin Routes */}
        <NavLink
          to="/dashboard/projects"
          className={({ isActive }) => clsx(commonLinkClasses, isActive ? activeLinkClasses : inactiveLinkClasses)}
        >
          <FolderKanban className="mr-3 h-5 w-5" />
          Projects
        </NavLink>
        <NavLink
          to="/dashboard/evaluations"
          className={({ isActive }) => clsx(commonLinkClasses, isActive ? activeLinkClasses : inactiveLinkClasses)}
        >
          <ShieldCheck className="mr-3 h-5 w-5" />
          Evaluations
        </NavLink>

        {/* Tenant Admin Specific Routes */}
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
              to="/dashboard/tenant-settings"
              className={({ isActive }) => clsx(commonLinkClasses, isActive ? activeLinkClasses : inactiveLinkClasses)}
            >
              <Settings className="mr-3 h-5 w-5" />
              Tenant Settings
            </NavLink>
          </>
        )}

        {/* Platform Admin Specific Routes */}
        {isPlatformAdmin && (
          <NavLink
            to="/dashboard/admin"
            className={({ isActive }) => clsx(commonLinkClasses, isActive ? activeLinkClasses : inactiveLinkClasses)}
          >
            <UserCog className="mr-3 h-5 w-5" />
            Platform Admin
          </NavLink>
        )}

      </nav>
      <div className="mt-auto">
        {/* Optional: Footer links or user info */}
        {/* <p className="text-xs text-muted-foreground text-center">© 2024 ProcuraScore</p> */}
      </div>
    </aside>
  );
};

export default Sidebar;
