import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import AuthComponent from './components/Auth';
// Layouts
import UserLayout from './components/layouts/UserLayout';
// Protected Route Variants
// import ProtectedRoute from './components/ProtectedRoute'; // Temporarily remove import
// import AdminProtectedRoute from './components/AdminProtectedRoute'; // Temporarily remove import
import { ThemeProvider } from './components/theme-provider';

// --- User Section Components ---
import DashboardOverview from './components/DashboardOverview';
import ProjectList from './components/tenant/ProjectList';
import CreateProject from './components/tenant/CreateProject';
import ProjectDetails from './components/ProjectDetails';
// Placeholders for User Section
const TeamManagement = () => <div className="p-6"><h2>Team Management</h2><p>Manage your team members here.</p></div>;
const SubscriptionManagement = () => <div className="p-6"><h2>Subscription & Billing</h2><p>Manage your subscription details here.</p></div>;
const TenantSettings = () => <div className="p-6"><h2>Tenant Settings</h2><p>Configure your tenant settings here.</p></div>;

// --- Admin Section Components ---
import AdminLoginPage from './pages/AdminLoginPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import TenantManagement from './components/admin/TenantManagement';
import UserManagement from './components/admin/UserManagement';
import LicenseManagement from './components/admin/LicenseManagement';
import AdminSettings from './components/admin/AdminSettings';

function App() {
  const { session, loading, isPlatformAdmin } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><div>Loading application...</div></div>;
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div>Loading application...</div></div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthComponent />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* User Dashboard Routes - REMOVED ProtectedRoute wrapper */}
          <Route
            path="/dashboard"
            element={<UserLayout />}
          >
            <Route index element={<DashboardOverview />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="projects/new" element={<CreateProject />} />
            <Route path="projects/:projectId" element={<ProjectDetails />} />
            <Route path="team" element={<TeamManagement />} />
            <Route path="subscription" element={<SubscriptionManagement />} />
            <Route path="settings" element={<TenantSettings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Platform Admin Routes - REMOVED AdminProtectedRoute wrapper */}
          <Route
            path="/admin"
            element={<AdminLayout />}
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="tenants" element={<TenantManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="licenses" element={<LicenseManagement />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>

          {/* Fallback for unknown top-level paths - Keep this logic */}
          <Route
            path="*"
            element={
              session
               ? (isPlatformAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />)
               : <Navigate to="/" replace /> // If not logged in at all, go to landing
            }
          />
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
