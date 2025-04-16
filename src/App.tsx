import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import AuthComponent from './components/Auth';
// Layouts (New)
import UserLayout from './components/layouts/UserLayout';
import AdminLayout from './components/layouts/AdminLayout';
// Protected Route Variants (Potentially New)
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute'; // New
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
import AdminDashboard from './components/admin/AdminDashboard'; // New Placeholder
import TenantList from './components/admin/TenantList'; // Existing, move if needed
import UserManagement from './components/admin/UserManagement'; // Existing, move if needed
// Placeholders for Admin Section
const AdminLicenseManagement = () => <div className="p-6"><h2>License Management</h2><p>View and manage platform licenses.</p></div>;
const AdminProcurement = () => <div className="p-6"><h2>Procurement / Stripe Products</h2><p>View Stripe product configuration.</p></div>;
const AdminPlatformSettings = () => <div className="p-6"><h2>Platform Settings</h2><p>Configure global platform settings.</p></div>;
const AdminApiStatus = () => <div className="p-6"><h2>API Status</h2><p>View status of integrations.</p></div>;


function App() {
  const { session, loading } = useAuth();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div>Loading application...</div></div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/auth"
            element={!session ? <AuthComponent /> : <Navigate to="/dashboard" replace />} // Redirect logged-in users away from auth
          />

          {/* User Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute> {/* Standard protection: must be logged in */}
                <UserLayout /> {/* User specific layout */}
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="projects/new" element={<CreateProject />} />
            <Route path="projects/:projectId" element={<ProjectDetails />} />
            <Route path="team" element={<TeamManagement />} /> {/* Placeholder */}
            <Route path="subscription" element={<SubscriptionManagement />} /> {/* Placeholder */}
            <Route path="settings" element={<TenantSettings />} /> {/* Placeholder */}
            {/* Redirect unknown dashboard paths to overview */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Platform Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute> {/* Special protection: must be logged in AND Platform Admin */}
                <AdminLayout /> {/* Admin specific layout */}
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} /> {/* Placeholder */}
            <Route path="tenants" element={<TenantList />} /> {/* Existing - needs verification/update */}
            <Route path="users" element={<UserManagement />} /> {/* Existing - needs verification/update */}
            <Route path="licenses" element={<AdminLicenseManagement />} /> {/* Placeholder */}
            <Route path="procurement" element={<AdminProcurement />} /> {/* Placeholder */}
            <Route path="settings" element={<AdminPlatformSettings />} /> {/* Placeholder */}
            <Route path="status" element={<AdminApiStatus />} /> {/* Placeholder */}
            {/* Redirect unknown admin paths to admin overview */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>

          {/* Fallback for unknown top-level paths */}
          <Route path="*" element={<Navigate to={session ? "/dashboard" : "/"} replace />} />
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
