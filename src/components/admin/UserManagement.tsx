import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js'; // Use Supabase User type
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext'; // To get the session token

// Define a more specific type for the user data we expect from the Edge Function
// Adjust based on what your Edge Function actually returns (especially if enriching with profiles)
interface ManagedUser extends User {
  // Add profile fields if your Edge Function includes them
  // profile?: {
  //   full_name?: string | null;
  //   avatar_url?: string | null;
  //   tenant_id?: string | null;
  // } | null;
}

const UserManagement: React.FC = () => {
  const { session } = useAuth(); // Get session for auth token
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = useCallback(async () => {
    if (!session) {
      setError("Not authenticated.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    console.log("Fetching users via Edge Function...");

    try {
      // Call the Edge Function instead of a direct table query
      const { data, error: functionError } = await supabase.functions.invoke('admin-list-users', {
        headers: {
          // Pass the Authorization header for the function to verify the user
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (functionError) {
        console.error("Edge Function invocation error:", functionError);
        // Try to parse the error response from the function
        let message = `Failed to invoke user list function: ${functionError.message}`;
        if (functionError.context && functionError.context.json) {
           message = `Function Error: ${functionError.context.json.error || functionError.message}`;
        } else if (typeof functionError === 'object' && functionError !== null && 'message' in functionError) {
           message = `Function Error: ${functionError.message}`;
        }
        setError(message);
        setUsers([]);
      } else if (data && data.users) {
        console.log("Users fetched successfully:", data.users);
        // Ensure the data matches the ManagedUser structure
        // You might need casting or mapping if the function returns a different shape
        setUsers(data.users as ManagedUser[]);
      } else {
        console.log("No users found or unexpected data structure:", data);
        setError("Received unexpected data from the server.");
        setUsers([]);
      }
    } catch (catchError: any) {
      console.error("Error calling Edge Function:", catchError);
      setError(`An unexpected error occurred: ${catchError.message}`);
      setUsers([]);
    } finally {
      setLoading(false);
      console.log("Finished fetching users.");
    }
  }, [session]); // Depend on session

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Fetch when the function reference changes (effectively on session change)

  // --- Action Handlers (Placeholders - Implement actual logic later) ---
  const handleInviteUser = () => {
    alert('Invite New User functionality not yet implemented.');
    // TODO: Implement modal/form for inviting a new user (likely calls supabase.auth.admin.inviteUserByEmail via another Edge Function)
  };

  const handleEditUser = (userId: string) => {
    alert(`Edit User ${userId} functionality not yet implemented.`);
    // TODO: Implement editing logic (e.g., navigate to edit page or open modal)
    // This will likely require another Edge Function to update user details/metadata/profile
  };

  const handleToggleUserStatus = async (user: ManagedUser) => {
     // Activation/Deactivation usually involves updating user metadata or potentially using specific auth admin functions
     // This requires another Edge Function.
     alert(`Toggle status for ${user.email} not yet implemented. Requires an Edge Function.`);
     // Example concept for Edge Function call:
     /*
     const newStatus = user.raw_user_meta_data?.status === 'active' ? 'inactive' : 'active';
     const confirmation = confirm(`Are you sure you want to set user "${user.email}" to ${newStatus}?`);
     if (confirmation) {
       setLoading(true);
       try {
         const { error: updateError } = await supabase.functions.invoke('admin-update-user-status', {
           body: { userId: user.id, status: newStatus },
           headers: { Authorization: `Bearer ${session.access_token}` }
         });
         if (updateError) throw updateError;
         // Refresh user list on success
         fetchUsers();
       } catch (err) {
         setError(`Failed to update status: ${err.message}`);
       } finally {
         setLoading(false);
       }
     }
     */
  };

   const handleDeleteUser = async (user: ManagedUser) => {
     // Deleting users requires supabase.auth.admin.deleteUser and MUST be done via an Edge Function
     alert(`Delete user ${user.email} not yet implemented. Requires an Edge Function.`);
     // Example concept:
     /*
     const confirmation = confirm(`Are you sure you want to PERMANENTLY DELETE user "${user.email}"? This cannot be undone.`);
     if (confirmation) {
       setLoading(true);
       try {
         const { error: deleteError } = await supabase.functions.invoke('admin-delete-user', {
           body: { userId: user.id },
           headers: { Authorization: `Bearer ${session.access_token}` }
         });
         if (deleteError) throw deleteError;
         // Refresh user list on success
         fetchUsers();
       } catch (err) {
         setError(`Failed to delete user: ${err.message}`);
       } finally {
         setLoading(false);
       }
     }
     */
   };


  // --- Filtering Logic ---
  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    // Add other search criteria if needed, e.g., search by name if profile data is included
    // || user.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Render Logic ---
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">User Management (All Tenants)</h1>
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>View, search, and manage all platform users.</CardDescription>
          {error && (
             <Alert variant="destructive" className="mt-4">
               <Terminal className="h-4 w-4" />
               <AlertTitle>Error</AlertTitle>
               <AlertDescription>{error}</AlertDescription>
             </Alert>
           )}
          <div className="flex justify-between items-center pt-4">
            <Input
              placeholder="Search users by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
              disabled={loading}
            />
            <Button onClick={handleInviteUser} disabled={loading}>
              Invite New User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading users...</p>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>User ID</TableHead>
                  {/* Add Tenant ID if available */}
                  {/* <TableHead>Tenant ID</TableHead> */}
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  {/* Add Subscription if available */}
                  {/* <TableHead>Subscription</TableHead> */}
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.id}</TableCell>
                      {/* Display Tenant ID if available */}
                      {/* <TableCell>{user.profile?.tenant_id || 'N/A'}</TableCell> */}
                      <TableCell>
                        {/* Display roles from metadata */}
                        {user.app_metadata?.claims_admin ? <Badge variant="secondary">Admin</Badge> : <Badge variant="outline">User</Badge>}
                        {/* Add other roles if applicable */}
                      </TableCell>
                      <TableCell>
                         {/* Status might be in metadata or inferred (e.g., email_confirmed_at) */}
                         {/* Placeholder - adapt based on how you track status */}
                         <Badge variant={user.email_confirmed_at ? 'default' : 'outline'}>
                           {user.email_confirmed_at ? 'Active' : 'Invited'}
                         </Badge>
                      </TableCell>
                      {/* Display Subscription if available */}
                      {/* <TableCell>{'N/A'}</TableCell> */}
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user.id)}
                          disabled={loading}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary" // Change variant based on action needed
                          size="sm"
                          onClick={() => handleToggleUserStatus(user)}
                          disabled={loading}
                        >
                          {/* Change text based on current status */}
                          Toggle Status
                        </Button>
                         <Button
                           variant="destructive"
                           size="sm"
                           onClick={() => handleDeleteUser(user)}
                           disabled={loading}
                         >
                           Delete
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center"> {/* Adjust colSpan based on visible columns */}
                      No users found{searchTerm ? ' matching your search' : ''}.
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

export default UserManagement;
