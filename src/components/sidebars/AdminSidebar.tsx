// New Sidebar for Platform Admin section (/admin/*)
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, KeyRound, CreditCard, Settings, Activity } from 'lucide-react'; // Relevant icons
import clsx from 'clsx';

const commonLinkClasses = "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150";
const inactiveLinkClasses = "text-muted-foreground hover:bg-muted hover:text-foreground";
const activeLinkClasses = "bg-primary text-primary-foreground";

const AdminSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-card border-r border-border p-4 flex flex-col"> {/* Use bg-card */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center text-primary">ProcuraScore</h1>
        <h2 className="text-sm font-medium text-center text-muted-foreground mt-1">Admin Panel</h2>
      </div>
      <nav className="flex-grow space-y-2">
        <NavLink
          to="/admin"
          end // Use 'end' for the index route
          className={({ isActive }) => clsx(commonLinkClasses, isActive ? activeLinkClasses : inactiveLinkClasses)}
        >
          <LayoutDashboard className="mr-3 h-5 w-5" />
          Admin Overview
        </NavLink>
        <NavLink
          to="/admin/tenants"
          className={({ isActive }) => clsx(commonLinkClasses, isActive ? activeLinkClasses : inactiveLinkClasses)}
        >
          <Building2 className="mr-3 h-5 w-5" />
          Tenants
        </NavLink>
        <NavLink
          to="/admin/users"
          className={({ isActive }) => clsx(commonLinkClasses, isActive ? activeLinkClasses : inactiveLinkClasses)}
        >
          <Users className="mr-3 h-5 w-5" />
          Users
        </NavLink>
        <NavLink
          to="/admin/licenses"
          className={({ isActive }) => clsx(commonLinkClasses, isActive ? activeLinkClasses : inactiveLinkClasses)}
        >
          <KeyRound className="mr-3 h-5 w-5" />
          Licenses
        </NavLink>
        <NavLink
          to="/admin/procurement"
          className={({ isActive }) => clsx(commonLinkClasses, isActive ? activeLinkClasses : inactiveLinkClasses)}
        >
          <CreditCard className="mr-3 h-5 w-5" />
          Procurement
        </NavLink>
        <NavLink
          to="/admin/settings"
          className={({ isActive }) => clsx(commonLinkClasses, isActive ? activeLinkClasses : inactiveLinkClasses)}
        >
          <Settings className="mr-3 h-5 w-5" />
          Platform Settings
        </NavLink>
         <NavLink
          to="/admin/status"
          className={({ isActive }) => clsx(commonLinkClasses, isActive ? activeLinkClasses : inactiveLinkClasses)}
        >
          <Activity className="mr-3 h-5 w-5" />
          API Status
        </NavLink>
        {/* Add other admin links here (e.g., Audit Logs) */}
      </nav>
      <div className="mt-auto">
        {/* Optional: Footer links */}
      </div>
    </aside>
  );
};

export default AdminSidebar;
