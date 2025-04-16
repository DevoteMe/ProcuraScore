import React, { useState, useEffect } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom'; // Import Outlet and useOutletContext
import { supabase } from '../lib/supabaseClient';
// import { Session } from '@supabase/supabase-js'; // No longer needed directly if using context
import { Button } from './ui/button';
import Sidebar from './Sidebar'; // Import the Sidebar
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, Building, FolderKanban, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

// Define the context type expected by child routes via Outlet
interface DashboardOutletContext {
  isPlatformAdmin: boolean;
  selectedTenantId: string | null;
  tenantRole?: string; // Use string for flexibility or refine based on actual roles
  // Pass stats down if needed, or fetch them within the specific child component (e.g., DashboardOverview)
  // platformStats: { totalTenants: number, totalUsers: number, activeProjects: number };
  // tenantStats: { activeProjects: number, pendingTasks: number, teamMembers: number };
}


const Dashboard: React.FC = () => {
  const { session, user, isPlatformAdmin, loading: authLoading, signOut } = useAuth(); // Get auth state from context
  const [loadingData, setLoadingData] = useState(true); // Separate loading state for dashboard data
  // const [profile, setProfile] = useState<UserProfile | null>(null); // Keep if needed for non-auth profile data
  const [memberships, setMemberships] = useState<{ tenant_id: string; role: string }[]>([]); // Use simpler type inline
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  // const [tenantRole, setTenantRole] = useState<string | undefined>(undefined); // Role derived from memberships

  // --- Mock Data for Stats - Consider moving this to DashboardOverview or fetching real data ---
  const [platformStats, setPlatformStats] = useState({ totalTenants: 0, totalUsers: 0, activeProjects: 0 });
  const [tenantStats, setTenantStats] = useState({ activeProjects: 0, pendingTasks: 0, teamMembers: 0 });
  // --- End Mock Data ---

  useEffect(() => {
    // Only fetch data if auth is not loading and user is logged in
    if (!authLoading && user) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          // isPlatformAdmin is now directly from context
          // setProfile({ id: user.id }); // Simplified profile if needed

          let currentSelectedTenantId = selectedTenantId; // Store current selection

          if (!isPlatformAdmin) {
            let { data: membershipData, error: membershipError } = await supabase
              .from('tenant_memberships')
              .select('tenant_id, role')
              .eq('user_id', user.id); // Use user.id from context

            if (membershipError) throw membershipError;
            const fetchedMemberships = membershipData || [];
            setMemberships(fetchedMemberships);

            // Auto-select tenant logic
            if ((!currentSelectedTenantId || !fetchedMemberships.some(m => m.tenant_id === currentSelectedTenantId)) && fetchedMemberships.length > 0) {
              currentSelectedTenantId = fetchedMemberships[0].tenant_id;
              setSelectedTenantId(currentSelectedTenantId);
            } else if (fetchedMemberships.length === 0) {
              setSelectedTenantId(null);
              currentSelectedTenantId = null;
            } else {
              setSelectedTenantId(currentSelectedTenantId); // Keep valid selection
            }

          } else {
            // Platform admin doesn't belong to a specific tenant in this context
            setMemberships([]);
            setSelectedTenantId(null);
            currentSelectedTenantId = null;
          }

          // --- Fetch or Set Mock Stats ---
          if (isPlatformAdmin) {
            // TODO: Replace with actual API calls for platform stats
            setPlatformStats({ totalTenants: 15, totalUsers: 120, activeProjects: 55 });
          } else if (currentSelectedTenantId) {
            // TODO: Replace with actual API calls for the selected tenant's stats
            setTenantStats({ activeProjects: 5, pendingTasks: 3, teamMembers: 8 });
          }
          // --- End Fetch/Set Stats ---

        } catch (error: any) {
          console.error('Error fetching dashboard data:', error.message);
          // Reset state on error?
          setMemberships([]);
          setSelectedTenantId(null);
        } finally {
          setLoadingData(false);
        }
      };

      fetchData();
    } else if (!authLoading && !user) {
      // If auth is done loading and there's no user, clear dashboard data
      setMemberships([]);
      setSelectedTenantId(null);
      setLoadingData(false);
    }
  // Re-run useEffect if auth state changes (user, isPlatformAdmin) or selectedTenantId changes
  }, [user, isPlatformAdmin, selectedTenantId, authLoading]);

  const handleLogout = async () => {
    await signOut(); // Use signOut from context
  };

  const switchTenant = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    // Data refetches via useEffect dependency change
  };

  // Show loading indicator based on auth loading OR dashboard data loading
  if (authLoading || loadingData) {
    return <div className="flex justify-center items-center min-h-screen">Loading dashboard...</div>;
  }

  // If auth is loaded but there's no user (e.g., after logout before redirect)
  if (!user) {
     // Or redirect logic could be handled in App.tsx/ProtectedRoute
     return <div className="flex justify-center items-center min-h-screen">Not logged in.</div>;
  }

  // Determine the current role for the selected tenant
  const tenantRole = memberships.find(m => m.tenant_id === selectedTenantId)?.role;

  // Prepare context for Outlet
  const outletContextValue: DashboardOutletContext = {
    isPlatformAdmin,
    selectedTenantId,
    tenantRole,
    // Pass stats if needed by children, otherwise remove
    // platformStats,
    // tenantStats,
  };


  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar now relies on AuthContext directly */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b bg-background">
          {/* Tenant Switcher or Admin Title */}
          <div>
            {isPlatformAdmin ? (
              <h1 className="text-xl font-semibold">Platform Admin Dashboard</h1>
            ) : memberships.length > 1 ? (
              <select
                  value={selectedTenantId || ''}
                  onChange={(e) => switchTenant(e.target.value)}
                  className="p-2 border rounded bg-input text-foreground focus:ring-primary focus:border-primary" // Adjusted styling
                  aria-label="Switch Tenant"
              >
                  {memberships.map(mem => (
                      <option key={mem.tenant_id} value={mem.tenant_id}>
                          {/* TODO: Fetch and display actual tenant names */}
                          Tenant: {mem.tenant_id.substring(0, 8)}...
                      </option>
                  ))}
              </select>
            ) : memberships.length === 1 ? (
               <h1 className="text-xl font-semibold">Tenant: {memberships[0].tenant_id.substring(0, 8)}...</h1> // TODO: Fetch name
            ) : !isPlatformAdmin ? (
               <h1 className="text-xl font-semibold text-destructive">No Tenant Assigned</h1> // Handle no tenant case
            ) : null /* Platform admin doesn't need tenant title if no switcher */
            }
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user.email}</span>
            <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
          </div>
        </header>

        {/* Page Content - Render the matched nested route component here */}
        <main className="flex-1 overflow-y-auto bg-muted/40 p-6"> {/* Added padding */}
           {/* Outlet renders the component matched by the nested route */}
           {/* Pass context down to nested routes */}
           <Outlet context={outletContextValue} />
        </main>
      </div>
    </div>
  );
};

// Removed the problematic block comment that contained the DashboardOverview example

export default Dashboard;
