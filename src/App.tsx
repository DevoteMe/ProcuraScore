import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'; // Import Outlet
import { useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import AuthComponent from './components/Auth';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './components/theme-provider';

// Placeholder components for nested dashboard routes
const DashboardOverview = () => <div className="p-6"><h2 className="text-xl font-semibold">Dashboard Overview Content</h2><p>Display summary information here.</p></div>;
const TenantManagement = () => <div className="p-6"><h2 className="text-xl font-semibold">Tenant Management Content</h2><p>Display tenant list and management tools here.</p></div>;
const UserManagement = () => <div className="p-6"><h2 className="text-xl font-semibold">User Management Content</h2><p>Display user list and management tools here.</p></div>;
const SystemSettings = () => <div className="p-6"><h2 className="text-xl font-semibold">System Settings Content</h2><p>Display system-wide settings here.</p></div>;
const ProjectList = () => <div className="p-6"><h2 className="text-xl font-semibold">Project List Content</h2><p>Display projects for the current tenant here.</p></div>;
const EvaluationList = () => <div className="p-6"><h2 className="text-xl font-semibold">Evaluation List Content</h2><p>Display evaluations for the current tenant here.</p></div>;
const TeamMemberList = () => <div className="p-6"><h2 className="text-xl font-semibold">Team Member List Content</h2><p>Display team members for the current tenant here.</p></div>;
const TenantSettings = () => <div className="p-6"><h2 className="text-xl font-semibold">Tenant Settings Content</h2><p>Display settings specific to the current tenant here.</p></div>;


// Layout component for Dashboard routes to render nested content
const DashboardLayout: React.FC = () => {
  const { session } = useAuth(); // Get session info if needed for layout/context

  if (!session) return null; // Should be handled by ProtectedRoute, but good practice

  return (
    // The Dashboard component now contains the Sidebar and Header
    // Outlet will render the matched nested route component within Dashboard's <main> area
    // We pass the session down to the main Dashboard component which handles layout
    <Dashboard key={session.user.id} session={session} />
    // Note: The actual rendering of nested components needs to happen *inside* Dashboard.tsx
    // This structure sets up the routing; Dashboard.tsx needs modification to render Outlet.
    // --- CORRECTION: Dashboard itself IS the layout. Outlet should be rendered *within* Dashboard's main content area. ---
    // Let's adjust Dashboard.tsx to include <Outlet />
  );
};


function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading application...</div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/auth"
          element={!session ? <AuthComponent /> : <Navigate to="/dashboard" replace />}
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
               {/* DashboardLayout now wraps the nested routes */}
               {/* We render Dashboard directly as it contains the layout (Sidebar, Header) */}
               {session ? <Dashboard key={session.user.id} session={session} /> : null}
            </ProtectedRoute>
          }
        >
           {/* Nested Routes - These will render inside Dashboard's <main> via <Outlet /> */}
           {/* Update Dashboard.tsx to include <Outlet /> in its main content area */}
           <Route index element={<DashboardOverview />} /> {/* Default view for /dashboard */}
           {/* Platform Admin Routes (add role checks if needed via ProtectedRoute variants or logic within components) */}
           <Route path="tenants" element={<TenantManagement />} />
           <Route path="users" element={<UserManagement />} />
           <Route path="settings" element={<SystemSettings />} />
           {/* Tenant Routes */}
           <Route path="projects" element={<ProjectList />} />
           <Route path="evaluations" element={<EvaluationList />} />
           <Route path="team" element={<TeamMemberList />} />
           <Route path="tenant-settings" element={<TenantSettings />} />
           {/* Add more nested routes as needed */}
        </Route>

         {/* Redirect unknown paths */}
         <Route path="*" element={<Navigate to={session ? "/dashboard" : "/"} replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
