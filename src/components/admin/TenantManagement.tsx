import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext'; // To get the session token
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Import Input

// Define a type for the tenant data we expect from the Edge Function
interface Tenant {
  id: string;
  name: string;
  created_at: string;
  stripe_customer_id?: string | null;
}

const TenantManagement: React.FC = () => {
  const { session } = useAuth(); // Get session for auth token
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  const fetchTenants = useCallback(async () => {
    // Auth bypass is now handled within the Edge Function itself
    setLoading(true);
    setError(null);
    console.log("Fetching tenants via Edge Function...");

    const headers: HeadersInit = {
       'Content-Type': 'application/json',
    };
    // Only add auth header if session exists (for future use)
    if (session) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    try {
      const { data, error: functionError } = await supabase.functions.invoke('admin-list-tenants', {
         method: 'POST',
         headers: headers,
      });

      if (functionError) {
        console.error("Edge Function invocation error:", functionError);
        let message = `Failed to invoke tenant list function: ${functionError.message}`;
         if (functionError.context && typeof functionError.context.json === 'function') {
             try {
                 const errorJson = await functionError.context.json();
                 message = `Function Error: ${errorJson.error || functionError.message}`;
             } catch (parseError) {
                 console.error("Failed to parse error JSON:", parseError);
             }
         }
        setError(message);
        setTenants([]);
      } else if (data && data.tenants) {
        setTenants(data.tenants as Tenant[]);
      } else {
         setError("Received unexpected data structure from the server.");
         setTenants([]);
      }
    } catch (catchError: any) {
      setError(`An unexpected error occurred: ${catchError.message}`);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  // --- Filtering Logic ---
  const filteredTenants = tenants.filter(tenant =>
    (tenant.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    tenant.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Action Handlers (Placeholders) ---
  const handleViewTenantDetails = (tenantId: string) => {
    alert(`View details for tenant ${tenantId} - Not implemented`);
    // TODO: Navigate to a tenant detail page or open a modal
  };

  const handleCreateTenant = () => {
     alert(`Create new tenant - Not implemented`);
     // TODO: Open a modal/form to create a new tenant (requires another Edge Function)
  };

  return (
    <div className="p-6 space-y-4">
       {/* Header with Search and Create Button */}
       <div className="flex justify-between items-center gap-4">
         <h1 className="text-2xl font-semibold">Tenant Management</h1>
         <div className="flex items-center gap-2">
             <Input
                placeholder="Search tenants by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
                disabled={loading}
             />
             <Button onClick={handleCreateTenant} disabled={loading}>Create New Tenant</Button>
          </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenant List</CardTitle>
          <CardDescription>View and manage all customer tenants.</CardDescription>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error Fetching Tenants</AlertTitle> { /* Updated Title */ }
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          {loading && <p className="text-center py-4">Loading tenants...</p>} { /* Centered Loading */ }
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Tenant ID</TableHead>
                  <TableHead>Stripe Customer ID</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.length > 0 ? (
                  filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name || '(No Name)'}</TableCell>
                      <TableCell>{tenant.id}</TableCell>
                      <TableCell>{tenant.stripe_customer_id || 'N/A'}</TableCell>
                      <TableCell>{new Date(tenant.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewTenantDetails(tenant.id)}
                          disabled={loading}
                        >
                          View Details
                        </Button>
                        {/* Add other actions like Edit, Delete (with confirmation) later */}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      { /* Improved empty state message */ }
                      {loading ? '' : (searchTerm ? 'No tenants found matching your search.' : 'No tenants found.')}
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

export default TenantManagement; 