import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils"; // Assuming you have a utility for class names
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users, Building, FileKey, Settings, LogOut } from 'lucide-react';

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const { user, logout } = useAuth(); // Assuming logout function is available

    // --- Development Bypass ---
    if (import.meta.env.DEV) {
      console.warn('[AdminLayout] Development mode: Bypassing admin check.');
      // Proceed to render layout even if user is not technically an admin
    } else {
      // --- Production Check ---
      // Basic check, ideally the route protection handles unauthorized access more robustly
      if (user?.app_metadata?.is_platform_admin !== true) {
          console.warn(`[AdminLayout] Access Denied rendering: User ${user?.email ?? 'unknown'} is not admin.`);
          return (
              <div className="flex justify-center items-center min-h-screen p-4">
                  <p className="text-red-600 font-semibold">Access Denied. You must be a Platform Admin.</p>
              </div>
          );
      }
    }
    // --- End Bypass Logic ---

    const handleLogout = async () => {
        try {
            await logout();
            // Redirect handled by AuthContext or App fallback
        } catch (error) {
            console.error('Admin logout failed:', error);
        }
    };

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/tenants', label: 'Tenants', icon: Building },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/licenses', label: 'Licenses', icon: FileKey },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    // Log user only if available (and not in bypassed dev mode)
    if (user && !import.meta.env.DEV) {
      console.log("[AdminLayout] Rendering main layout for admin user:", user.email);
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
                    <Link to="/admin" className="text-xl font-semibold text-gray-800 dark:text-white">
                        ProcuraScore Admin
                    </Link>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.label}
                                to={item.href}
                                className={cn(
                                    "flex items-center px-4 py-2.5 rounded-md text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                )}
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                         <LogOut className="mr-3 h-5 w-5" />
                         {/* Conditionally render user email */}
                         Logout ({user?.email?.split('@')[0] ?? '[Dev Admin]'})
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-6">
                {/* Outlet renders the matched child route component */}
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout; 