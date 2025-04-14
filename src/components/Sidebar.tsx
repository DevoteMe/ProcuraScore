import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building, Users, Settings, FolderKanban, ClipboardCheck, UserCog } from 'lucide-react'; // Import icons
import { cn } from '@/lib/utils';
import { Button } from './ui/button'; // Use Button for styling consistency

interface SidebarProps {
  isPlatformAdmin: boolean;
  tenantRole?: 'tenant_id_admin' | 'tenant_id_user'; // Role within the selected tenant
}

const Sidebar: React.FC<SidebarProps> = ({ isPlatformAdmin, tenantRole }) => {
  const location = useLocation(); // To highlight the active link

  const commonLinks = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    // Add more common links if any
  ];

  const adminLinks = [
    ...commonLinks,
    { to: '/dashboard/tenants', label: 'Tenant Management', icon: Building },
    { to: '/dashboard/users', label: 'User Management', icon: Users },
    { to: '/dashboard/settings', label: 'System Settings', icon: Settings }, // Placeholder
  ];

  const tenantAdminLinks = [
    ...commonLinks,
    { to: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
    { to: '/dashboard/evaluations', label: 'Evaluations', icon: ClipboardCheck },
    { to: '/dashboard/team', label: 'Team Members', icon: UserCog },
    { to: '/dashboard/tenant-settings', label: 'Tenant Settings', icon: Settings }, // Placeholder
  ];

  const tenantUserLinks = [
    ...commonLinks,
    { to: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
    { to: '/dashboard/evaluations', label: 'Evaluations', icon: ClipboardCheck },
  ];

  let linksToShow = commonLinks; // Default

  if (isPlatformAdmin) {
    linksToShow = adminLinks;
  } else if (tenantRole === 'tenant_id_admin') {
    linksToShow = tenantAdminLinks;
  } else if (tenantRole === 'tenant_id_user') {
    linksToShow = tenantUserLinks;
  }

  return (
    <aside className="w-64 border-r bg-background p-4 flex flex-col">
      <nav className="flex flex-col space-y-2">
        {linksToShow.map((link) => {
          const isActive = location.pathname === link.to || (link.to !== '/dashboard' && location.pathname.startsWith(link.to));
          return (
            <Button
              key={link.to}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link to={link.to}>
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </Link>
            </Button>
          );
        })}
      </nav>
      {/* Add user profile/logout section at the bottom if desired */}
      <div className="mt-auto">
        {/* Placeholder for potential future elements like user profile quick view */}
      </div>
    </aside>
  );
};

export default Sidebar;
