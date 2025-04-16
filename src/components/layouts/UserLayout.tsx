// Layout for the main user dashboard section (/dashboard/*)
import React from 'react';
import { Outlet } from 'react-router-dom';
import UserSidebar from '../sidebars/UserSidebar'; // Renamed Sidebar
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';

// TODO: Add back tenant switching logic if needed for non-admin users with multiple memberships
// TODO: Add back stats fetching/display logic relevant to users/tenants

const UserLayout: React.FC = () => {
  const { user, signOut } = useAuth(); // Removed unused vars like session, loading, isPlatformAdmin

  const handleLogout = async () => {
    console.log("[UserLayout] handleLogout called.");
    await signOut();
    // Navigation will be handled by AuthContext listener and ProtectedRoute
  };

  if (!user) {
     // This case should ideally be handled by ProtectedRoute, but as a fallback:
     console.log("[UserLayout] Rendering: No user found (should have been redirected).");
     return <div className="flex justify-center items-center min-h-screen">Not logged in.</div>;
  }

  console.log("[UserLayout] Rendering main layout for user:", user.email);
  return (
    <div className="flex h-screen bg-background">
      <UserSidebar /> {/* User-specific sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 border-b bg-card"> {/* Use bg-card or similar */}
          <div>
            {/* Placeholder for Tenant Switcher or Tenant Name */}
            <h1 className="text-xl font-semibold">User Dashboard</h1>
            {/* TODO: Add Tenant Switcher logic here if user has multiple memberships */}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user.email}</span>
            <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
           {/* Outlet will render the specific user route component (Overview, Projects, etc.) */}
           <Outlet />
           {/* Removed context passing as it was causing issues, components can use useAuth directly */}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
