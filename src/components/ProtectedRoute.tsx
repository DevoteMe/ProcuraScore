// Standard Protected Route: Checks if user is logged in
import React, { ReactNode } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  // children prop is implicitly handled by <Outlet /> when used as a layout route
  // children?: ReactNode; // Remove direct children prop if using Outlet
}

// Adjusted to work as a Layout Route component in React Router v6
const ProtectedRoute: React.FC<ProtectedRouteProps> = () => {
  const { session, loading } = useAuth();
  const location = useLocation();

  // --- Development Bypass ---
  // In development mode, always allow access to the route
  // Make sure VITE_NODE_ENV is set to 'development' in your .env.development file
  // or that import.meta.env.DEV correctly reflects your development environment.
  if (import.meta.env.DEV) {
    console.warn('[ProtectedRoute] Development mode: Bypassing auth check.');
    return <Outlet />; // Render nested routes
  }
  // --- End Development Bypass ---

  if (loading) {
    return (
       <div className="flex justify-center items-center min-h-screen">
         <div>Checking authentication...</div> {/* Or a loading spinner */}
       </div>
    );
  }

  if (!session) {
    // User not logged in, redirect to auth page
    console.log("[ProtectedRoute] No session, redirecting to /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // User is logged in, render the nested routes via Outlet
  return <Outlet />;
};

export default ProtectedRoute;
