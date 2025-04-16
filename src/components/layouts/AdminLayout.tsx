// Layout for the platform admin section (/admin/*)
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../sidebars/AdminSidebar'; // New Admin Sidebar
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';

// TODO: Add stats fetching/display logic relevant to platform admins

const AdminLayout: React.FC = () => {
  const { user, signOut } = useAuth(); // Only need user and signOut here

  const handleLogout = async () => {
    console.log("[AdminLayout] handleLogout called.");
    await signOut();
    // Navigation will be handled by AuthContext listener and AdminProtectedRoute
  };

  if (!user) {
     // This case should ideally be handled by AdminProtectedRoute, but as a fallback:
     console.log("[AdminLayout] Rendering: No user found (should have been redirected).");
     return <div className="flex justify-center items-center min-h-screen">Not logged in.</div>;
  }

  console.log("[AdminLayout] Rendering main layout for admin:", user.email);
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar /> {/* Admin-specific sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 border-b bg-card"> {/* Use bg-card or similar */}
          <div>
            <h1 className="text-xl font-semibold">Platform Administration</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Admin: {user.email}</span>
            <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
           {/* Outlet will render the specific admin route component (Tenants, Users, etc.) */}
           <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
