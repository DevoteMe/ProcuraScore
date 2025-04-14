// 4. React Frontend Structure - Example Protected Route Component
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom'; // Assuming react-router-dom
import { useAuth } from '../contexts/AuthContext'; // Use your Auth context

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean; // Optional: Require platform admin
  requireTenantAdmin?: boolean; // Optional: Require tenant admin for the selected tenant
  allowedRoles?: string[]; // Optional: Allowed roles for the route
  publicRoute?: boolean; // Optional: Public route that doesn't require authentication
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireTenantAdmin = false,
  allowedRoles = [],
  publicRoute = false,
}) => {
  const { 
    session, 
    loading, 
    isPlatformAdmin, 
    memberships, 
    selectedTenantId,
    userRoles 
  } = useAuth();
  const location = useLocation();

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  // Allow access to public routes without authentication
  if (publicRoute) {
    return <>{children}</>;
  }

  // Redirect to login if not authenticated
  if (!session) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname, search: location.search }} 
        replace 
      />
    );
  }

  // Check platform admin access
  if (requireAdmin && !isPlatformAdmin) {
    console.warn("Access denied: Platform Admin required.");
    return <Navigate to="/unauthorized" state={{ reason: 'admin_required' }} replace />;
  }

  // Check tenant admin access
  if (requireTenantAdmin) {
    if (!selectedTenantId) {
      console.warn("Access denied: No tenant selected.");
      return <Navigate to="/select-tenant" state={{ returnTo: location.pathname }} replace />;
    }

    const currentMembership = memberships?.find(m => m.tenant_id === selectedTenantId);
    
    if (!currentMembership || currentMembership.role !== 'tenant_id_admin') {
      console.warn(`Access denied: Tenant Admin role required for tenant ${selectedTenantId}`);
      return <Navigate to="/unauthorized" state={{ reason: 'tenant_admin_required' }} replace />;
    }
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.some(role => userRoles?.includes(role))) {
    console.warn(`Access denied: Required roles: ${allowedRoles.join(', ')}`);
    return <Navigate to="/unauthorized" state={{ reason: 'role_required' }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
