import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tenant } from '@/types'; // Assuming a Tenant type exists or create one

// Define Tenant type if not already defined elsewhere
// import { Tenant } from '@/types';
// Or define inline:
// interface Tenant {
//   id: string;
//   name: string;
//   created_at: string;
//   status: 'active' | 'disabled'; // Assuming a status field
//   // Add other relevant fields
// }


const TenantList: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // TODO: Implement Create/Update/Disable functionality
  // const [showCreateModal, setShowCreateModal] = useState(false);
  // const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true);
      setError(null);
      try {
        // Platform Admins likely need to bypass RLS or use a specific view/function
        // This assumes direct access is configured or will be via an Edge Function later
        const { data, error: fetchError } = await supabase
          .from('tenants') // Assuming a 'tenants' table exists
          .select('*')
          .order('name', { ascending: true });

        if (fetchError) throw fetchError;
        setTenants(data || []);
      } catch (err: any) {
        console.error('Error fetching tenants:', err);
        setError(`Failed to fetch tenants: ${err.message}. Ensure the 'tenants' table exists and the admin role has read access.`);
        setTenants([]); // Clear tenants on error
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTenant = () => {
    // TODO: Implement tenant creation logic (likely involves a modal and an Edge Function)
    alert('Tenant creation functionality not yet implemented.');
    // setShowCreateModal(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    // TODO: Implement tenant editing logic (likely involves a modal)
    alert(`Editing tenant ${tenant.name} functionality not yet implemented.`);
    // setEditingTenant(tenant);
  };

  const handleToggleTenantStatus = async (tenant: Tenant) => {
     // TODO: Implement tenant status toggle (Disable/Enable) - Requires 'status' field and likely an Edge Function
     alert(`Toggling status for tenant ${tenant.name} functionality not yet implemented. Requires a 'status' field and backend logic.`);
     // Example:
     // const newStatus = tenant.status === 'active' ? 'disabled' : 'active';
     // const { error } = await supabase.functions.invoke('admin-manage-tenant-status', {
     //   body: { tenantId: tenant.id, status: newStatus }
     // });
     // if (error) alert(`Error: ${error.message}`);
     // else // refetch tenants
  };


  return (
    <div className="p-4 border rounded-lg bg-secondary/30 space-y-4">
      <h3 className="text-lg font-medium">Tenant Management (Feature 0.1)</h3>
       {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <Input
          type="text"
          placeholder="Search tenants by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleCreateTenant}>Create New Tenant</Button>
      </div>

      {loading ? (
        <p>Loading tenants...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tenant ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created At</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-gray-700">
              {filteredTenants.length > 0 ? filteredTenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{tenant.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{tenant.id}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tenant.status === 'active' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
                       {tenant.status || 'N/A'} {/* Display status or N/A */}
                     </span>
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{new Date(tenant.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditTenant(tenant)}>Edit</Button>
                    <Button
                       variant={tenant.status === 'active' ? 'destructive' : 'default'}
                       size="sm"
                       onClick={() => handleToggleTenantStatus(tenant)}
                       disabled={!tenant.status} // Disable if status field doesn't exist
                     >
                       {tenant.status === 'active' ? 'Disable' : 'Enable'}
                     </Button>
                  </td>
                </tr>
              )) : (
                 <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-muted-foreground">
                        {tenants.length === 0 && !loading ? 'No tenants found.' : 'No tenants match your search.'}
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TODO: Add Modals for Create/Edit Tenant */}
      {/* {showCreateModal && <CreateTenantModal onClose={() => setShowCreateModal(false)} />} */}
      {/* {editingTenant && <EditTenantModal tenant={editingTenant} onClose={() => setEditingTenant(null)} />} */}
    </div>
  );
};

export default TenantList;
