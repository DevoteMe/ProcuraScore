// Admin Protected Route: Checks if user is logged in AND is a Platform Admin
import React, { ReactNode } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminProtectedRouteProps {
  // children?: ReactNode; // Remove direct children prop if using Outlet
}

// Adjusted to work as a Layout Route component in React Router v6
const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = () => {
  const { session, loading, isPlatformAdmin } = useAuth();
  const location = useLocation();

  // --- Development Bypass ---
  if (import.meta.env.DEV) {
    console.warn('[AdminProtectedRoute] Development mode: Bypassing auth and admin checks.');
    return <Outlet />; // Render nested routes
  }
  // --- End Development Bypass ---

  if (loading) {
    return (
       <div className="flex justify-center items-center min-h-screen">
         <div>Checking admin access...</div> {/* Or a loading spinner */}
       </div>
    );
  }

  if (!session) {
    // User not logged in, redirect to ADMIN login page
    console.log("[AdminProtectedRoute] No session, redirecting to /admin/login");
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isPlatformAdmin) {
    // User is logged in but NOT a platform admin, redirect to user dashboard
    console.warn("[AdminProtectedRoute] Access denied: Not a Platform Admin. Redirecting to /dashboard.");
    // Redirect to user dashboard or a specific "Access Denied" page for admins?
    // return <Navigate to="/access-denied-admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  // User is logged in AND is a Platform Admin, render nested routes via Outlet
  return <Outlet />;
};

export default AdminProtectedRoute;
