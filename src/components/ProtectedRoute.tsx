// 4. React Frontend Structure - Example Protected Route Component
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom'; // Assuming react-router-dom
import { useAuth } from '../contexts/AuthContext'; // Use your Auth context

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean; // Optional: Require platform admin
  requireTenantAdmin?: boolean; // Optional: Require tenant admin for the selected tenant
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireTenantAdmin = false,
}) => {
  const { session, loading, isPlatformAdmin, memberships, selectedTenantId } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
       <div className="flex justify-center items-center min-h-screen">
         <div>Checking authentication...</div> {/* Or a loading spinner */}
       </div>
    );
  }

  if (!session) {
    // User not logged in, redirect to login page
    // Pass the current location to redirect back after login
    // Redirect to /auth instead of /login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check for Platform Admin requirement
  if (requireAdmin && !isPlatformAdmin) {
    console.warn("Access denied: Platform Admin required.");
    // Redirect to an unauthorized page or dashboard
    return <Navigate to="/dashboard" replace />; // Or specific unauthorized page
  }

  // Check for Tenant Admin requirement for the currently selected tenant
  if (requireTenantAdmin) {
    if (!selectedTenantId) {
        console.warn("Access denied: No tenant selected.");
        return <Navigate to="/dashboard" replace />; // Or tenant selection page
    }
    const currentMembership = memberships.find(m => m.tenant_id === selectedTenantId);
    // Ensure role check matches your defined roles (e.g., 'tenant_admin' or 'tenant_id_admin')
    // Assuming 'tenant_id_admin' based on previous context
    if (currentMembership?.role !== 'tenant_id_admin') {
        console.warn(`Access denied: Tenant Admin role required for tenant ${selectedTenantId}. User role: ${currentMembership?.role}`);
        // Redirect to tenant dashboard or unauthorized page
        return <Navigate to="/dashboard" replace />; // Adjust as needed
    }
  }

  // User is authenticated and meets role requirements (if any)
  return <>{children}</>;
};

export default ProtectedRoute;

// Removed the problematic example usage comment block.
// Refer to App.tsx for actual route implementation examples.
