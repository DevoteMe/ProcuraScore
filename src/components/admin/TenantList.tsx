import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Tenant } from '@/types'; // Import the Tenant type
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge'; // For displaying status

const TenantList: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true);
      setError(null);
      console.log("Fetching tenants..."); // Log start

      // Fetch tenants - Ensure RLS allows platform admins to select from tenants table
      const { data, error: fetchError } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false }); // Order by creation date

      if (fetchError) {
        console.error("Error fetching tenants:", fetchError);
        setError(`Failed to fetch tenants: ${fetchError.message}`);
        setTenants([]); // Clear tenants on error
      } else if (data) {
        console.log("Tenants fetched successfully:", data);
        setTenants(data as Tenant[]); // Cast data to Tenant array
      } else {
         console.log("No tenants found or empty data returned.");
         setTenants([]); // Set empty if data is null/undefined
      }

      setLoading(false);
      console.log("Finished fetching tenants. Loading:", loading); // Log end
    };

    fetchTenants();
  }, []); // Fetch only once on component mount

  // --- Action Handlers (Placeholders) ---
  const handleCreateTenant = () => {
    alert('Create New Tenant functionality not yet implemented.');
    // TODO: Implement modal/form for creating a new tenant
  };

  const handleEditTenant = (tenantId: string) => {
    alert(`Edit Tenant ${tenantId} functionality not yet implemented.`);
    // TODO: Implement editing logic (e.g., navigate to edit page or open modal)
  };

  const handleToggleTenantStatus = async (tenant: Tenant) => {
     const newStatus = tenant.status === 'active' ? 'inactive' : 'active';
     const confirmation = confirm(`Are you sure you want to set tenant "${tenant.name}" to ${newStatus}?`);

     if (confirmation) {
       setLoading(true); // Indicate processing
       setError(null);
       console.log(`Attempting to update tenant ${tenant.id} status to ${newStatus}`);

       const { error: updateError } = await supabase
         .from('tenants')
         .update({ status: newStatus, updated_at: new Date().toISOString() })
         .eq('id', tenant.id);

       if (updateError) {
         console.error("Error updating tenant status:", updateError);
         setError(`Failed to update tenant status: ${updateError.message}`);
       } else {
         console.log(`Tenant ${tenant.id} status updated successfully to ${newStatus}`);
         // Update local state to reflect the change immediately
         setTenants(prevTenants =>
           prevTenants.map(t =>
             t.id === tenant.id ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t
           )
         );
       }
       setLoading(false);
     }
  };

  // --- Filtering Logic ---
  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Render Logic ---
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Tenant Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Tenant List</CardTitle>
          <CardDescription>View, search, and manage platform tenants.</CardDescription>
          <div className="flex justify-between items-center pt-4">
            <Input
              placeholder="Search tenants by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
              disabled={loading}
            />
            <Button onClick={handleCreateTenant} disabled={loading}>
              Create New Tenant
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading tenants...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Tenant ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.length > 0 ? (
                  filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell>{tenant.id}</TableCell>
                      <TableCell>
                        <Badge variant={tenant.status === 'active' ? 'default' : 'destructive'}>
                          {tenant.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(tenant.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTenant(tenant.id)}
                          disabled={loading} // Disable buttons during loading/updates
                        >
                          Edit
                        </Button>
                        <Button
                          variant={tenant.status === 'active' ? 'destructive' : 'secondary'}
                          size="sm"
                          onClick={() => handleToggleTenantStatus(tenant)}
                          disabled={loading} // Disable buttons during loading/updates
                        >
                          {tenant.status === 'active' ? 'Disable' : 'Enable'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No tenants found{searchTerm ? ' matching your search' : ''}.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantList;
