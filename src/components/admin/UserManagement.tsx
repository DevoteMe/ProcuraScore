import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
// import { User } from '@supabase/supabase-js'; // Don't extend directly if causing issues
import { useAuth } from '@/contexts/AuthContext'; // To get the session token
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

// Define the ManagedUser type explicitly with expected fields
interface ManagedUser {
  id: string;
  email?: string; // Email might be optional in some cases
  created_at: string;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  app_metadata?: { [key: string]: any; is_platform_admin?: boolean }; // Include is_platform_admin
  user_metadata?: { [key: string]: any };
  aud: string;
  // Add any other fields returned by listUsers that you need
}

const UserManagement: React.FC = () => {
  const { session } = useAuth(); // Get session for auth token
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users function using the Edge Function
  const fetchUsers = useCallback(async () => {
    // REMOVED the initial !session check that set the "Not authenticated." error
    // We will now always attempt the fetch, relying on the Edge Function
    // to handle auth (or bypass it in its own dev mode).

    setLoading(true);
    setError(null);
    console.log("Fetching users via Edge Function (dev bypass active on frontend)...");

    const headers: HeadersInit = {
       'Content-Type': 'application/json',
    };
    // Only add Authorization header if a session actually exists
    if (session) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
    } else {
        // No session exists (likely due to dev login bypass)
        console.warn("[UserManagement] No session found. Attempting fetch without Authorization header.");
    }

    try {
      // Always attempt the function invoke now
      const { data, error: functionError } = await supabase.functions.invoke('admin-list-users', {
         method: 'POST',
         headers: headers,
      });

      if (functionError) {
        console.error("Edge Function invocation error:", functionError);
        let message = `Failed to invoke user list function: ${functionError.message}`;
         if (functionError.context && typeof functionError.context.json === 'function') {
             try {
                 const errorJson = await functionError.context.json();
                 message = `Function Error: ${errorJson.error || functionError.message}`;
             } catch (parseError) {
                 console.error("Failed to parse error JSON from function context:", parseError);
             }
         }
        // Check for specific auth-related errors from the function itself
        if (message.includes('Forbidden') || message.includes('Authentication error')) {
            setError(`Access Denied by API: ${message}`);
        } else {
            setError(message);
        }
        setUsers([]);
      } else if (data && data.users) {
        console.log("Users fetched successfully:", data.users);
        setUsers(data.users as ManagedUser[]);
      } else {
        console.log("No users found or unexpected data structure:", data);
        setError("Received unexpected data structure from the server.");
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
  }, [session]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Fetch when the function reference changes (effectively on session or mount)

  // --- Action Handlers (Placeholders - Implement actual logic later) ---
  const handleImpersonateUser = (userId: string, email: string) => {
     alert(`Impersonate User ${email} (${userId}) - Not implemented. Requires Edge Function call.`);
     // TODO: Call admin-impersonate Edge function, handle response (magic link/token)
     // Potentially update AuthContext state
  };

  const handleInviteUser = () => {
    alert('Invite New User functionality not yet implemented.');
    // TODO: Implement modal/form for inviting a new user (likely calls supabase.auth.admin.inviteUserByEmail via another Edge Function)
  };

  const handleEditUser = (userId: string) => {
    alert(`Edit User ${userId} functionality not yet implemented.`);
    // TODO: Implement editing logic (e.g., navigate to edit page or open modal)
    // This will likely require another Edge Function to update user details/metadata/profile
  };

   const handleDeleteUser = async (user: ManagedUser) => {
     // Deleting users requires supabase.auth.admin.deleteUser and MUST be done via an Edge Function
     alert(`Delete user ${user.email} - Not implemented. Requires Edge Function.`);
     // Example concept:
     /*
     const confirmation = confirm(`Are you sure you want to PERMANENTLY DELETE user "${user.email}"? This cannot be undone.`);
     if (confirmation) {
       setLoading(true); // Maybe use a different loading state for delete action
       try {
         const { error: deleteError } = await supabase.functions.invoke('admin-delete-user', {
           body: { userId: user.id },
           headers: { Authorization: `Bearer ${session?.access_token}` }
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
    // Add other search criteria if needed, e.g., search by ID
    || user.id?.toLowerCase().includes(searchTerm.toLowerCase())
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
               <AlertTitle>Error Fetching Users</AlertTitle>
               <AlertDescription>{error}</AlertDescription>
             </Alert>
           )}
          <div className="flex justify-between items-center pt-4">
            <Input
              placeholder="Search users by email or ID..."
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
                  <TableHead>Status</TableHead>
                  <TableHead>Admin?</TableHead>
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
                       <TableCell>
                          {/* Infer status based on confirmation or metadata if available */}
                          <Badge variant={user.email_confirmed_at ? 'default' : 'secondary'}>
                            {user.email_confirmed_at ? 'Confirmed' : 'Invited'}
                          </Badge>
                       </TableCell>
                      <TableCell>
                        {user.app_metadata?.is_platform_admin === true ? (
                           <Badge variant="destructive">Admin</Badge>
                        ) : (
                           <Badge variant="outline">User</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right space-x-2">
                         <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleImpersonateUser(user.id, user.email || '')}
                            disabled={loading || user.app_metadata?.is_platform_admin === true} // Disable for admins
                          >
                           Impersonate
                          </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user.id)}
                          disabled={loading}
                        >
                          Edit
                        </Button>
                         <Button
                           variant="destructive"
                           size="sm"
                           onClick={() => handleDeleteUser(user)}
                           disabled={loading || user.app_metadata?.is_platform_admin === true} // Prevent deleting admins easily
                         >
                           Delete
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      {loading ? '' : (searchTerm ? 'No users found matching your search.' : 'No users found.')}
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
