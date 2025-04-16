import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Building, DollarSign, BadgePercent, ListOrdered, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // For log filters
import { Button } from "@/components/ui/button"; // For log filters

const AdminDashboardPage: React.FC = () => {

  // Placeholder data (replace with actual data fetching later)
  const platformStats = {
    totalUsers: 150,
    totalTenants: 45,
    totalRevenue: 12500.50,
    licenseCounts: { one_time: 20, sub_tier1: 15, sub_tier2: 10 },
    ongoingSales: 0,
  };

  const logFilters = ['1 hour', '1 day', '3 days', '1 week', '2 weeks', '1 month'];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats.totalUsers}</div>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats.totalTenants}</div>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 {/* Format currency later */}
                 <div className="text-2xl font-bold">{platformStats.totalRevenue.toFixed(2)} NOK</div>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">License Counts</CardTitle>
                <ListOrdered className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="text-xs">
                 <p>One-Time: {platformStats.licenseCounts.one_time}</p>
                 <p>Tier 1: {platformStats.licenseCounts.sub_tier1}</p>
                 <p>Tier 2: {platformStats.licenseCounts.sub_tier2}</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ongoing Sales</CardTitle>
                <BadgePercent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 {/* Placeholder - logic needed */}
                 <div className="text-2xl font-bold">{platformStats.ongoingSales}%</div>
              </CardContent>
          </Card>
      </div>

      {/* Revenue Chart Placeholder */}
      <Card>
         <CardHeader>
             <CardTitle>Revenue Overview</CardTitle>
             <CardDescription>Monthly revenue trend (Placeholder).</CardDescription>
         </CardHeader>
         <CardContent className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
             <p className="text-muted-foreground">[Revenue Chart Placeholder]</p>
         </CardContent>
      </Card>

      {/* Logs Section */}
      <div>
          <h2 className="text-2xl font-semibold mb-3">System Logs</h2>
          <div className="flex items-center gap-4 mb-4">
                <p className="text-sm text-muted-foreground">Filter by time:</p>
                { /* Replace Select with Buttons if preferred */ }
                <Select defaultValue="1 day">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                        {logFilters.map(filter => (
                           <SelectItem key={filter} value={filter}>{filter}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline">Refresh Logs</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Placeholder Log Cards */}
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                       <FileText className="h-4 w-4"/> System Logs (Last 25)
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-1">
                     <p>[Timestamp] INFO: User logged in (user_id)</p>
                     <p>[Timestamp] WARN: Tenant nearing user limit (tenant_id)</p>
                     <p>...</p>
                     <p>(Placeholder Log Data)</p>
                </CardContent>
             </Card>
              <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                       <FileText className="h-4 w-4"/> Authentication Logs (Last 25)
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-1">
                     <p>[Timestamp] INFO: Login success (user@example.com)</p>
                     <p>[Timestamp] ERROR: Login failed - Invalid credentials (user@example.com)</p>
                     <p>...</p>
                     <p>(Placeholder Log Data - From Supabase Auth Logs)</p>
                </CardContent>
             </Card>
              <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                       <FileText className="h-4 w-4"/> Stripe Logs (Last 25)
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-1">
                     <p>[Timestamp] INFO: checkout.session.completed (session_id)</p>
                     <p>[Timestamp] INFO: invoice.payment_succeeded (invoice_id)</p>
                     <p>...</p>
                     <p>(Placeholder Log Data - From Webhook Events)</p>
                </CardContent>
             </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                       <FileText className="h-4 w-4"/> Audit Logs (Last 25)
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-1">
                    <p>[Timestamp] INFO: Project created (project_id, user_id)</p>
                    <p>[Timestamp] INFO: License assigned (license_id, tenant_id)</p>
                     <p>...</p>
                     <p>(Placeholder Log Data - From Supabase DB Audit)</p>
                </CardContent>
             </Card>
          </div>
      </div>

    </div>
  );
};

export default AdminDashboardPage; 