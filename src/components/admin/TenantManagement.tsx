import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext'; // To get the session token
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const fetchTenants = useCallback(async () => {
    if (!session) {
      setError("Not authenticated.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    console.log("Fetching tenants via Edge Function...");

    try {
      // Call the Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('admin-list-tenants', {
         // Functions invoked client-side are typically POST
         method: 'POST',
         headers: {
            // Pass the Authorization header for the function to verify the user
            // Content-Type is implicitly application/json by default
            Authorization: `Bearer ${session.access_token}`,
         }
         // No body needed for this function call
      });

      if (functionError) {
        console.error("Edge Function invocation error:", functionError);
        // Try to parse a more specific error from the function response if available
        let message = `Failed to invoke tenant list function: ${functionError.message}`;
        if (functionError.context && typeof functionError.context.json === 'function') {
            try {
                const errorJson = await functionError.context.json();
                message = `Function Error: ${errorJson.error || functionError.message}`;
            } catch (parseError) {
                console.error("Failed to parse error JSON from function context:", parseError);
            }
        }
        setError(message);
        setTenants([]);
      } else if (data && data.tenants) {
        console.log("Tenants fetched successfully:", data.tenants);
        setTenants(data.tenants as Tenant[]);
      } else {
         console.log("No tenants found or unexpected data structure:", data);
         setError("Received unexpected data structure from the server.");
         setTenants([]);
      }
    } catch (catchError: any) {
      console.error("Error calling Edge Function:", catchError);
      setError(`An unexpected error occurred: ${catchError.message}`);
      setTenants([]);
    } finally {
      setLoading(false);
      console.log("Finished fetching tenants.");
    }
  }, [session]); // Depend on session

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]); // Fetch when the function reference changes (effectively on session change)

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
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-semibold">Tenant Management</h1>
         <Button onClick={handleCreateTenant}>Create New Tenant</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenant List</CardTitle>
          <CardDescription>View and manage all customer tenants.</CardDescription>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          {loading && <p>Loading tenants...</p>}
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
                {tenants.length > 0 ? (
                  tenants.map((tenant) => (
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
                        >
                          View Details
                        </Button>
                        {/* Add other actions like Edit, Delete (with confirmation) later */}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No tenants found.
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