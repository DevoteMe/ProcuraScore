// Standard Protected Route: Checks if user is logged in
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, loading } = useAuth();
  const location = useLocation();

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

  // User is logged in
  return <>{children}</>;
};

export default ProtectedRoute;
