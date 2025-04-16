import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, Building, FolderKanban, Clock } from 'lucide-react';

// Define the structure of the context passed from Dashboard
// Ensure this matches the structure provided by Dashboard
interface DashboardContext {
  isPlatformAdmin: boolean;
  selectedTenantId: string | null;
  tenantRole?: 'tenant_id_admin' | 'tenant_id_user' | string; // Allow string for flexibility
  platformStats: { totalTenants: number, totalUsers: number, activeProjects: number };
  tenantStats: { activeProjects: number, pendingTasks: number, teamMembers: number };
}

const DashboardOverview: React.FC = () => {
  // Use the context provided by the Dashboard component via Outlet
  const context = useOutletContext<DashboardContext>();

  // Log the received context immediately
  console.log("[DashboardOverview] Received context:", context);

  // Handle cases where context might not be available yet (though ProtectedRoute should prevent this)
  // Also check if stats objects are present before destructuring
  if (!context || !context.platformStats || !context.tenantStats) {
    console.error("[DashboardOverview] Context or stats missing:", context);
    return <div className="p-6">Loading overview data or context missing...</div>;
  }

  // Destructure *after* checking context exists
  const { isPlatformAdmin, selectedTenantId, platformStats, tenantStats } = context;
  console.log("[DashboardOverview] Destructured context. isPlatformAdmin:", isPlatformAdmin, "selectedTenantId:", selectedTenantId);
  console.log("[DashboardOverview] Platform Stats:", platformStats);
  console.log("[DashboardOverview] Tenant Stats:", tenantStats);


  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isPlatformAdmin ? (
          // Platform Admin Stats
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {/* Check if platformStats exists before accessing properties */}
                <div className="text-2xl font-bold">{platformStats?.totalTenants ?? 'N/A'}</div>
                {/* <p className="text-xs text-muted-foreground">+2% from last month</p> */}
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats?.totalUsers ?? 'N/A'}</div>
                 {/* <p className="text-xs text-muted-foreground">+10% from last month</p> */}
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects (All)</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats?.activeProjects ?? 'N/A'}</div>
                 {/* <p className="text-xs text-muted-foreground">+5 since last week</p> */}
              </CardContent>
            </Card>
          </>
        ) : selectedTenantId ? (
          // Tenant User/Admin Stats
           <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 {/* Check if tenantStats exists before accessing properties */}
                <div className="text-2xl font-bold">{tenantStats?.activeProjects ?? 'N/A'}</div>
                 {/* <p className="text-xs text-muted-foreground">in this tenant</p> */}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenantStats?.pendingTasks ?? 'N/A'}</div>
                 {/* <p className="text-xs text-muted-foreground">across all projects</p> */}
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenantStats?.teamMembers ?? 'N/A'}</div>
                 {/* <p className="text-xs text-muted-foreground">in this tenant</p> */}
              </CardContent>
            </Card>
           </>
        ) : (
          // User is not platform admin and has no tenant selected (or belongs to none)
           <div className="col-span-full text-center text-muted-foreground py-8">
              <p>Select a tenant or join one to see relevant information.</p>
              {/* Optionally add a button/link to create/join a tenant if applicable */}
           </div>
        )}
      </div>

       {/* Placeholder for additional content */}
       <div className="mt-8 bg-card p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 text-card-foreground">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">Activity feed or quick links could go here...</p>
          {/* Example: List recent projects, notifications, etc. */}
       </div>
    </div>
  );
};

export default DashboardOverview;
