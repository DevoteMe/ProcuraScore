// Admin Protected Route: Checks if user is logged in AND is a Platform Admin
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { session, loading, isPlatformAdmin } = useAuth();
  const location = useLocation();

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
    // Or potentially show an "Access Denied" page specific to admin area?
    // For now, redirecting to user dashboard is safer.
    console.warn("[AdminProtectedRoute] Access denied: Not a Platform Admin. Redirecting to /dashboard.");
    return <Navigate to="/dashboard" replace />;
  }

  // User is logged in AND is a Platform Admin
  return <>{children}</>;
};

export default AdminProtectedRoute;
