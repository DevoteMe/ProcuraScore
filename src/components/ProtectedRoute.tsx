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
    return <div>Checking authentication...</div>; // Or a loading spinner
  }

  if (!session) {
    // User not logged in, redirect to login page
    // Pass the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
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

/*
Usage with react-router-dom:

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminOnlyPage from './pages/AdminOnlyPage';
import TenantAdminPage from './pages/TenantAdminPage';
import ProtectedRoute from './components/ProtectedRoute';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminOnlyPage />
            </ProtectedRoute>
          }
        />
         <Route
          path="/tenant-settings" // Example
          element={
            <ProtectedRoute requireTenantAdmin={true}>
              <TenantAdminPage />
            </ProtectedRoute>
          }
        />
        {/* Other routes */}
      </Routes>
    </BrowserRouter>
  );
}

*/
