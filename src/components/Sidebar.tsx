import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FolderKanban, Users, Settings, ShieldCheck, UserCog } from 'lucide-react'; // Removed Building icon as it wasn't used
import clsx from 'clsx';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

const commonLinkClasses = "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150";
const inactiveLinkClasses = "text-muted-foreground hover:bg-muted hover:text-foreground";
const activeLinkClasses = "bg-primary text-primary-foreground"; // Use primary color for active link

const Sidebar: React.FC = () => {
  // Get user details and admin status directly from AuthContext
  const { userDetails, isPlatformAdmin } = useAuth();

  // Determine if the user is an admin of *any* tenant they belong to
  // Note: This relies on tenant_memberships being populated in userDetails
  // Ensure fetchExtraUserDetails or similar populates this if needed.
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

        {/* Tenant User/Admin Routes (Show if NOT Platform Admin or if Platform Admin has tenant memberships) */}
        {/* Adjust logic if Platform Admins should *never* see tenant routes */}
        {(!isPlatformAdmin || (isPlatformAdmin && userDetails?.tenant_memberships && userDetails.tenant_memberships.length > 0)) && (
          <>
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
          </>
        )}


        {/* Tenant Admin Specific Routes */}
        {isTenantAdmin && !isPlatformAdmin && ( // Show only if Tenant Admin and NOT Platform Admin
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
        {isPlatformAdmin && ( // Use the isPlatformAdmin flag from context
          <NavLink
            to="/dashboard/admin" // Link to the admin panel route
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
