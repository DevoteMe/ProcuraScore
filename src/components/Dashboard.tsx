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
    console.log(`[Dashboard] useEffect triggered. AuthLoading: ${authLoading}, User: ${user?.id}`);
    // Only fetch data if auth is not loading and user is logged in
    if (!authLoading && user) {
      const fetchData = async () => {
        console.log("[Dashboard] fetchData started.");
        setLoadingData(true);
        try {
          // isPlatformAdmin is now directly from context
          // setProfile({ id: user.id }); // Simplified profile if needed

          let currentSelectedTenantId = selectedTenantId; // Store current selection

          if (!isPlatformAdmin) {
            console.log("[Dashboard] Fetching tenant memberships for user:", user.id);
            let { data: membershipData, error: membershipError } = await supabase
              .from('tenant_memberships')
              .select('tenant_id, role')
              .eq('user_id', user.id); // Use user.id from context

            if (membershipError) throw membershipError;
            const fetchedMemberships = membershipData || [];
            setMemberships(fetchedMemberships);
            console.log("[Dashboard] Fetched memberships:", fetchedMemberships);

            // Auto-select tenant logic
            if ((!currentSelectedTenantId || !fetchedMemberships.some(m => m.tenant_id === currentSelectedTenantId)) && fetchedMemberships.length > 0) {
              currentSelectedTenantId = fetchedMemberships[0].tenant_id;
              setSelectedTenantId(currentSelectedTenantId);
              console.log("[Dashboard] Auto-selected tenant:", currentSelectedTenantId);
            } else if (fetchedMemberships.length === 0) {
              setSelectedTenantId(null);
              currentSelectedTenantId = null;
              console.log("[Dashboard] No memberships found, selectedTenantId set to null.");
            } else {
              setSelectedTenantId(currentSelectedTenantId); // Keep valid selection
              console.log("[Dashboard] Kept existing selected tenant:", currentSelectedTenantId);
            }

          } else {
            // Platform admin doesn't belong to a specific tenant in this context
            setMemberships([]);
            setSelectedTenantId(null);
            currentSelectedTenantId = null;
            console.log("[Dashboard] User is Platform Admin, clearing memberships and selectedTenantId.");
          }

          // --- Fetch or Set Mock Stats ---
          if (isPlatformAdmin) {
            // TODO: Replace with actual API calls for platform stats
            setPlatformStats({ totalTenants: 15, totalUsers: 120, activeProjects: 55 });
            console.log("[Dashboard] Set mock platform stats.");
          } else if (currentSelectedTenantId) {
            // TODO: Replace with actual API calls for the selected tenant's stats
            setTenantStats({ activeProjects: 5, pendingTasks: 3, teamMembers: 8 });
            console.log("[Dashboard] Set mock tenant stats for tenant:", currentSelectedTenantId);
          }
          // --- End Fetch/Set Stats ---

        } catch (error: any) {
          console.error('[Dashboard] Error fetching dashboard data:', error.message);
          // Reset state on error?
          setMemberships([]);
          setSelectedTenantId(null);
        } finally {
          setLoadingData(false);
          console.log("[Dashboard] fetchData finished, setLoadingData(false).");
        }
      };

      fetchData();
    } else if (!authLoading && !user) {
      // If auth is done loading and there's no user, clear dashboard data
      console.log("[Dashboard] Auth loaded but no user, clearing state and setting loadingData false.");
      setMemberships([]);
      setSelectedTenantId(null);
      setLoadingData(false); // Ensure loadingData is false if there's no user
    } else {
       console.log("[Dashboard] Skipping data fetch (Auth Loading or No User).");
       // If auth is loading, we might want to ensure data loading is true?
       // Or rely on the initial state. Let's keep it simple for now.
       // If authLoading is true, the outer loading check handles it.
    }
  // Re-run useEffect if auth state changes (user, isPlatformAdmin) or selectedTenantId changes
  // Added authLoading dependency to ensure fetch runs when auth finishes loading
  }, [user, isPlatformAdmin, selectedTenantId, authLoading]);

  const handleLogout = async () => {
    console.log("[Dashboard] handleLogout called.");
    await signOut(); // Use signOut from context
    // Redirect logic is handled by ProtectedRoute based on session state change
  };

  const switchTenant = (tenantId: string) => {
    console.log("[Dashboard] Switching tenant to:", tenantId);
    setSelectedTenantId(tenantId);
    // Data refetches via useEffect dependency change
  };

  // Log state right before rendering checks
  console.log(`[Dashboard] Rendering check: AuthLoading: ${authLoading}, LoadingData: ${loadingData}, User: ${user?.id}`);

  // Show loading indicator based on auth loading OR dashboard data loading
  if (authLoading || loadingData) {
    console.log("[Dashboard] Rendering: Loading Indicator");
    return <div className="flex justify-center items-center min-h-screen">Loading dashboard...</div>;
  }

  // If auth is loaded but there's no user (e.g., after logout before redirect)
  // This condition might be hit briefly after logout before ProtectedRoute redirects.
  if (!user) {
     console.log("[Dashboard] Rendering: Not Logged In Message");
     // Or redirect logic could be handled in App.tsx/ProtectedRoute
     return <div className="flex justify-center items-center min-h-screen">Not logged in.</div>;
  }

  // Determine the current role for the selected tenant
  const tenantRole = memberships.find(m => m.tenant_id === selectedTenantId)?.role;
  console.log(`[Dashboard] Determined tenantRole: ${tenantRole} for selectedTenantId: ${selectedTenantId}`);

  // Prepare context for Outlet
  const outletContextValue: DashboardOutletContext = {
    isPlatformAdmin,
    selectedTenantId,
    tenantRole,
    // Pass stats if needed by children, otherwise remove
    // platformStats,
    // tenantStats,
  };
  console.log("[Dashboard] Prepared Outlet context:", outletContextValue);


  console.log("[Dashboard] Rendering: Main Layout");
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
           {/* --- DEBUGGING: Temporarily replace Outlet --- */}
           <div className="p-6 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded">
             Outlet Content Placeholder - If you see this and NO error, the issue is in the Outlet component (e.g., DashboardOverview or AdminPanel).
           </div>
           {/* <Outlet context={outletContextValue} /> */}
           {/* --- END DEBUGGING --- */}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
