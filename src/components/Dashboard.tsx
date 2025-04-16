import React, { useState, useEffect, useMemo } from 'react'; // Import useMemo
import { Outlet, useOutletContext } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Button } from './ui/button';
import Sidebar from './Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, Building, FolderKanban, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Define the context type expected by child routes via Outlet
interface DashboardOutletContext {
  isPlatformAdmin: boolean;
  selectedTenantId: string | null;
  tenantRole?: string;
  platformStats: { totalTenants: number, totalUsers: number, activeProjects: number };
  tenantStats: { activeProjects: number, pendingTasks: number, teamMembers: number };
}


const Dashboard: React.FC = () => {
  const { session, user, isPlatformAdmin, loading: authLoading, signOut } = useAuth();
  const [loadingData, setLoadingData] = useState(true);
  const [memberships, setMemberships] = useState<{ tenant_id: string; role: string }[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  const [platformStats, setPlatformStats] = useState({ totalTenants: 0, totalUsers: 0, activeProjects: 0 });
  const [tenantStats, setTenantStats] = useState({ activeProjects: 0, pendingTasks: 0, teamMembers: 0 });

  useEffect(() => {
    console.log(`[Dashboard] useEffect triggered. AuthLoading: ${authLoading}, User: ${user?.id}`);
    if (!authLoading && user) {
      const fetchData = async () => {
        console.log("[Dashboard] fetchData started.");
        setLoadingData(true);
        try {
          let currentSelectedTenantId = selectedTenantId;

          if (!isPlatformAdmin) {
            console.log("[Dashboard] Fetching tenant memberships for user:", user.id);
            let { data: membershipData, error: membershipError } = await supabase
              .from('tenant_memberships')
              .select('tenant_id, role')
              .eq('user_id', user.id);

            if (membershipError) throw membershipError;
            const fetchedMemberships = membershipData || [];
            setMemberships(fetchedMemberships);
            console.log("[Dashboard] Fetched memberships:", fetchedMemberships);

            if ((!currentSelectedTenantId || !fetchedMemberships.some(m => m.tenant_id === currentSelectedTenantId)) && fetchedMemberships.length > 0) {
              currentSelectedTenantId = fetchedMemberships[0].tenant_id;
              setSelectedTenantId(currentSelectedTenantId);
              console.log("[Dashboard] Auto-selected tenant:", currentSelectedTenantId);
            } else if (fetchedMemberships.length === 0) {
              setSelectedTenantId(null);
              currentSelectedTenantId = null;
              console.log("[Dashboard] No memberships found, selectedTenantId set to null.");
            } else {
              setSelectedTenantId(currentSelectedTenantId);
              console.log("[Dashboard] Kept existing selected tenant:", currentSelectedTenantId);
            }

          } else {
            setMemberships([]);
            setSelectedTenantId(null);
            currentSelectedTenantId = null;
            console.log("[Dashboard] User is Platform Admin, clearing memberships and selectedTenantId.");
          }

          // Fetch or Set Mock Stats
          if (isPlatformAdmin) {
            // TODO: Replace with actual API calls
            const stats = { totalTenants: 15, totalUsers: 120, activeProjects: 55 };
            setPlatformStats(stats); // Update state
            console.log("[Dashboard] Set mock platform stats:", stats);
          } else if (currentSelectedTenantId) {
            // TODO: Replace with actual API calls
            const stats = { activeProjects: 5, pendingTasks: 3, teamMembers: 8 };
            setTenantStats(stats); // Update state
            console.log("[Dashboard] Set mock tenant stats for tenant:", currentSelectedTenantId, stats);
          } else {
             // Reset stats if no tenant selected and not admin
             setTenantStats({ activeProjects: 0, pendingTasks: 0, teamMembers: 0 });
          }

        } catch (error: any) {
          console.error('[Dashboard] Error fetching dashboard data:', error.message);
          setMemberships([]);
          setSelectedTenantId(null);
          setPlatformStats({ totalTenants: 0, totalUsers: 0, activeProjects: 0 });
          setTenantStats({ activeProjects: 0, pendingTasks: 0, teamMembers: 0 });
        } finally {
          setLoadingData(false);
          console.log("[Dashboard] fetchData finished, setLoadingData(false).");
        }
      };

      fetchData();
    } else if (!authLoading && !user) {
      console.log("[Dashboard] Auth loaded but no user, clearing state and setting loadingData false.");
      setMemberships([]);
      setSelectedTenantId(null);
      setPlatformStats({ totalTenants: 0, totalUsers: 0, activeProjects: 0 });
      setTenantStats({ activeProjects: 0, pendingTasks: 0, teamMembers: 0 });
      setLoadingData(false);
    } else {
       console.log("[Dashboard] Skipping data fetch (Auth Loading or No User).");
    }
  }, [user, isPlatformAdmin, selectedTenantId, authLoading]); // Keep dependencies as they are

  const handleLogout = async () => {
    console.log("[Dashboard] handleLogout called.");
    await signOut();
  };

  const switchTenant = (tenantId: string) => {
    console.log("[Dashboard] Switching tenant to:", tenantId);
    setSelectedTenantId(tenantId);
  };

  console.log(`[Dashboard] Rendering check: AuthLoading: ${authLoading}, LoadingData: ${loadingData}, User: ${user?.id}`);

  if (authLoading || loadingData) {
    console.log("[Dashboard] Rendering: Loading Indicator");
    return <div className="flex justify-center items-center min-h-screen">Loading dashboard...</div>;
  }

  if (!user) {
     console.log("[Dashboard] Rendering: Not Logged In Message");
     return <div className="flex justify-center items-center min-h-screen">Not logged in.</div>;
  }

  // Determine the current role for the selected tenant
  const tenantRole = memberships.find(m => m.tenant_id === selectedTenantId)?.role;
  console.log(`[Dashboard] Determined tenantRole: ${tenantRole} for selectedTenantId: ${selectedTenantId}`);

  // Prepare context for Outlet using useMemo to stabilize the object reference
  const outletContextValue = useMemo(() => {
    const contextData = {
      isPlatformAdmin,
      selectedTenantId,
      tenantRole,
      platformStats, // Pass platform stats state
      tenantStats,   // Pass tenant stats state
    };
    // console.log("[Dashboard] Recalculating Outlet context:", contextData); // Optional: Log only when it recalculates
    return contextData;
  // Dependencies: Recalculate only when these specific values change
  }, [isPlatformAdmin, selectedTenantId, tenantRole, platformStats, tenantStats]);

  console.log("[Dashboard] Providing Outlet context (memoized):", outletContextValue);


  console.log("[Dashboard] Rendering: Main Layout");
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 border-b bg-background">
          <div>
            {isPlatformAdmin ? (
              <h1 className="text-xl font-semibold">Platform Admin Dashboard</h1>
            ) : memberships.length > 1 ? (
              <select
                  value={selectedTenantId || ''}
                  onChange={(e) => switchTenant(e.target.value)}
                  className="p-2 border rounded bg-input text-foreground focus:ring-primary focus:border-primary"
                  aria-label="Switch Tenant"
              >
                  {memberships.map(mem => (
                      <option key={mem.tenant_id} value={mem.tenant_id}>
                          Tenant: {mem.tenant_id.substring(0, 8)}...
                      </option>
                  ))}
              </select>
            ) : memberships.length === 1 ? (
               <h1 className="text-xl font-semibold">Tenant: {memberships[0].tenant_id.substring(0, 8)}...</h1>
            ) : !isPlatformAdmin ? (
               <h1 className="text-xl font-semibold text-destructive">No Tenant Assigned</h1>
            ) : null
            }
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user.email}</span>
            <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
           <Outlet context={outletContextValue} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
