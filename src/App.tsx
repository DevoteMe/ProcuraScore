import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import AuthComponent from './components/Auth';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './components/theme-provider';
import DashboardOverview from './components/DashboardOverview';
import ProjectList from './components/tenant/ProjectList';
import CreateProject from './components/tenant/CreateProject';
import AdminPanel from './components/admin/AdminPanel'; // Import AdminPanel
import ProjectDetails from './components/ProjectDetails'; // Import ProjectDetails

// Simple placeholder components for routes not yet implemented
const PlaceholderComponent: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-6"><h2 className="text-xl font-semibold">{title}</h2><p>Content for this section will be implemented soon.</p></div>
);

// Keep placeholders for routes not directly implemented in this step
// const TenantManagement = () => <PlaceholderComponent title="Tenant Management" />; // Replaced by AdminPanel section
// const UserManagement = () => <PlaceholderComponent title="User Management" />; // Replaced by AdminPanel section
const SystemSettings = () => <PlaceholderComponent title="System Settings" />; // This might be different from Platform Admin Settings
const EvaluationList = () => <PlaceholderComponent title="Evaluations" />;
const TeamMemberList = () => <PlaceholderComponent title="Team Members" />;
const TenantSettings = () => <PlaceholderComponent title="Tenant Settings" />;
// const ProjectDetails = () => <PlaceholderComponent title="Project Details" />; // No longer placeholder


function App() {
  const { session, loading, userDetails } = useAuth(); // Add userDetails from context

  // Wrap the entire app in Suspense
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div>Loading application...</div></div>}>
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
                {session ? <Dashboard key={session.user.id} session={session} /> : null}
              </ProtectedRoute>
            }
          >
            {/* Nested Routes - Rendered inside Dashboard's <Outlet /> */}
            <Route index element={<DashboardOverview />} /> {/* Default view */}

            {/* Platform Admin Route - Conditionally render AdminPanel */}
            {userDetails?.roles?.includes('Platform_Admin') && session && (
              <Route path="admin" element={<AdminPanel user={session.user} />} />
            )}
            {/* Keep other admin-related placeholders if they represent different sections */}
            {/* <Route path="users" element={<UserManagement />} /> */}
            {/* <Route path="settings" element={<SystemSettings />} /> */}


            {/* Tenant Routes */}
            <Route path="projects" element={<ProjectList />} />
            <Route path="projects/new" element={<CreateProject />} />
            <Route path="projects/:projectId" element={<ProjectDetails />} />
            <Route path="evaluations" element={<EvaluationList />} />
            <Route path="team" element={<TeamMemberList />} />
            <Route path="tenant-settings" element={<TenantSettings />} />

            {/* Fallback for unauthorized admin access or unknown dashboard routes */}
            <Route path="admin" element={!userDetails?.roles?.includes('Platform_Admin') ? <Navigate to="/dashboard" replace /> : null} />
            {/* Add more nested routes as needed */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} /> {/* Redirect unknown dashboard paths to overview */}
          </Route>

          {/* Redirect unknown top-level paths */}
          <Route path="*" element={<Navigate to={session ? "/dashboard" : "/"} replace />} />
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
