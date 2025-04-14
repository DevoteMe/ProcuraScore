import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom'; // Import Outlet
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Button } from './ui/button';
// import AdminPanel from './admin/AdminPanel'; // Keep for potential detailed views
// import TenantDashboard from './tenant/TenantDashboard'; // Keep for potential detailed views
import Sidebar from './Sidebar'; // Import the Sidebar
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'; // Import Card components
import { Users, Building, FolderKanban, Clock } from 'lucide-react'; // Icons for stats

interface DashboardProps {
  session: Session;
}

// Keep UserProfile and TenantMembership interfaces as they might be needed later
interface UserProfile {
  id: string;
  // Add other profile fields like full_name, avatar_url etc.
}

interface TenantMembership {
    tenant_id: string;
    role: 'tenant_id_admin' | 'tenant_id_user';
    // Add other membership details if needed
}

const Dashboard: React.FC<DashboardProps> = ({ session }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null); // Keep profile state if needed later
  const [memberships, setMemberships] = useState<TenantMembership[]>([]);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [tenantRole, setTenantRole] = useState<'tenant_id_admin' | 'tenant_id_user' | undefined>(undefined);

  // --- Mock Data for Stats ---
  const [platformStats, setPlatformStats] = useState({ totalTenants: 0, totalUsers: 0, activeProjects: 0 });
  const [tenantStats, setTenantStats] = useState({ activeProjects: 0, pendingTasks: 0, teamMembers: 0 });
  // --- End Mock Data ---

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const isAdmin = session.user.app_metadata?.claims_admin === true || session.user.user_metadata?.is_platform_admin === true;
        setIsPlatformAdmin(isAdmin);
        setProfile({ id: session.user.id }); // Simplified profile

        let currentSelectedTenantId = selectedTenantId; // Store current selection

        if (!isAdmin) {
          let { data: membershipData, error: membershipError } = await supabase
            .from('tenant_memberships')
            .select('tenant_id, role')
            .eq('user_id', session.user.id);

          if (membershipError) throw membershipError;
          const fetchedMemberships = membershipData || [];
          setMemberships(fetchedMemberships);

          // If no tenant is selected OR the selected tenant is no longer valid, select the first one
          if ((!currentSelectedTenantId || !fetchedMemberships.some(m => m.tenant_id === currentSelectedTenantId)) && fetchedMemberships.length > 0) {
            currentSelectedTenantId = fetchedMemberships[0].tenant_id;
            setSelectedTenantId(currentSelectedTenantId);
          } else if (fetchedMemberships.length === 0) {
            // Handle case where user is not part of any tenant
             setSelectedTenantId(null);
             currentSelectedTenantId = null;
          } else {
             // Ensure selectedTenantId is kept if it's still valid
             setSelectedTenantId(currentSelectedTenantId);
          }

        } else {
           // Platform admin doesn't belong to a specific tenant in this context
           setMemberships([]);
           setSelectedTenantId(null);
           currentSelectedTenantId = null;
        }

        // Set the role for the currently selected tenant (if any)
        const currentMembership = memberships.find(m => m.tenant_id === currentSelectedTenantId);
        setTenantRole(currentMembership?.role);

        // --- Fetch or Set Mock Stats ---
        if (isAdmin) {
          // TODO: Replace with actual API calls for platform stats
          setPlatformStats({ totalTenants: 15, totalUsers: 120, activeProjects: 55 });
        } else if (currentSelectedTenantId) {
          // TODO: Replace with actual API calls for the selected tenant's stats
          setTenantStats({ activeProjects: 5, pendingTasks: 3, teamMembers: 8 });
        }
        // --- End Fetch/Set Stats ---

      } catch (error: any) {
        console.error('Error fetching user data:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  // Re-run useEffect if the session changes or the selected tenant changes
  // Removed 'memberships' from dependency array to avoid potential loops if state updates trigger refetch which updates state.
  // Let tenant switching handle the refetch logic via selectedTenantId change.
  }, [session, selectedTenantId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // AuthProvider's onAuthStateChange will handle redirect
  };

  const switchTenant = (tenantId: string) => {
      setSelectedTenantId(tenantId);
      // Stats and potentially other data will refetch via useEffect
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading dashboard...</div>;
  }

  // Determine the current role for the sidebar based on selected tenant
  const sidebarRole = isPlatformAdmin ? undefined : memberships.find(m => m.tenant_id === selectedTenantId)?.role;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar isPlatformAdmin={isPlatformAdmin} tenantRole={sidebarRole} />

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
                  className="p-2 border rounded bg-background text-foreground focus:ring-primary focus:border-primary"
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
               <h1 className="text-xl font-semibold">Tenant: {memberships[0].tenant_id.substring(0, 8)}...</h1>
            ) : (
               <h1 className="text-xl font-semibold">Dashboard</h1>
            )}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {session.user.email}</span>
            <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
          </div>
        </header>

        {/* Page Content - Render the matched nested route component here */}
        <main className="flex-1 overflow-y-auto bg-muted/40">
           {/* Outlet renders the component matched by the nested route in App.tsx */}
           <Outlet context={{ isPlatformAdmin, selectedTenantId, tenantRole: sidebarRole, platformStats, tenantStats }} />
           {/* Pass context to nested routes if needed */}
        </main>
      </div>
    </div>
  );
};

// Example of how a nested route component can access context (optional)
/*
import { useOutletContext } from 'react-router-dom';

interface DashboardContext {
  isPlatformAdmin: boolean;
  selectedTenantId: string | null;
  tenantRole?: 'tenant_id_admin' | 'tenant_id_user';
  platformStats: { totalTenants: number, totalUsers: number, activeProjects: number };
  tenantStats: { activeProjects: number, pendingTasks: number, teamMembers: number };
}

const DashboardOverview = () => {
  const context = useOutletContext<DashboardContext>();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {context.isPlatformAdmin ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{context.platformStats.totalTenants}</div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{context.platformStats.totalUsers}</div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects (All)</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{context.platformStats.activeProjects}</div>
              </CardContent>
            </Card>
          </>
        ) : context.selectedTenantId ? (
           <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{context.tenantStats.activeProjects}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{context.tenantStats.pendingTasks}</div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{context.tenantStats.teamMembers}</div>
              </CardContent>
            </Card>
           </>
        ) : (
           <div className="col-span-full text-center text-muted-foreground">
              <p>Select a tenant or join one to see relevant information.</p>
           </div>
        )}
      </div>
       <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Additional Overview Content</h3>
          <p>More summary details, charts, or quick actions can go here.</p>
       </div>
    </div>
  );
};
*/


export default Dashboard;
